import type { Language } from "../i18n/translations";
import { POKEMON_TYPES } from "./pokeapi";
import { joinList, typeLabel } from "./pokemonText";
import { getDefensiveMatchups, getOffensiveTargets } from "./typeChart";

export const TYPE_SLUGS: Record<string, string> = {
    normal: 'normal', fire: 'fogo', water: 'agua', grass: 'planta', electric: 'eletrico', ice: 'gelo',
    fighting: 'lutador', poison: 'venenoso', ground: 'terrestre', flying: 'voador', psychic: 'psiquico', bug: 'inseto',
    rock: 'pedra', ghost: 'fantasma', dragon: 'dragao', dark: 'sombrio', steel: 'aco', fairy: 'fada',
}
const TYPE_BY_SLUG = Object.fromEntries(Object.entries(TYPE_SLUGS).map(([type, slug]) => [slug, type]))

export const sortTypes = (types: string[]) =>
    [...new Set(types)].sort((a, b) => POKEMON_TYPES.indexOf(a) - POKEMON_TYPES.indexOf(b))

export const comboSlug = (types: string[]) => sortTypes(types).map((type) => TYPE_SLUGS[type]).join('-')
export const comboPath = (types: string[]) => `/pokemon/tipos/${comboSlug(types)}`

export function parseCombo(slug: string): string[] | null {
    const types = slug.split('-').map((part) => TYPE_BY_SLUG[part])
    if (types.length < 1 || types.length > 2 || types.some((type) => !type) || new Set(types).size !== types.length) return null
    return sortTypes(types)
}

export function allCombos() {
    const combos: string[][] = POKEMON_TYPES.map((type) => [type])
    POKEMON_TYPES.forEach((first, index) => {
        for (const second of POKEMON_TYPES.slice(index + 1)) combos.push([first, second])
    })
    return combos
}

export const comboLabel = (types: string[], language: Language) =>
    joinList(types.map((type) => typeLabel(type, language)), language)

export const hasSameTypes = (pokemonTypes: string[], combo: string[]) =>
    pokemonTypes.length === combo.length && combo.every((type) => pokemonTypes.includes(type))

export function describeCombo(types: string[], examples: string[], total: number, language: Language) {
    const pt = language === 'pt'
    const list = (values: string[]) => joinList(values.map((type) => typeLabel(type, language)), language)
    const ofType = (values: string[]) => pt ? `${values.length > 1 ? 'dos tipos' : 'do tipo'} ${list(values)}` : list(values)
    const name = comboLabel(types, language)
    const subject = pt ? `Pokémon ${types.length > 1 ? 'dos tipos' : 'do tipo'} ${name}` : `${name} Pokémon`
    const matchups = getDefensiveMatchups(types)
    const weak = [...matchups.quadruple, ...matchups.double]
    const resisted = [...matchups.quarter, ...matchups.half, ...matchups.immune]
    const balance = resisted.length - weak.length

    const defense: string[] = []
    if (pt) {
        if (matchups.quadruple.length) defense.push(`recebem dano quádruplo de golpes ${ofType(matchups.quadruple)}`)
        if (matchups.double.length) defense.push(`recebem dano dobrado de golpes ${ofType(matchups.double)}`)
        if (matchups.quarter.length || matchups.half.length) defense.push(`resistem a golpes ${ofType([...matchups.quarter, ...matchups.half])}`)
        if (matchups.immune.length) defense.push(`são imunes a golpes ${ofType(matchups.immune)}`)
    } else {
        if (matchups.quadruple.length) defense.push(`take quadruple damage from ${list(matchups.quadruple)} moves`)
        if (matchups.double.length) defense.push(`take double damage from ${list(matchups.double)} moves`)
        if (matchups.quarter.length || matchups.half.length) defense.push(`resist ${list([...matchups.quarter, ...matchups.half])} moves`)
        if (matchups.immune.length) defense.push(`are immune to ${list(matchups.immune)} moves`)
    }

    const paragraphs = [
        pt
            ? `${subject} ${joinList(defense, 'pt')}.`
            : `${subject} ${joinList(defense, 'en')}.`,
        balance >= 4
            ? (pt ? `Com ${resisted.length} resistências e imunidades contra ${weak.length} fraquezas, é uma combinação defensiva muito sólida.` : `With ${resisted.length} resistances and immunities against ${weak.length} weaknesses, it is a very solid defensive combination.`)
            : balance <= -2
                ? (pt ? `São ${weak.length} fraquezas para ${resisted.length} resistências, então esses Pokémon dependem de Velocidade ou de força ofensiva para compensar.` : `That is ${weak.length} weaknesses against ${resisted.length} resistances, so these Pokémon rely on Speed or offensive power to make up for it.`)
                : (pt ? `O saldo é equilibrado: ${weak.length} fraquezas e ${resisted.length} resistências ou imunidades.` : `The balance is even: ${weak.length} weaknesses and ${resisted.length} resistances or immunities.`),
    ]

    const offense = types.map((type) => ({ type, ...getOffensiveTargets(type) }))
    paragraphs.push(offense.map(({ type, strong, weak: poor }) => pt
        ? `Golpes do tipo ${typeLabel(type, language)} são super efetivos contra ${list(strong) || 'nenhum tipo'}${poor.length ? ` e pouco efetivos contra ${list(poor)}` : ''}.`
        : `${typeLabel(type, language)} moves are super effective against ${list(strong) || 'no type'}${poor.length ? ` and not very effective against ${list(poor)}` : ''}.`).join(' '))

    if (weak.length) {
        const best = matchups.quadruple.length ? matchups.quadruple : matchups.double.slice(0, 3)
        paragraphs.push(pt
            ? `Para enfrentar esses Pokémon, a melhor escolha são golpes ${ofType(best)}${resisted.length ? `. Evite golpes ${ofType(resisted.slice(0, 4))}, que causam pouco ou nenhum dano` : ''}.`
            : `To beat these Pokémon, your best pick is ${list(best)} moves${resisted.length ? `. Avoid ${list(resisted.slice(0, 4))} moves, which deal little or no damage` : ''}.`)
    }

    paragraphs.push(total === 0
        ? (pt ? 'Ainda não existe nenhum Pokémon com essa combinação exata de tipos nos jogos principais.' : 'No Pokémon has this exact type combination in the main games yet.')
        : pt
            ? `Hoje ${total === 1 ? 'existe 1 Pokémon' : `existem ${total} Pokémon`} com essa combinação${examples.length ? `, como ${joinList(examples, 'pt')}` : ''}.`
            : `There ${total === 1 ? 'is 1 Pokémon' : `are ${total} Pokémon`} with this combination${examples.length ? `, such as ${joinList(examples, 'en')}` : ''}.`)

    return paragraphs
}
