import LOL_POOL from "../data/lol-pool.json";
import type { Language } from "../i18n/translations";

export { LOL_POOL }
export const LOL_POOL_SIZE = LOL_POOL.length

export type LolSpellKey = 'P' | 'Q' | 'W' | 'E' | 'R'

export interface LolSpell {
    k: LolSpellKey
    n: [string, string]
    img: string
}

export interface LolChampion {
    k: number
    i: string
    n: [string, string]
    t: [string, string]
    g: string[]
    p: [string, string]
    r: number
    ms: number
    hp: number
    f: { attack: number; defense: number; magic: number; difficulty: number }
    s: LolSpell[]
    sk: number[]
}

export interface LolData {
    version: string
    champions: LolChampion[]
    byKey: Map<number, LolChampion>
}

export interface RawLolData {
    version: string
    champions: LolChampion[]
}

export const parseLolData = (raw: RawLolData): LolData => ({ ...raw, byKey: new Map(raw.champions.map((champion) => [champion.k, champion])) })

let dataPromise: Promise<LolData> | null = null

export function loadLolData(): Promise<LolData> {
    dataPromise ??= fetch('/data/lol.json')
        .then((response) => {
            if (!response.ok) throw new Error(`lol: HTTP ${response.status}`)
            return response.json() as Promise<RawLolData>
        })
        .then(parseLolData)
        .catch((error) => {
            dataPromise = null
            throw error
        })
    return dataPromise
}

const CDN = 'https://ddragon.leagueoflegends.com/cdn'

export const championIcon = (version: string, champion: Pick<LolChampion, 'i'>) => `${CDN}/${version}/img/champion/${champion.i}.png`
export const championSplash = (champion: Pick<LolChampion, 'i'>, skin = 0) => `${CDN}/img/champion/splash/${champion.i}_${skin}.jpg`
export const championLoading = (champion: Pick<LolChampion, 'i'>, skin = 0) => `${CDN}/img/champion/loading/${champion.i}_${skin}.jpg`
export const spellIcon = (version: string, image: string) => `${CDN}/${version}/img/${image}`
export const itemIcon = (version: string, id: number) => `${CDN}/${version}/img/item/${id}.png`
export const runeIcon = (icon: string) => `${CDN}/img/${icon}`

export const championSlug = (champion: Pick<LolChampion, 'i'>) => champion.i.toLowerCase()
export const championPath = (champion: Pick<LolChampion, 'i'>) => `/lol/campeoes/${championSlug(champion)}`

export const pickLang = <T,>(pair: [T, T], language: Language) => (language === 'en' ? pair[1] : pair[0])
export const championName = (champion: Pick<LolChampion, 'n'>, language: Language) => pickLang(champion.n, language)

export const LOL_ROLES = ['Assassin', 'Fighter', 'Mage', 'Marksman', 'Support', 'Tank'] as const

const ROLE_LABELS: Record<string, [string, string]> = {
    Assassin: ['Assassino', 'Assassin'],
    Fighter: ['Lutador', 'Fighter'],
    Mage: ['Mago', 'Mage'],
    Marksman: ['Atirador', 'Marksman'],
    Support: ['Suporte', 'Support'],
    Tank: ['Tanque', 'Tank'],
}

export const roleLabel = (role: string, language: Language) => (ROLE_LABELS[role] ? pickLang(ROLE_LABELS[role], language) : role)

export const hasResource = (champion: Pick<LolChampion, 'p'>) => Boolean(champion.p[1]) && champion.p[1] !== 'None'

export const RANGED_THRESHOLD = 300
export const isRanged = (champion: Pick<LolChampion, 'r'>) => champion.r >= RANGED_THRESHOLD
export const rangeLabel = (champion: Pick<LolChampion, 'r'>, language: Language) =>
    isRanged(champion) ? (language === 'en' ? 'Ranged' : 'À distância') : (language === 'en' ? 'Melee' : 'Corpo a corpo')

export const SPELL_LABELS: Record<LolSpellKey, [string, string]> = {
    P: ['Passiva', 'Passive'], Q: ['Q', 'Q'], W: ['W', 'W'], E: ['E', 'E'], R: ['R (Ultimate)', 'R (Ultimate)'],
}

export const normalizeLol = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export function searchChampions(champions: LolChampion[], query: string) {
    const normalized = normalizeLol(query)
    if (!normalized) return []
    return champions
        .filter((champion) => champion.n.some((name) => normalizeLol(name).includes(normalized)))
        .sort((a, b) => Number(normalizeLol(b.n[0]).startsWith(normalized)) - Number(normalizeLol(a.n[0]).startsWith(normalized)) || a.n[0].localeCompare(b.n[0]))
}
