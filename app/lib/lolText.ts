import type { Language } from "../i18n/translations";
import { championName, hasResource, isRanged, pickLang, roleLabel, type LolChampion } from "./lol";
import type { ChampionPage } from "./lolServer";

const listOf = (items: string[], language: Language) =>
    items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} ${language === 'pt' ? 'e' : 'and'} ${items.at(-1)}`

const DIFFICULTY: [number, [string, string]][] = [
    [3, ['fácil de aprender, bom para quem está começando', 'easy to learn and good for beginners']],
    [6, ['de dificuldade média', 'of medium difficulty']],
    [8, ['difícil, pede prática para render bem', 'hard and needs practice to perform well']],
    [10, ['muito difícil, um dos campeões mais exigentes do jogo', 'very hard, one of the most demanding champions in the game']],
]

export function describeChampion(page: ChampionPage, language: Language) {
    const { champion, full, averages } = page
    const pt = language === 'pt'
    const name = championName(champion, language)
    const roles = champion.g.map((role) => roleLabel(role, language).toLowerCase())
    const resource = hasResource(champion) ? pickLang(champion.p, language) : ''
    const difficulty = DIFFICULTY.find(([max]) => champion.f.difficulty <= max)![1][pt ? 0 : 1]
    const strongest = (['attack', 'defense', 'magic'] as const).reduce((best, key) => (champion.f[key] > champion.f[best] ? key : best), 'attack' as 'attack' | 'defense' | 'magic')
    const focus: Record<typeof strongest, [string, string]> = {
        attack: ['dano físico', 'physical damage'],
        defense: ['resistência', 'durability'],
        magic: ['dano mágico', 'magic damage'],
    }
    const compare = (value: number, avg: number) => (value > avg * 1.04 ? 'above' : value < avg * 0.96 ? 'below' : 'avg')
    const word = (state: string) => pt
        ? state === 'above' ? 'acima da média' : state === 'below' ? 'abaixo da média' : 'na média'
        : state === 'above' ? 'above average' : state === 'below' ? 'below average' : 'average'

    return [
        pt
            ? `${name}, ${pickLang(champion.t, language)}, é um campeão ${listOf(roles, 'pt')} que ${resource ? `usa ${resource} como recurso` : 'não usa recurso nas habilidades'} e ataca ${isRanged(champion) ? 'à distância' : 'corpo a corpo'}. O kit dele é focado em ${focus[strongest][0]}.`
            : `${name}, ${pickLang(champion.t, language)}, is a ${listOf(roles, 'en')} champion who ${resource ? `uses ${resource} as a resource` : 'uses no resource for abilities'} and attacks at ${isRanged(champion) ? 'range' : 'melee range'}. Their kit focuses on ${focus[strongest][1]}.`,
        pt
            ? `Na escala oficial, a dificuldade é ${champion.f.difficulty} de 10: um campeão ${difficulty}.`
            : `On the official scale, difficulty is ${champion.f.difficulty} out of 10: a champion ${difficulty}.`,
        pt
            ? `Comparado aos outros campeões, ${name} começa com vida ${word(compare(champion.hp, averages.hp))} (${champion.hp}), armadura ${word(compare(full.stats.armor, averages.armor))} (${full.stats.armor}) e velocidade de movimento ${word(compare(champion.ms, averages.ms))} (${champion.ms}). O alcance de ataque é de ${champion.r} unidades.`
            : `Compared with other champions, ${name} starts with ${word(compare(champion.hp, averages.hp))} HP (${champion.hp}), ${word(compare(full.stats.armor, averages.armor))} armor (${full.stats.armor}) and ${word(compare(champion.ms, averages.ms))} move speed (${champion.ms}). Attack range is ${champion.r} units.`,
        pt
            ? `${name} tem ${full.skins.length - 1} ${full.skins.length - 1 === 1 ? 'skin' : 'skins'} além da aparência padrão.`
            : `${name} has ${full.skins.length - 1} ${full.skins.length - 1 === 1 ? 'skin' : 'skins'} besides the default look.`,
    ]
}

export function championMetaDescription(champion: LolChampion, language: Language) {
    const roles = champion.g.map((role) => roleLabel(role, language).toLowerCase())
    return language === 'en'
        ? `${champion.n[1]}, ${champion.t[1]}: ${listOf(roles, 'en')} champion. Abilities, base stats, lore, skins, tips and difficulty in League of Legends.`
        : `${champion.n[0]}, ${champion.t[0]}: campeão ${listOf(roles, 'pt')}. Habilidades, atributos base, história, skins, dicas e dificuldade no League of Legends.`
}
