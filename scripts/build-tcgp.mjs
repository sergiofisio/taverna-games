import { writeFile } from 'node:fs/promises'

const API = 'https://api.tcgdex.net/v2'
const LANGS = ['pt-br', 'en']
const CONCURRENCY = 8

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function getJson(url, attempt = 0) {
    const response = await fetch(url)
    if (response.status === 404) return null
    if (!response.ok) {
        if (attempt < 4) {
            await sleep(1000 * (attempt + 1))
            return getJson(url, attempt + 1)
        }
        throw new Error(`${url}: HTTP ${response.status}`)
    }
    return response.json()
}

async function mapLimit(items, limit, fn) {
    const results = new Array(items.length)
    let next = 0
    await Promise.all(Array.from({ length: limit }, async () => {
        while (next < items.length) {
            const index = next++
            results[index] = await fn(items[index], index)
        }
    }))
    return results
}

const pair = (pt, en) => [pt ?? en ?? '', en ?? pt ?? '']
const clean = (text) => (text ?? '').replace(/\s*\n\s*/g, ' ').trim()

const serie = await getJson(`${API}/en/series/tcgp`)
const setIds = serie.sets.map(({ id }) => id)

const sets = []
const cards = []
for (const setId of setIds) {
    const [pt, en] = await Promise.all(LANGS.map((lang) => getJson(`${API}/${lang}/sets/${setId}`)))
    const ids = en.cards.map(({ id }) => id)
    const details = await mapLimit(ids, CONCURRENCY, async (id) => {
        const [ptCard, enCard] = await Promise.all(LANGS.map((lang) => getJson(`${API}/${lang}/cards/${id}`)))
        return { pt: ptCard, en: enCard }
    })
    sets.push({
        id: setId,
        n: pair(pt?.name, en.name),
        date: en.releaseDate,
        official: en.cardCount.official,
        total: en.cardCount.total,
        boosters: (en.boosters ?? []).map((booster) => ({
            id: booster.id,
            n: pair(pt?.boosters?.find((other) => other.id === booster.id)?.name, booster.name),
        })),
        logo: en.logo ?? null,
    })
    for (const { pt: ptCard, en: enCard } of details) {
        if (!enCard) continue
        const p = ptCard ?? enCard
        cards.push({
            id: enCard.id,
            s: setId,
            no: enCard.localId,
            n: pair(p.name, enCard.name),
            c: enCard.category,
            hp: enCard.hp ?? null,
            ty: enCard.types ?? [],
            st: enCard.stage ?? null,
            ev: enCard.evolveFrom ? pair(p.evolveFrom, enCard.evolveFrom) : null,
            r: enCard.rarity,
            il: enCard.illustrator ?? null,
            dex: enCard.dexId ?? [],
            rt: enCard.retreat ?? null,
            wk: enCard.weaknesses?.[0]?.type ?? null,
            at: (enCard.attacks ?? []).map((attack, index) => ({
                n: pair(p.attacks?.[index]?.name, attack.name),
                cost: attack.cost ?? [],
                dmg: attack.damage ?? null,
                e: attack.effect ? pair(clean(p.attacks?.[index]?.effect), clean(attack.effect)) : null,
            })),
            ab: (enCard.abilities ?? []).map((ability, index) => ({
                n: pair(p.abilities?.[index]?.name, ability.name),
                e: pair(clean(p.abilities?.[index]?.effect), clean(ability.effect)),
            })),
            tt: enCard.trainerType ?? null,
            ef: enCard.effect ? pair(clean(p.effect), clean(enCard.effect)) : null,
            d: enCard.description ? pair(clean(p.description), clean(enCard.description)) : null,
            b: (enCard.boosters ?? []).map(({ id }) => id),
            ip: Boolean(ptCard?.image),
            ie: Boolean(enCard.image),
            ie: Boolean(enCard.image),
        })
    }
    console.log(`${setId}: ${details.length} cartas`)
}

await writeFile('public/data/tcgp.json', JSON.stringify({ updated: new Date().toISOString().slice(0, 10), sets, cards }))
const pool = cards.filter((card) => card.c === 'Pokemon' && card.ie && card.no && Number(card.no) <= (sets.find((set) => set.id === card.s)?.official ?? 0)).map((card) => card.id)
await writeFile('app/data/tcgp-pool.json', JSON.stringify(pool))
console.log(`${sets.length} coleções, ${cards.length} cartas, ${pool.length} no sorteio`)
