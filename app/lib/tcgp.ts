import TCGP_POOL from "../data/tcgp-pool.json";
import type { Language } from "../i18n/translations";

export { TCGP_POOL }
export const TCGP_POOL_SIZE = TCGP_POOL.length

type Pair = [string, string]

export interface TcgpAttack {
    n: Pair
    cost: string[]
    dmg: string | null
    e: Pair | null
}

export interface TcgpCard {
    id: string
    s: string
    no: string
    n: Pair
    c: 'Pokemon' | 'Trainer'
    hp: number | null
    ty: string[]
    st: string | null
    ev: Pair | null
    r: string
    il: string | null
    dex: number[]
    rt: number | null
    wk: string | null
    at: TcgpAttack[]
    ab: { n: Pair; e: Pair }[]
    tt: string | null
    ef: Pair | null
    d: Pair | null
    b: string[]
    ip: boolean
    ie: boolean
}

export interface TcgpSet {
    id: string
    n: Pair
    date: string
    official: number
    total: number
    boosters: { id: string; n: Pair }[]
    logo: string | null
}

export interface TcgpData {
    updated: string
    sets: TcgpSet[]
    cards: TcgpCard[]
    byId: Map<string, TcgpCard>
    setById: Map<string, TcgpSet>
}

export interface RawTcgpData {
    updated: string
    sets: TcgpSet[]
    cards: TcgpCard[]
}

export const parseTcgpData = (raw: RawTcgpData): TcgpData => ({
    ...raw,
    byId: new Map(raw.cards.map((card) => [card.id, card])),
    setById: new Map(raw.sets.map((set) => [set.id, set])),
})

let dataPromise: Promise<TcgpData> | null = null

export function loadTcgpData(): Promise<TcgpData> {
    dataPromise ??= fetch('/data/tcgp.json')
        .then((response) => {
            if (!response.ok) throw new Error(`tcgp: HTTP ${response.status}`)
            return response.json() as Promise<RawTcgpData>
        })
        .then(parseTcgpData)
        .catch((error) => {
            dataPromise = null
            throw error
        })
    return dataPromise
}

export const pickPair = (pair: Pair, language: Language) => (language === 'en' ? pair[1] : pair[0])
export const tcgpName = (card: Pick<TcgpCard, 'n'>, language: Language) => pickPair(card.n, language)

export const tcgpImage = (card: Pick<TcgpCard, 's' | 'no' | 'ip' | 'ie'>, language: Language, quality: 'high' | 'low' = 'high') =>
    card.ie || card.ip ? `https://assets.tcgdex.net/${language === 'pt' && card.ip ? 'pt-br' : 'en'}/tcgp/${card.s}/${card.no}/${quality}.webp` : null

export const tcgpCardPath = (card: Pick<TcgpCard, 'id'>) => `/tcg-pocket/cartas/${card.id.toLowerCase()}`
export const tcgpSetPath = (set: Pick<TcgpSet, 'id'>) => `/tcg-pocket/colecoes/${set.id.toLowerCase()}`

export const TCGP_TYPES = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Colorless'] as const

const TYPE_LABELS: Record<string, Pair> = {
    Grass: ['Planta', 'Grass'], Fire: ['Fogo', 'Fire'], Water: ['Água', 'Water'], Lightning: ['Elétrico', 'Lightning'],
    Psychic: ['Psíquico', 'Psychic'], Fighting: ['Lutador', 'Fighting'], Darkness: ['Escuridão', 'Darkness'], Metal: ['Metal', 'Metal'],
    Dragon: ['Dragão', 'Dragon'], Colorless: ['Incolor', 'Colorless'],
}
export const TCGP_TYPE_COLORS: Record<string, string> = {
    Grass: '#4caf50', Fire: '#ef5350', Water: '#42a5f5', Lightning: '#fdd835', Psychic: '#ab47bc', Fighting: '#d4772f',
    Darkness: '#455a64', Metal: '#90a4ae', Dragon: '#b8962e', Colorless: '#e0e0e0',
}
export const tcgpTypeLabel = (type: string, language: Language) => (TYPE_LABELS[type] ? pickPair(TYPE_LABELS[type], language) : type)

const STAGE_LABELS: Record<string, Pair> = { Basic: ['Básico', 'Basic'], Stage1: ['Estágio 1', 'Stage 1'], Stage2: ['Estágio 2', 'Stage 2'] }
const TRAINER_LABELS: Record<string, Pair> = { Item: ['Item', 'Item'], Supporter: ['Apoiador', 'Supporter'], Tool: ['Ferramenta', 'Tool'], Stadium: ['Estádio', 'Stadium'] }
export const tcgpKindLabel = (card: Pick<TcgpCard, 'c' | 'st' | 'tt'>, language: Language) =>
    card.c === 'Trainer'
        ? `${language === 'en' ? 'Trainer' : 'Treinador'} · ${card.tt && TRAINER_LABELS[card.tt] ? pickPair(TRAINER_LABELS[card.tt], language) : card.tt ?? ''}`
        : card.st && STAGE_LABELS[card.st] ? pickPair(STAGE_LABELS[card.st], language) : (card.st ?? '')

export const TCGP_RARITIES = ['One Diamond', 'Two Diamond', 'Three Diamond', 'Four Diamond', 'One Star', 'Two Star', 'Three Star', 'One Shiny', 'Two Shiny', 'Crown', 'None'] as const

const RARITY_INFO: Record<string, { symbol: string; label: Pair; color: string }> = {
    'One Diamond': { symbol: '◆', label: ['Comum', 'Common'], color: '#cbd5e1' },
    'Two Diamond': { symbol: '◆◆', label: ['Incomum', 'Uncommon'], color: '#86efac' },
    'Three Diamond': { symbol: '◆◆◆', label: ['Rara', 'Rare'], color: '#7dd3fc' },
    'Four Diamond': { symbol: '◆◆◆◆', label: ['Rara ex', 'Double rare'], color: '#c4b5fd' },
    'One Star': { symbol: '★', label: ['Arte rara', 'Art rare'], color: '#fde68a' },
    'Two Star': { symbol: '★★', label: ['Super rara', 'Super rare'], color: '#fcd34d' },
    'Three Star': { symbol: '★★★', label: ['Imersiva', 'Immersive'], color: '#fbbf24' },
    'One Shiny': { symbol: '✦', label: ['Brilhante', 'Shiny'], color: '#f9a8d4' },
    'Two Shiny': { symbol: '✦✦', label: ['Brilhante dupla', 'Double shiny'], color: '#f472b6' },
    Crown: { symbol: '♛', label: ['Coroa', 'Crown'], color: '#facc15' },
    None: { symbol: 'P', label: ['Promo', 'Promo'], color: '#e5e7eb' },
}
export const rarityInfo = (rarity: string) => RARITY_INFO[rarity] ?? RARITY_INFO.None
export const rarityLabel = (rarity: string, language: Language) => pickPair(rarityInfo(rarity).label, language)
export const rarityRank = (rarity: string) => Math.max(0, TCGP_RARITIES.indexOf(rarity as typeof TCGP_RARITIES[number]))

export const normalizeTcgp = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export const DECK_SIZE = 20
export const MAX_COPIES = 2

export function deckProblems(cards: TcgpCard[], counts: Record<string, number>, language: Language) {
    const pt = language === 'pt'
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
    const byName = new Map<string, number>()
    for (const card of cards) byName.set(card.n[1], (byName.get(card.n[1]) ?? 0) + (counts[card.id] ?? 0))
    const problems: string[] = []
    if (total !== DECK_SIZE) problems.push(pt ? `O deck precisa ter exatamente ${DECK_SIZE} cartas (agora tem ${total}).` : `The deck needs exactly ${DECK_SIZE} cards (it has ${total}).`)
    for (const [name, count] of byName) if (count > MAX_COPIES) problems.push(pt ? `Só pode haver ${MAX_COPIES} cópias de ${name}.` : `Only ${MAX_COPIES} copies of ${name} are allowed.`)
    if (!cards.some((card) => card.c === 'Pokemon' && card.st === 'Basic' && counts[card.id])) problems.push(pt ? 'O deck precisa de pelo menos um Pokémon Básico.' : 'The deck needs at least one Basic Pokémon.')
    return problems
}

const SLOT_ODDS: [string, number][][] = [
    [['One Diamond', 1]],
    [['One Diamond', 1]],
    [['One Diamond', 1]],
    [['Two Diamond', 0.9], ['Three Diamond', 0.05], ['Four Diamond', 0.01666], ['One Star', 0.02572], ['Two Star', 0.005], ['Three Star', 0.00222], ['One Shiny', 0.00714], ['Two Shiny', 0.00333], ['Crown', 0.0004]],
    [['Two Diamond', 0.6], ['Three Diamond', 0.2], ['Four Diamond', 0.06664], ['One Star', 0.10288], ['Two Star', 0.02], ['Three Star', 0.00888], ['One Shiny', 0.02857], ['Two Shiny', 0.01333], ['Crown', 0.0016]],
]

export function openTcgpPack(pool: TcgpCard[], random: () => number = Math.random) {
    const available = new Set(pool.map((card) => card.r))
    return SLOT_ODDS.map((odds) => {
        const options = odds.filter(([rarity]) => available.has(rarity))
        const total = options.reduce((sum, [, weight]) => sum + weight, 0)
        let roll = random() * total
        let rarity = options[0]?.[0] ?? pool[0].r
        for (const [candidate, weight] of options) {
            if (roll < weight) {
                rarity = candidate
                break
            }
            roll -= weight
        }
        const cards = pool.filter((card) => card.r === rarity)
        return cards[Math.floor(random() * cards.length)]
    })
}
