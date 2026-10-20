import { DISENCHANT_VALUE, maxCopies, type HsCard, type HsData, type HsRarity } from "./hearthstone";

export const PACK_SIZE = 5
export const EPIC_PITY = 10
export const LEGENDARY_PITY = 40
export const FIRST_LEGENDARY_PITY = 10

const RARITY_ODDS: [HsRarity, number][] = [['LEGENDARY', 0.0108], ['EPIC', 0.0428], ['RARE', 0.2286], ['COMMON', 0.7178]]
const GOLDEN_ODDS: Record<HsRarity, number> = { FREE: 0, COMMON: 0.0147, RARE: 0.0137, EPIC: 0.0231, LEGENDARY: 0.0729 }
export const GOLDEN_DISENCHANT: Record<HsRarity, number> = { FREE: 0, COMMON: 50, RARE: 100, EPIC: 400, LEGENDARY: 1600 }

export interface PackCard {
    card: HsCard
    golden: boolean
    duplicate: boolean
}

export interface PackSession {
    packs: number
    sinceEpic: number
    sinceLegendary: number
    legendaries: number
    owned: Record<number, number>
    byRarity: Record<HsRarity, number>
    golden: number
    duplicateDust: number
}

export const newSession = (): PackSession => ({
    packs: 0,
    sinceEpic: 0,
    sinceLegendary: 0,
    legendaries: 0,
    owned: {},
    byRarity: { FREE: 0, COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 },
    golden: 0,
    duplicateDust: 0,
})

export const packPool = (data: HsData, setIndex: number) =>
    data.unique.filter((card) => card.set === setIndex && !card.bundled && !card.free && card.rarity !== 'FREE')

export const packableSets = (data: HsData) =>
    data.sets
        .map((set, index) => ({ set, index, size: packPool(data, index).length }))
        .filter(({ size }) => size >= 60)

function rollRarity(random: () => number): HsRarity {
    let roll = random()
    for (const [rarity, odds] of RARITY_ODDS) {
        if (roll < odds) return rarity
        roll -= odds
    }
    return 'COMMON'
}

const RANK: Record<HsRarity, number> = { FREE: 0, COMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4 }

function pickCard(pool: HsCard[], rarity: HsRarity, owned: Record<number, number>, random: () => number) {
    const ofRarity = pool.filter((card) => card.rarity === rarity)
    const missing = ofRarity.filter((card) => (owned[card.dbfId] ?? 0) < maxCopies(card))
    const options = missing.length ? missing : ofRarity
    return options[Math.floor(random() * options.length)]
}

export function openPack(pool: HsCard[], session: PackSession, random: () => number = Math.random): { cards: PackCard[]; session: PackSession } {
    const rarities: HsRarity[] = Array.from({ length: PACK_SIZE }, () => rollRarity(random))
    if (!rarities.some((rarity) => rarity !== 'COMMON')) rarities[PACK_SIZE - 1] = 'RARE'
    const best = () => Math.max(...rarities.map((rarity) => RANK[rarity]))
    const legendaryDue = session.legendaries === 0 ? session.packs + 1 >= FIRST_LEGENDARY_PITY : session.sinceLegendary + 1 >= LEGENDARY_PITY
    if (legendaryDue && best() < RANK.LEGENDARY) rarities[PACK_SIZE - 1] = 'LEGENDARY'
    else if (session.sinceEpic + 1 >= EPIC_PITY && best() < RANK.EPIC) rarities[PACK_SIZE - 1] = 'EPIC'

    const owned = { ...session.owned }
    const byRarity = { ...session.byRarity }
    let golden = session.golden
    let duplicateDust = session.duplicateDust
    const cards = rarities.map((rarity) => {
        const card = pickCard(pool, rarity, owned, random)
        const isGolden = random() < GOLDEN_ODDS[rarity]
        const count = owned[card.dbfId] ?? 0
        const duplicate = count >= maxCopies(card)
        owned[card.dbfId] = count + 1
        byRarity[rarity] += 1
        if (isGolden) golden += 1
        if (duplicate) duplicateDust += isGolden ? GOLDEN_DISENCHANT[rarity] : DISENCHANT_VALUE[rarity]
        return { card, golden: isGolden, duplicate }
    })

    const gotLegendary = rarities.includes('LEGENDARY')
    const gotEpic = gotLegendary || rarities.includes('EPIC')
    return {
        cards,
        session: {
            packs: session.packs + 1,
            sinceEpic: gotEpic ? 0 : session.sinceEpic + 1,
            sinceLegendary: gotLegendary ? 0 : session.sinceLegendary + 1,
            legendaries: session.legendaries + rarities.filter((rarity) => rarity === 'LEGENDARY').length,
            owned,
            byRarity,
            golden,
            duplicateDust,
        },
    }
}

export const packDust = (cards: PackCard[]) =>
    cards.reduce((sum, { card, golden }) => sum + (golden ? GOLDEN_DISENCHANT[card.rarity] : DISENCHANT_VALUE[card.rarity]), 0)
