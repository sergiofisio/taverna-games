import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Language } from "../i18n/translations";
import { parseTcgpData, pickPair, rarityLabel, rarityRank, tcgpKindLabel, tcgpTypeLabel, type RawTcgpData, type TcgpCard, type TcgpData } from "./tcgp";

let dataPromise: Promise<TcgpData> | null = null

export function getTcgpData() {
    dataPromise ??= readFile(path.join(process.cwd(), 'public', 'data', 'tcgp.json'), 'utf8')
        .then((content) => parseTcgpData(JSON.parse(content) as RawTcgpData))
        .catch((error) => {
            dataPromise = null
            throw error
        })
    return dataPromise
}

export type CardSummary = Pick<TcgpCard, 'id' | 's' | 'no' | 'n' | 'r' | 'ip' | 'ie' | 'ty' | 'c' | 'st' | 'tt' | 'hp'>

export const summarize = (card: TcgpCard): CardSummary => ({
    id: card.id, s: card.s, no: card.no, n: card.n, r: card.r, ip: card.ip, ie: card.ie, ty: card.ty, c: card.c, st: card.st, tt: card.tt, hp: card.hp,
})

export async function getCardsForDex(dexId: number) {
    const data = await getTcgpData()
    return data.cards.filter((card) => card.dex.includes(dexId)).map(summarize)
}

export async function getTcgpCardPage(slug: string) {
    const data = await getTcgpData()
    const card = data.cards.find((entry) => entry.id.toLowerCase() === slug.toLowerCase())
    if (!card) return null
    const set = data.setById.get(card.s)!
    return {
        card,
        set,
        sameName: data.cards.filter((other) => other.id !== card.id && other.n[1] === card.n[1]).map(summarize),
        boosters: set.boosters.filter((booster) => card.b.includes(booster.id)),
    }
}

export async function getTcgpSetPage(slug: string) {
    const data = await getTcgpData()
    const set = data.sets.find((entry) => entry.id.toLowerCase() === slug.toLowerCase())
    if (!set) return null
    return { set, cards: data.cards.filter((card) => card.s === set.id).map(summarize) }
}

const listOf = (items: string[], language: Language) =>
    items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} ${language === 'pt' ? 'e' : 'and'} ${items.at(-1)}`

export function describeTcgpCard(card: TcgpCard, setName: [string, string], boosters: [string, string][], language: Language) {
    const pt = language === 'pt'
    const name = pickPair(card.n, language)
    const set = pickPair(setName, language)
    const kind = tcgpKindLabel(card, language).toLowerCase()
    const paragraphs: string[] = []
    if (card.c === 'Pokemon') {
        paragraphs.push(pt
            ? `${name} é uma carta de Pokémon ${kind} do tipo ${listOf(card.ty.map((type) => tcgpTypeLabel(type, language)), 'pt')}, com ${card.hp} de HP, da coleção ${set} do Pokémon TCG Pocket.${card.ev ? ` Evolui de ${pickPair(card.ev, language)}.` : ''}`
            : `${name} is a ${kind} ${listOf(card.ty.map((type) => tcgpTypeLabel(type, language)), 'en')}-type Pokémon card with ${card.hp} HP from the ${set} set of Pokémon TCG Pocket.${card.ev ? ` It evolves from ${pickPair(card.ev, language)}.` : ''}`)
        const attacks = card.at.map((attack) => {
            const cost = attack.cost.length
            return pt
                ? `${pickPair(attack.n, language)} custa ${cost} ${cost === 1 ? 'energia' : 'energias'}${attack.dmg ? ` e causa ${attack.dmg} de dano` : ''}`
                : `${pickPair(attack.n, language)} costs ${cost} energy${attack.dmg ? ` and deals ${attack.dmg} damage` : ''}`
        })
        if (attacks.length) paragraphs.push(`${pt ? 'Ataques' : 'Attacks'}: ${listOf(attacks, language)}.`)
        if (card.ab.length) paragraphs.push(pt ? `Também tem a habilidade ${pickPair(card.ab[0].n, language)}, que funciona sem gastar energia.` : `It also has the ability ${pickPair(card.ab[0].n, language)}, which works without spending energy.`)
        const ex = card.n[1].endsWith(' ex')
        paragraphs.push(pt
            ? `${card.wk ? `É fraco contra ${tcgpTypeLabel(card.wk, language)} (recebe +20 de dano)` : 'Não tem fraqueza'} e custa ${card.rt ?? 0} para recuar.${ex ? ' Por ser um Pokémon ex, dá 2 pontos ao adversário quando é nocauteado.' : ''}`
            : `${card.wk ? `It is weak to ${tcgpTypeLabel(card.wk, language)} (takes +20 damage)` : 'It has no weakness'} and costs ${card.rt ?? 0} to retreat.${ex ? ' As a Pokémon ex, it gives your opponent 2 points when knocked out.' : ''}`)
    } else {
        paragraphs.push(pt
            ? `${name} é uma carta de ${kind.replace('treinador · ', 'Treinador do tipo ')} da coleção ${set}.${card.tt === 'Supporter' ? ' Só é possível jogar um Apoiador por turno.' : ''}`
            : `${name} is a ${kind} card from the ${set} set.${card.tt === 'Supporter' ? ' You can only play one Supporter per turn.' : ''}`)
    }
    paragraphs.push(pt
        ? `A raridade é ${rarityLabel(card.r, language).toLowerCase()}${rarityRank(card.r) >= 4 ? ', uma das versões mais difíceis de conseguir nos pacotes' : ''}.${boosters.length ? ` Aparece nos pacotes de ${listOf(boosters.map((booster) => pickPair(booster, language)), 'pt')}.` : ''}`
        : `Its rarity is ${rarityLabel(card.r, language).toLowerCase()}${rarityRank(card.r) >= 4 ? ', one of the hardest versions to pull from packs' : ''}.${boosters.length ? ` It appears in the ${listOf(boosters.map((booster) => pickPair(booster, language)), 'en')} packs.` : ''}`)
    return paragraphs
}
