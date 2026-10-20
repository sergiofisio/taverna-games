import type { Language } from "../i18n/translations";
import type { PokemonProfile } from "./pokemonServer";
import { joinList, statLabel, statTotal, typeLabel } from "./pokemonText";
import { defenseMultiplier } from "./typeChart";

export const COMPARE_SEPARATOR = '-vs-'
export const comparePath = (a: string, b: string) => `/pokemon/comparar/${a}${COMPARE_SEPARATOR}${b}`

export function parseComparePair(pair: string): [string, string] | null {
    const parts = pair.split(COMPARE_SEPARATOR)
    if (parts.length !== 2 || !parts[0] || !parts[1] || parts[0] === parts[1]) return null
    return [parts[0], parts[1]]
}

export const POPULAR_COMPARISONS: [string, string][] = [
    ['pikachu', 'raichu'],
    ['charizard', 'blastoise'],
    ['venusaur', 'charizard'],
    ['mewtwo', 'mew'],
    ['lucario', 'zoroark'],
    ['gengar', 'alakazam'],
    ['garchomp', 'dragonite'],
    ['greninja', 'cinderace'],
    ['umbreon', 'espeon'],
    ['tyranitar', 'metagross'],
]

const stat = (profile: PokemonProfile, name: string) => profile.stats.find((entry) => entry.name === name)?.value ?? 0

export const bestStabMultiplier = (attacker: PokemonProfile, defender: PokemonProfile) =>
    Math.max(...attacker.types.map((type) => defenseMultiplier(type, defender.types)))

export function describeComparison(a: PokemonProfile, b: PokemonProfile, language: Language) {
    const pt = language === 'pt'
    const totalA = statTotal(a)
    const totalB = statTotal(b)
    const types = (profile: PokemonProfile) => joinList(profile.types.map((type) => typeLabel(type, language)), language)
    const paragraphs: string[] = []

    paragraphs.push(pt
        ? `${a.name} é do tipo ${types(a)} e ${b.name} é do tipo ${types(b)}. Somando os atributos base, ${totalA === totalB ? `os dois empatam com ${totalA}` : `${totalA > totalB ? a.name : b.name} leva vantagem com ${Math.max(totalA, totalB)} contra ${Math.min(totalA, totalB)}`}.`
        : `${a.name} is ${types(a)} type and ${b.name} is ${types(b)} type. In total base stats, ${totalA === totalB ? `both tie at ${totalA}` : `${totalA > totalB ? a.name : b.name} comes out ahead with ${Math.max(totalA, totalB)} against ${Math.min(totalA, totalB)}`}.`)

    const wins = a.stats.map((entry) => ({ name: entry.name, a: entry.value, b: stat(b, entry.name) }))
    const aBetter = wins.filter((entry) => entry.a > entry.b).map((entry) => statLabel(entry.name, language))
    const bBetter = wins.filter((entry) => entry.b > entry.a).map((entry) => statLabel(entry.name, language))
    const sentence = (text: string) => (text.endsWith('.') ? text : `${text}.`)
    paragraphs.push(sentence(pt
        ? `${a.name} é melhor em ${aBetter.length ? joinList(aBetter, 'pt') : 'nenhum atributo'}, enquanto ${b.name} se destaca em ${bBetter.length ? joinList(bBetter, 'pt') : 'nenhum atributo'}`
        : `${a.name} is better at ${aBetter.length ? joinList(aBetter, 'en') : 'no stat'}, while ${b.name} stands out in ${bBetter.length ? joinList(bBetter, 'en') : 'no stat'}`))

    const speedA = stat(a, 'speed')
    const speedB = stat(b, 'speed')
    paragraphs.push(speedA === speedB
        ? (pt ? `Os dois têm ${speedA} de Velocidade base, então quem age primeiro depende de investimento, natureza e itens.` : `Both have ${speedA} base Speed, so who moves first depends on investment, nature and items.`)
        : (pt
            ? `Com ${Math.max(speedA, speedB)} de Velocidade contra ${Math.min(speedA, speedB)}, ${speedA > speedB ? a.name : b.name} costuma agir primeiro em condições iguais.`
            : `With ${Math.max(speedA, speedB)} Speed against ${Math.min(speedA, speedB)}, ${speedA > speedB ? a.name : b.name} usually moves first under equal conditions.`))

    const aOnB = bestStabMultiplier(a, b)
    const bOnA = bestStabMultiplier(b, a)
    const effect = (value: number) => pt
        ? value === 0 ? 'não causam dano' : value >= 4 ? 'causam dano quádruplo' : value >= 2 ? 'são super efetivos' : value <= 0.5 ? 'são pouco efetivos' : 'causam dano normal'
        : value === 0 ? 'deal no damage' : value >= 4 ? 'deal quadruple damage' : value >= 2 ? 'are super effective' : value <= 0.5 ? 'are not very effective' : 'deal normal damage'
    paragraphs.push(pt
        ? `Nos tipos, os melhores golpes do próprio tipo de ${a.name} ${effect(aOnB)} contra ${b.name}, e os de ${b.name} ${effect(bOnA)} contra ${a.name}. ${aOnB > bOnA ? `A vantagem de tipo é de ${a.name}.` : bOnA > aOnB ? `A vantagem de tipo é de ${b.name}.` : 'Nenhum dos dois tem vantagem clara de tipo.'}`
        : `By type, ${a.name}'s best same-type moves ${effect(aOnB)} against ${b.name}, and ${b.name}'s ${effect(bOnA)} against ${a.name}. ${aOnB > bOnA ? `The type advantage goes to ${a.name}.` : bOnA > aOnB ? `The type advantage goes to ${b.name}.` : 'Neither has a clear type advantage.'}`)

    return paragraphs
}
