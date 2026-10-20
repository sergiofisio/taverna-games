import { writeFile } from 'node:fs/promises'

const API = 'https://db.ygoprodeck.com/api/v7'
const POOL_SIZE = 1000

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function getJson(url, attempt = 0) {
    const response = await fetch(url)
    if (!response.ok) {
        if (attempt < 4) {
            await sleep(2000 * (attempt + 1))
            return getJson(url, attempt + 1)
        }
        throw new Error(`${url}: HTTP ${response.status}`)
    }
    return response.json()
}

const decode = (text) => text.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
const clean = (text) => decode(text ?? '').replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').trim()
const BAN = { Banned: 0, Forbidden: 0, Limited: 1, 'Semi-Limited': 2 }
const CODE_BY_NAME = {
    'Quarter Century Secret Rare': 'QCScR', 'PLatinum Secret Rare': 'PS', 'Starfoil': 'SFR', 'Extra Secret Rare': 'EScR', 'Extra Secret': 'EScR',
    'Normal Parallel Rare': 'NPR', 'Grand Master Rare': 'GMR', "Ultra Rare (Pharaoh's Rare)": 'UR', Cr: 'CR',
}
const SUBTYPES = ['Tuner', 'Flip', 'Gemini', 'Union', 'Spirit', 'Toon']

const [{ data: en }, { data: misc }, { data: pt }, sets] = await Promise.all([
    getJson(`${API}/cardinfo.php`),
    getJson(`${API}/cardinfo.php?misc=yes`),
    getJson(`${API}/cardinfo.php?language=pt`),
    getJson(`${API}/cardsets.php`),
])
const byImage = (list) => new Map(list.flatMap((card) => [card.id, ...card.card_images.map((image) => image.id)].map((id) => [id, card])))
const ptById = byImage(pt)
const miscById = byImage(misc)

const playable = en
    .filter((card) => card.frameType !== 'skill' && card.frameType !== 'token' && card.type !== 'Token')
    .map((card) => ({ card, misc: miscById.get(card.id)?.misc_info?.[0] ?? {} }))
    .sort((a, b) => (b.misc.views ?? 0) - (a.misc.views ?? 0))

const cards = []
const texts = new Map()
const printings = new Map()
const rarityNames = new Map()
for (const { card, misc } of playable) {
    const p = ptById.get(card.id)
    const frame = card.frameType.replace('_pendulum', '')
    const kind = frame === 'spell' ? 's' : frame === 'trap' ? 't' : 'm'
    const date = misc.tcg_date ?? misc.ocg_date ?? null
    const entry = {
        id: card.id,
        n: [decode(p?.name ?? card.name), decode(card.name)],
        k: kind,
        f: frame,
        r: card.race ?? null,
    }
    if (card.frameType.endsWith('_pendulum')) entry.p = 1
    if (kind === 'm') {
        entry.a = card.attribute ?? null
        entry.l = card.linkval ?? card.level ?? 0
        entry.atk = card.atk ?? 0
        entry.def = frame === 'link' ? null : card.def ?? 0
        const subtypes = (card.typeline ?? []).filter((value) => SUBTYPES.includes(value))
        if (subtypes.length) entry.st = subtypes
        if (card.scale !== undefined) entry.sc = card.scale
        if (card.linkmarkers) entry.lm = card.linkmarkers
    }
    if (card.archetype) entry.ar = card.archetype
    const ban = BAN[card.banlist_info?.ban_tcg]
    if (ban !== undefined) entry.b = ban
    const ocg = BAN[card.banlist_info?.ban_ocg]
    if (ocg !== undefined) entry.bo = ocg
    if (date) entry.y = Number(date.slice(0, 4))
    if (!misc.tcg_date) entry.ocg = 1
    if (p) entry.pt = 1
    const alt = card.card_images.map((image) => image.id).filter((id) => id !== card.id)
    if (alt.length) entry.alt = alt
    cards.push(entry)
    texts.set(card.id, { pt: p ? clean(p.desc) : null, en: clean(card.desc) })
    for (const set of card.card_sets ?? []) {
        const code = set.set_code.split('-')[0]
        const rarity = set.set_rarity_code.replace(/[()]/g, '') || CODE_BY_NAME[set.set_rarity] || 'C'
        if (!rarityNames.has(rarity)) rarityNames.set(rarity, rarity === 'C' ? 'Common' : set.set_rarity.replace('PLatinum', 'Platinum'))
        if (!printings.has(set.set_name)) printings.set(set.set_name, new Map())
        const list = printings.get(set.set_name)
        const key = `${card.id}|${rarity}`
        if (!list.has(key)) list.set(key, { id: card.id, rarity, code, number: set.set_code })
    }
}

const setInfo = new Map(sets.map((set) => [set.set_name, set]))
const setList = [...printings.entries()]
    .map(([name, list]) => {
        const info = setInfo.get(name)
        const entries = [...list.values()].sort((a, b) => a.number.localeCompare(b.number))
        return {
            c: info?.set_code ?? entries[0].code,
            n: decode(name),
            d: info?.tcg_date ?? null,
            t: new Set(entries.map((entry) => entry.id)).size,
            cards: entries.map((entry) => [entry.id, entry.rarity]),
        }
    })
    .filter((set) => set.d && set.t > 0)
    .sort((a, b) => a.d.localeCompare(b.d) || a.n.localeCompare(b.n))

const seen = new Set()
for (const set of setList) {
    let slug = set.c.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    while (seen.has(slug)) slug += '-2'
    seen.add(slug)
    set.s = slug
}

const pool = cards
    .filter((card) => card.pt && !card.ocg && texts.get(card.id).pt)
    .slice(0, POOL_SIZE)
const poolCards = pool.map((card) => {
    const text = texts.get(card.id)
    return { ...card, tx: [text.pt, text.en] }
})

const updated = new Date().toISOString().slice(0, 10)
await writeFile('public/data/ygo.json', JSON.stringify({ updated, cards }))
await writeFile('public/data/ygo-sets.json', JSON.stringify({ updated, rarities: Object.fromEntries(rarityNames), sets: setList }))
await writeFile('public/data/ygo-pool.json', JSON.stringify({ updated, cards: poolCards }))
await writeFile('app/data/ygo-pool.json', JSON.stringify(pool.map((card) => card.id)))
console.log(`${cards.length} cartas, ${setList.length} coleções, ${pool.length} no sorteio`)
