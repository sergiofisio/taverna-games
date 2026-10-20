import { writeFile } from 'node:fs/promises'

const CDN = 'https://ddragon.leagueoflegends.com'
const SUMMONERS_RIFT = '11'

const getJson = async (url) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
    return response.json()
}

const [version] = await getJson(`${CDN}/api/versions.json`)
const load = (locale, file) => getJson(`${CDN}/cdn/${version}/data/${locale}/${file}`)
const [ptChampions, enChampions, ptItems, enItems, ptRunes, enRunes] = await Promise.all([
    load('pt_BR', 'championFull.json'), load('en_US', 'championFull.json'),
    load('pt_BR', 'item.json'), load('en_US', 'item.json'),
    load('pt_BR', 'runesReforged.json'), load('en_US', 'runesReforged.json'),
])

const clean = (html = '') => html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '\n• ')
    .replace(/<\/(passive|active|unique|rarityMythic|rarityLegendary)>/gi, ': ')
    .replace(/<[^>]+>/g, '')
    .replace(/\{\{[^}]*\}\}/g, '?')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()

const SPELL_KEYS = ['Q', 'W', 'E', 'R']
const champions = Object.values(ptChampions.data)
    .map((pt) => ({ pt, en: enChampions.data[pt.id] }))
    .sort((a, b) => a.pt.name.localeCompare(b.pt.name, 'pt'))

const light = champions.map(({ pt, en }) => ({
    k: Number(pt.key),
    i: pt.id,
    n: [pt.name, en.name],
    t: [pt.title, en.title],
    g: pt.tags,
    p: [pt.partype, en.partype],
    r: pt.stats.attackrange,
    ms: pt.stats.movespeed,
    hp: pt.stats.hp,
    f: pt.info,
    s: [
        { k: 'P', n: [pt.passive.name, en.passive.name], img: `passive/${pt.passive.image.full}` },
        ...pt.spells.map((spell, index) => ({ k: SPELL_KEYS[index], n: [spell.name, en.spells[index].name], img: `spell/${spell.image.full}` })),
    ],
    sk: pt.skins.filter((skin) => skin.num > 0 && skin.parentSkin === undefined).map(({ num }) => num),
}))

const full = Object.fromEntries(champions.map(({ pt, en }) => [pt.id, {
    lore: [pt.lore, en.lore],
    ally: [pt.allytips, en.allytips],
    enemy: [pt.enemytips, en.enemytips],
    stats: pt.stats,
    passive: [clean(pt.passive.description), clean(en.passive.description)],
    spells: pt.spells.map((spell, index) => ({
        d: [clean(spell.description), clean(en.spells[index].description)],
        cd: spell.cooldownBurn,
        cost: spell.costBurn,
        range: spell.rangeBurn,
    })),
    skins: pt.skins
        .map((skin, index) => ({ skin, en: en.skins[index] }))
        .filter(({ skin }) => skin.parentSkin === undefined)
        .map(({ skin, en: enSkin }) => ({ num: skin.num, n: [skin.name, enSkin?.name ?? skin.name] })),
}]))

const items = Object.entries(ptItems.data)
    .filter(([id, item]) => Number(id) < 10000 && item.maps?.[SUMMONERS_RIFT] && item.gold?.purchasable && item.inStore !== false && !item.requiredChampion && !item.requiredAlly)
    .map(([id, item]) => {
        const en = enItems.data[id]
        return {
            id: Number(id),
            n: [item.name, en.name],
            pl: [item.plaintext ?? '', en.plaintext ?? ''],
            d: [clean(item.description), clean(en.description)],
            gold: item.gold.total,
            sell: item.gold.sell,
            tags: item.tags ?? [],
            from: (item.from ?? []).map(Number),
            into: (item.into ?? []).map(Number),
            depth: item.depth ?? 1,
        }
    })
    .sort((a, b) => a.gold - b.gold || a.n[0].localeCompare(b.n[0], 'pt'))

const runes = ptRunes.map((tree, treeIndex) => {
    const en = enRunes[treeIndex]
    return {
        id: tree.id,
        key: tree.key,
        n: [tree.name, en.name],
        icon: tree.icon,
        slots: tree.slots.map((slot, slotIndex) => slot.runes.map((rune, runeIndex) => {
            const enRune = en.slots[slotIndex].runes[runeIndex]
            return { id: rune.id, n: [rune.name, enRune.name], icon: rune.icon, d: [clean(rune.shortDesc), clean(enRune.shortDesc)] }
        })),
    }
})

await writeFile('public/data/lol.json', JSON.stringify({ version, champions: light }))
await writeFile('public/data/lol-full.json', JSON.stringify({ version, champions: full, items, runes }))
await writeFile('app/data/lol-pool.json', JSON.stringify(light.map(({ k }) => k).sort((a, b) => a - b)))
console.log(`versão ${version}: ${light.length} campeões, ${items.length} itens, ${runes.length} árvores de runas`)
