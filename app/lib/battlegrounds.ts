export interface BgMinion {
    d: number
    i: string
    n: [string, string]
    t: [string, string]
    l: number
    a: number
    h: number
    r: string[]
    m: string[]
}

export interface BgHero {
    d: number
    i: string
    n: [string, string]
    ar: number
    p: { n: [string, string]; t: [string, string]; c: number }
}

export interface BgSpell {
    d: number
    i: string
    n: [string, string]
    t: [string, string]
    l: number
    c: number
}

export interface BgData {
    updated: string
    minions: BgMinion[]
    heroes: BgHero[]
    spells: BgSpell[]
}

export const BG_TIERS = [1, 2, 3, 4, 5, 6, 7]
export const bgArt = (id: string) => `https://art.hearthstonejson.com/v1/256x/${id}.jpg`
