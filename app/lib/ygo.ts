import YGO_POOL from "../data/ygo-pool.json";
import type { Language } from "../i18n/translations";

export { YGO_POOL }
export const YGO_POOL_SIZE = YGO_POOL.length

type Pair = [string, string]

export type YgoFrame = 'normal' | 'effect' | 'fusion' | 'ritual' | 'synchro' | 'xyz' | 'link' | 'spell' | 'trap'

export interface YgoCard {
    id: number
    n: Pair
    k: 'm' | 's' | 't'
    f: YgoFrame
    r: string | null
    p?: 1
    a?: string | null
    l?: number
    atk?: number
    def?: number | null
    st?: string[]
    sc?: number
    lm?: string[]
    ar?: string
    b?: number
    bo?: number
    y?: number
    ocg?: 1
    pt?: 1
    alt?: number[]
}

export interface YgoPoolCard extends YgoCard {
    tx: [string | null, string]
}

export interface YgoSet {
    c: string
    s: string
    n: string
    d: string
    t: number
    cards: [number, string][]
}

export interface YgoData {
    updated: string
    cards: YgoCard[]
    byId: Map<number, YgoCard>
}

export interface YgoSetsData {
    updated: string
    rarities: Record<string, string>
    sets: YgoSet[]
    bySlug: Map<string, YgoSet>
}

export interface YgoPoolData {
    updated: string
    cards: YgoPoolCard[]
    byId: Map<number, YgoPoolCard>
}

export const parseYgoData = (raw: { updated: string; cards: YgoCard[] }): YgoData => ({ ...raw, byId: new Map(raw.cards.map((card) => [card.id, card])) })
export const parseYgoSets = (raw: Omit<YgoSetsData, 'bySlug'>): YgoSetsData => ({ ...raw, bySlug: new Map(raw.sets.map((set) => [set.s, set])) })
export const parseYgoPool = (raw: { updated: string; cards: YgoPoolCard[] }): YgoPoolData => ({ ...raw, byId: new Map(raw.cards.map((card) => [card.id, card])) })

function cachedLoader<T>(url: string, parse: (raw: never) => T) {
    let promise: Promise<T> | null = null
    return () => {
        promise ??= fetch(url)
            .then((response) => {
                if (!response.ok) throw new Error(`ygo: HTTP ${response.status}`)
                return response.json()
            })
            .then((raw) => parse(raw as never))
            .catch((error) => {
                promise = null
                throw error
            })
        return promise
    }
}

export const loadYgoData = cachedLoader('/data/ygo.json', parseYgoData)
export const loadYgoSets = cachedLoader('/data/ygo-sets.json', parseYgoSets)
export const loadYgoPool = cachedLoader('/data/ygo-pool.json', parseYgoPool)

export const pickPair = <T,>(pair: [T, T], language: Language) => (language === 'en' ? pair[1] : pair[0])
export const ygoName = (card: Pick<YgoCard, 'n'>, language: Language) => pickPair(card.n, language)

export type YgoImageSize = 'small' | 'full' | 'art'
export const ygoImage = (id: number, size: YgoImageSize = 'small') => `/api/ygo/img/${size}/${id}.jpg`

export const slugifyYgo = (value: string) =>
    value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x'

export const ygoCardPath = (card: Pick<YgoCard, 'id' | 'n'>) => `/yu-gi-oh/cartas/${card.id}-${slugifyYgo(card.n[1])}`
export const ygoSetPath = (set: Pick<YgoSet, 's'>) => `/yu-gi-oh/colecoes/${set.s}`
export const ygoArchetypePath = (archetype: string) => `/yu-gi-oh/arquetipos/${slugifyYgo(archetype)}`
export const parseYgoCardSlug = (slug: string) => {
    const id = Number(slug.split('-')[0])
    return Number.isInteger(id) && id > 0 ? id : null
}

export const YGO_ATTRIBUTES = ['DARK', 'LIGHT', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'] as const
const ATTRIBUTE_LABELS: Record<string, Pair> = {
    DARK: ['TREVAS', 'DARK'], LIGHT: ['LUZ', 'LIGHT'], EARTH: ['TERRA', 'EARTH'], WATER: ['ÁGUA', 'WATER'],
    FIRE: ['FOGO', 'FIRE'], WIND: ['VENTO', 'WIND'], DIVINE: ['DIVINO', 'DIVINE'],
}
export const YGO_ATTRIBUTE_COLORS: Record<string, string> = {
    DARK: '#6b21a8', LIGHT: '#ca8a04', EARTH: '#78350f', WATER: '#0369a1', FIRE: '#dc2626', WIND: '#15803d', DIVINE: '#b45309',
}
export const ygoAttributeLabel = (attribute: string | null | undefined, language: Language) =>
    attribute ? pickPair(ATTRIBUTE_LABELS[attribute] ?? [attribute, attribute], language) : '—'

const RACE_LABELS: Record<string, string> = {
    Aqua: 'Aqua', Beast: 'Besta', 'Beast-Warrior': 'Besta-Guerreira', 'Creator God': 'Deus Criador', Cyberse: 'Ciberso', Dinosaur: 'Dinossauro',
    'Divine-Beast': 'Besta Divina', Dragon: 'Dragão', Fairy: 'Fada', Fiend: 'Demônio', Fish: 'Peixe', Insect: 'Inseto', Illusion: 'Ilusão',
    Machine: 'Máquina', Plant: 'Planta', Psychic: 'Psíquico', Pyro: 'Piro', Reptile: 'Réptil', Rock: 'Rocha', 'Sea Serpent': 'Serpente Marinha',
    Spellcaster: 'Mago', Thunder: 'Trovão', Warrior: 'Guerreiro', 'Winged Beast': 'Besta Alada', Wyrm: 'Wyrm', Zombie: 'Zumbi',
}
export const YGO_RACES = Object.keys(RACE_LABELS)
export const ygoRaceLabel = (race: string | null | undefined, language: Language) =>
    !race ? '—' : language === 'en' ? race : RACE_LABELS[race] ?? race

const SPELL_LABELS: Record<string, Pair> = {
    Normal: ['Normal', 'Normal'], Continuous: ['Contínua', 'Continuous'], 'Quick-Play': ['Rápida', 'Quick-Play'],
    Equip: ['de Equipamento', 'Equip'], Field: ['de Campo', 'Field'], Ritual: ['de Ritual', 'Ritual'], Counter: ['de Resposta', 'Counter'],
}
export const YGO_SPELL_TYPES = ['Normal', 'Continuous', 'Quick-Play', 'Equip', 'Field', 'Ritual'] as const
export const YGO_TRAP_TYPES = ['Normal', 'Continuous', 'Counter'] as const

const FRAME_LABELS: Record<YgoFrame, Pair> = {
    normal: ['Normal', 'Normal'], effect: ['Efeito', 'Effect'], fusion: ['Fusão', 'Fusion'], ritual: ['Ritual', 'Ritual'],
    synchro: ['Sincro', 'Synchro'], xyz: ['Xyz', 'Xyz'], link: ['Link', 'Link'], spell: ['Magia', 'Spell'], trap: ['Armadilha', 'Trap'],
}
export const YGO_FRAMES = Object.keys(FRAME_LABELS) as YgoFrame[]
export const YGO_FRAME_COLORS: Record<YgoFrame, string> = {
    normal: '#d6b46a', effect: '#c9733a', fusion: '#8b4f9e', ritual: '#4b7bc2', synchro: '#e5e7eb', xyz: '#27272a', link: '#1d4ed8', spell: '#0f9488', trap: '#be185d',
}
export const ygoFrameLabel = (frame: YgoFrame, language: Language) => pickPair(FRAME_LABELS[frame], language)

const SUBTYPE_LABELS: Record<string, Pair> = {
    Tuner: ['Regulador', 'Tuner'], Flip: ['Virar', 'Flip'], Gemini: ['Gêmeos', 'Gemini'], Union: ['União', 'Union'], Spirit: ['Espírito', 'Spirit'], Toon: ['Toon', 'Toon'],
}

export function ygoKindLabel(card: Pick<YgoCard, 'k' | 'f' | 'r' | 'p' | 'st'>, language: Language) {
    const pt = language === 'pt'
    if (card.k !== 'm') {
        const subtype = card.r && SPELL_LABELS[card.r] ? pickPair(SPELL_LABELS[card.r], language) : card.r ?? ''
        return pt ? `${card.k === 's' ? 'Magia' : 'Armadilha'} ${subtype}`.trim() : `${subtype} ${card.k === 's' ? 'Spell' : 'Trap'}`.trim()
    }
    const parts = [ygoFrameLabel(card.f, language), ...(card.p ? [pt ? 'Pêndulo' : 'Pendulum'] : []), ...(card.st ?? []).map((subtype) => pickPair(SUBTYPE_LABELS[subtype] ?? [subtype, subtype], language))]
    if (pt) return `Monstro ${['effect', 'fusion', 'ritual'].includes(card.f) ? 'de ' : ''}${parts.join(' ')}`
    return `${[...parts.slice(1), parts[0]].join(' ')} Monster`
}

export const ygoLevelLabel = (card: Pick<YgoCard, 'f'>, language: Language) =>
    card.f === 'xyz' ? (language === 'en' ? 'Rank' : 'Classe') : card.f === 'link' ? 'Link' : language === 'en' ? 'Level' : 'Nível'

const BAN_LABELS: Pair[] = [['Proibida', 'Forbidden'], ['Limitada', 'Limited'], ['Semilimitada', 'Semi-Limited']]
export const BAN_COLORS = ['#dc2626', '#ea580c', '#ca8a04']
export const ygoBanLabel = (ban: number, language: Language) => pickPair(BAN_LABELS[ban], language)

const RARITY_LABELS: Record<string, [string, string]> = {
    C: ['Comum', '#cbd5e1'], R: ['Rara', '#93c5fd'], SR: ['Super Rara', '#86efac'], UR: ['Ultra Rara', '#fcd34d'], ScR: ['Rara Secreta', '#f9a8d4'],
    UtR: ['Rara Suprema', '#fdba74'], GR: ['Rara Fantasma', '#e5e7eb'], StR: ['Rara Starlight', '#c4b5fd'], CR: ['Rara de Colecionador', '#a5f3fc'],
    QCScR: ['Rara Secreta de 25 anos', '#fde68a'], PScR: ['Rara Secreta Prismática', '#f0abfc'], PS: ['Rara Secreta de Platina', '#e2e8f0'],
    GUR: ['Rara de Ouro', '#facc15'], GScR: ['Rara Secreta de Ouro', '#eab308'], SP: ['Impressão Curta', '#cbd5e1'], SSP: ['Impressão Super Curta', '#cbd5e1'],
}
export const YGO_RARITY_ORDER = ['C', 'SP', 'SSP', 'R', 'SR', 'UR', 'GUR', 'ScR', 'UtR', 'CR', 'PScR', 'PS', 'GScR', 'QCScR', 'GR', 'StR']
export const ygoRarityRank = (rarity: string) => {
    const index = YGO_RARITY_ORDER.indexOf(rarity)
    return index === -1 ? 5 : index
}
export const ygoRarityColor = (rarity: string) => RARITY_LABELS[rarity]?.[1] ?? '#ddd6fe'
export const ygoRarityLabel = (rarity: string, language: Language, names: Record<string, string> = {}) =>
    language === 'pt' && RARITY_LABELS[rarity] ? RARITY_LABELS[rarity][0] : names[rarity] ?? rarity

export const normalizeYgo = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
export const matchesYgo = (card: Pick<YgoCard, 'n'>, normalized: string) => !normalized || card.n.some((name) => normalizeYgo(name).includes(normalized))

export const EXTRA_FRAMES: YgoFrame[] = ['fusion', 'synchro', 'xyz', 'link']
export const isExtraDeck = (card: Pick<YgoCard, 'f'>) => EXTRA_FRAMES.includes(card.f)

export const MAIN_MIN = 40
export const MAIN_MAX = 60
export const EXTRA_MAX = 15
export const MAX_COPIES = 3
export const copyLimit = (card: Pick<YgoCard, 'b'>) => card.b ?? MAX_COPIES

export function ygoDeckProblems(cards: YgoCard[], counts: Record<number, number>, language: Language) {
    const pt = language === 'pt'
    const main = cards.filter((card) => !isExtraDeck(card)).reduce((sum, card) => sum + (counts[card.id] ?? 0), 0)
    const extra = cards.filter(isExtraDeck).reduce((sum, card) => sum + (counts[card.id] ?? 0), 0)
    const problems: string[] = []
    if (main < MAIN_MIN || main > MAIN_MAX) problems.push(pt ? `O Deck Principal precisa ter de ${MAIN_MIN} a ${MAIN_MAX} cartas (agora tem ${main}).` : `The Main Deck needs ${MAIN_MIN} to ${MAIN_MAX} cards (it has ${main}).`)
    if (extra > EXTRA_MAX) problems.push(pt ? `O Deck Adicional pode ter no máximo ${EXTRA_MAX} cartas (agora tem ${extra}).` : `The Extra Deck can have at most ${EXTRA_MAX} cards (it has ${extra}).`)
    for (const card of cards) {
        const count = counts[card.id] ?? 0
        if (card.b === 0 && count > 0) problems.push(pt ? `${card.n[0]} está proibida na lista do TCG.` : `${card.n[1]} is Forbidden in the TCG list.`)
        else if (count > copyLimit(card)) problems.push(pt ? `${card.n[0]} só pode ter ${copyLimit(card)} cópia(s).` : `${card.n[1]} is limited to ${copyLimit(card)} cop${copyLimit(card) === 1 ? 'y' : 'ies'}.`)
    }
    return { main, extra, problems }
}

export function toYdk(cards: YgoCard[], counts: Record<number, number>) {
    const lines = (list: YgoCard[]) => list.flatMap((card) => Array.from({ length: counts[card.id] ?? 0 }, () => String(card.id)))
    return ['#created by Taverna dos Jogos', '#main', ...lines(cards.filter((card) => !isExtraDeck(card))), '#extra', ...lines(cards.filter(isExtraDeck)), '!side', ''].join('\n')
}

export function parseYdk(text: string) {
    const counts: Record<number, number> = {}
    let side = false
    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim()
        if (line.startsWith('!side')) side = true
        else if (line.startsWith('#')) side = false
        else if (!side && /^\d+$/.test(line)) counts[Number(line)] = (counts[Number(line)] ?? 0) + 1
    }
    return counts
}

const EXCLUDED_SETS = /structure deck|starter|tin|mega[- ]?pack|promo|tournament|speed duel|deck|duel terminal|championship|prize|sneak|participation|movie|box|kit|bundle|special edition|value pack|power pack|sampler/i

export const isBoosterSet = (set: YgoSet) =>
    set.t >= 50 && !EXCLUDED_SETS.test(set.n) && set.cards.some(([, rarity]) => rarity === 'C') && new Set(set.cards.map(([, rarity]) => rarity)).size >= 3

export const PACK_SIZE = 9
const FOIL_WEIGHTS: Record<string, number> = { SR: 60, UR: 22, ScR: 10, UtR: 3, CR: 2, QCScR: 1.2, PScR: 1, GUR: 1, StR: 0.5, GR: 0.3, PS: 0.2 }

export function openYgoPack(set: YgoSet, random: () => number = Math.random) {
    const byRarity = new Map<string, number[]>()
    for (const [id, rarity] of set.cards) byRarity.set(rarity, [...(byRarity.get(rarity) ?? []), id])
    const pick = (rarity: string) => {
        const list = byRarity.get(rarity) ?? byRarity.get('C') ?? [...byRarity.values()][0]
        return { id: list[Math.floor(random() * list.length)], rarity: byRarity.has(rarity) ? rarity : byRarity.has('C') ? 'C' : [...byRarity.keys()][0] }
    }
    const second = byRarity.has('R') ? 'R' : 'SR'
    const foils = Object.entries(FOIL_WEIGHTS).filter(([rarity]) => byRarity.has(rarity) && (second === 'R' || rarity !== 'SR'))
    const total = foils.reduce((sum, [, weight]) => sum + weight, 0)
    let roll = random() * total
    let foil = foils[0]?.[0] ?? 'C'
    for (const [rarity, weight] of foils) {
        if (roll < weight) {
            foil = rarity
            break
        }
        roll -= weight
    }
    return [...Array.from({ length: PACK_SIZE - 2 }, () => pick('C')), pick(second), pick(foil)]
}
