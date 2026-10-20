import { readFile } from "node:fs/promises";
import path from "node:path";
import { championSlug, parseLolData, type LolChampion, type LolData, type RawLolData } from "./lol";

const DATA_DIR = path.join(process.cwd(), 'public', 'data')

export interface LolChampionFull {
    lore: [string, string]
    ally: [string[], string[]]
    enemy: [string[], string[]]
    stats: Record<string, number>
    passive: [string, string]
    spells: { d: [string, string]; cd: string; cost: string; range: string }[]
    skins: { num: number; n: [string, string] }[]
}

export interface LolItem {
    id: number
    n: [string, string]
    pl: [string, string]
    d: [string, string]
    gold: number
    sell: number
    tags: string[]
    from: number[]
    into: number[]
    depth: number
}

export interface LolRune {
    id: number
    n: [string, string]
    icon: string
    d: [string, string]
}

export interface LolRuneTree {
    id: number
    key: string
    n: [string, string]
    icon: string
    slots: LolRune[][]
}

interface FullData {
    version: string
    champions: Record<string, LolChampionFull>
    items: LolItem[]
    runes: LolRuneTree[]
}

let lightPromise: Promise<LolData> | null = null
let fullPromise: Promise<FullData> | null = null

const readJson = async <T,>(file: string) => JSON.parse(await readFile(path.join(DATA_DIR, file), 'utf8')) as T

export function getLolData() {
    lightPromise ??= readJson<RawLolData>('lol.json').then(parseLolData).catch((error) => {
        lightPromise = null
        throw error
    })
    return lightPromise
}

function getFullData() {
    fullPromise ??= readJson<FullData>('lol-full.json').catch((error) => {
        fullPromise = null
        throw error
    })
    return fullPromise
}

export interface ChampionPage {
    version: string
    champion: LolChampion
    full: LolChampionFull
    averages: { hp: number; ms: number; r: number; armor: number; spellblock: number; attackdamage: number }
    similar: LolChampion[]
    previous: LolChampion
    next: LolChampion
}

const average = (values: number[]) => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)

export async function getChampionPage(slug: string): Promise<ChampionPage | null> {
    const [data, full] = await Promise.all([getLolData(), getFullData()])
    const index = data.champions.findIndex((champion) => championSlug(champion) === slug)
    if (index < 0) return null
    const champion = data.champions[index]
    const all = Object.values(full.champions)
    return {
        version: data.version,
        champion,
        full: full.champions[champion.i],
        averages: {
            hp: average(data.champions.map(({ hp }) => hp)),
            ms: average(data.champions.map(({ ms }) => ms)),
            r: average(data.champions.map(({ r }) => r)),
            armor: average(all.map(({ stats }) => stats.armor)),
            spellblock: average(all.map(({ stats }) => stats.spellblock)),
            attackdamage: average(all.map(({ stats }) => stats.attackdamage)),
        },
        similar: data.champions
            .filter((other) => other.k !== champion.k && other.g[0] === champion.g[0])
            .sort((a, b) => Math.abs(a.f.difficulty - champion.f.difficulty) - Math.abs(b.f.difficulty - champion.f.difficulty))
            .slice(0, 8),
        previous: data.champions[(index - 1 + data.champions.length) % data.champions.length],
        next: data.champions[(index + 1) % data.champions.length],
    }
}

export const lolItemSlug = (item: Pick<LolItem, 'id' | 'n'>) =>
    `${item.n[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${item.id}`

export async function getItems() {
    const full = await getFullData()
    return { version: full.version, items: full.items }
}

export async function getItemPage(slug: string) {
    const { version, items } = await getItems()
    const id = Number(slug.match(/(\d+)$/)?.[1])
    const item = items.find((entry) => entry.id === id)
    if (!item) return null
    const byId = new Map(items.map((entry) => [entry.id, entry]))
    return {
        version,
        item,
        slug: lolItemSlug(item),
        from: item.from.flatMap((value) => byId.get(value) ?? []),
        into: item.into.flatMap((value) => byId.get(value) ?? []),
    }
}

export async function getRunes() {
    const full = await getFullData()
    return full.runes
}
