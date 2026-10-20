import { POKEMON_TYPES, getSpeciesId } from "./pokeapi";
import { LAST_POKEMON_ID, NotFoundError, getJson, getPokemonList, type PokemonListItem } from "./pokemonServer";

const SLUG = /^[a-z0-9-]+$/
const GENERATIONS = ['generation-i', 'generation-ii', 'generation-iii', 'generation-iv', 'generation-v', 'generation-vi', 'generation-vii', 'generation-viii', 'generation-ix']
const generationNumber = (name: string) => GENERATIONS.indexOf(name) + 1

type Named = { name: string; url: string }
type EffectEntry = { effect: string; short_effect: string; language: { name: string } }

interface RawMove {
    id: number
    name: string
    accuracy: number | null
    effect_chance: number | null
    pp: number | null
    priority: number
    power: number | null
    damage_class: Named
    effect_entries: EffectEntry[]
    generation: Named
    meta: {
        ailment: Named
        category: Named
        min_hits: number | null
        max_hits: number | null
        min_turns: number | null
        max_turns: number | null
        drain: number
        healing: number
        crit_rate: number
        ailment_chance: number
        flinch_chance: number
        stat_chance: number
    } | null
    stat_changes: { change: number; stat: Named }[]
    target: Named
    type: Named
    learned_by_pokemon: Named[]
}

export interface MoveProfile {
    id: number
    slug: string
    type: string
    damageClass: 'physical' | 'special' | 'status'
    power: number | null
    accuracy: number | null
    pp: number | null
    priority: number
    generation: number
    target: string
    effect: string
    ailment: string | null
    ailmentChance: number
    category: string | null
    minHits: number | null
    maxHits: number | null
    minTurns: number | null
    maxTurns: number | null
    drain: number
    healing: number
    critRate: number
    flinchChance: number
    statChance: number
    statChanges: { stat: string; change: number }[]
    learners: PokemonListItem[]
}

const effectText = (entries: EffectEntry[], chance: number | null) =>
    (entries.find(({ language }) => language.name === 'en')?.short_effect ?? '').replace(/\$effect_chance/g, String(chance ?? ''))

const speciesOf = async (named: Named[]) => {
    const list = await getPokemonList()
    const byId = new Map(list.map((item) => [item.id, item]))
    const seen = new Set<number>()
    return named.flatMap(({ url }) => {
        const id = getSpeciesId(url)
        const item = byId.get(id)
        if (!item || id > LAST_POKEMON_ID || seen.has(id)) return []
        seen.add(id)
        return [item]
    }).sort((a, b) => a.id - b.id)
}

export async function getMove(slug: string): Promise<MoveProfile | null> {
    if (!SLUG.test(slug)) return null
    try {
        const move = await getJson<RawMove>(`move/${slug}/`)
        if (move.name !== slug || move.id > 10000) return null
        const meta = move.meta
        return {
            id: move.id,
            slug: move.name,
            type: move.type.name,
            damageClass: move.damage_class.name as MoveProfile['damageClass'],
            power: move.power,
            accuracy: move.accuracy,
            pp: move.pp,
            priority: move.priority,
            generation: generationNumber(move.generation.name),
            target: move.target.name,
            effect: effectText(move.effect_entries, move.effect_chance),
            ailment: meta && !['none', 'unknown'].includes(meta.ailment.name) ? meta.ailment.name : null,
            ailmentChance: meta?.ailment_chance ?? 0,
            category: meta?.category.name ?? null,
            minHits: meta?.min_hits ?? null,
            maxHits: meta?.max_hits ?? null,
            minTurns: meta?.min_turns ?? null,
            maxTurns: meta?.max_turns ?? null,
            drain: meta?.drain ?? 0,
            healing: meta?.healing ?? 0,
            critRate: meta?.crit_rate ?? 0,
            flinchChance: meta?.flinch_chance ?? 0,
            statChance: meta?.stat_chance ?? 0,
            statChanges: move.stat_changes.map(({ stat, change }) => ({ stat: stat.name, change })),
            learners: await speciesOf(move.learned_by_pokemon),
        }
    } catch (error) {
        if (error instanceof NotFoundError) return null
        throw error
    }
}

export async function getMovesByType() {
    const byType = await Promise.all(POKEMON_TYPES.map((type) =>
        getJson<{ moves: Named[] }>(`type/${type}/`).then(({ moves }) => ({
            type,
            moves: moves.filter(({ url }) => getSpeciesId(url) < 10000).map(({ name }) => name).sort(),
        })),
    ))
    return byType
}

interface RawAbility {
    id: number
    name: string
    is_main_series: boolean
    generation: Named
    effect_entries: EffectEntry[]
    flavor_text_entries: { flavor_text: string; language: { name: string } }[]
    pokemon: { is_hidden: boolean; pokemon: Named }[]
}

export interface AbilityProfile {
    id: number
    slug: string
    generation: number
    effect: string
    flavor: string
    regular: PokemonListItem[]
    hidden: PokemonListItem[]
}

export async function getAbility(slug: string): Promise<AbilityProfile | null> {
    if (!SLUG.test(slug)) return null
    try {
        const ability = await getJson<RawAbility>(`ability/${slug}/`)
        if (ability.name !== slug || !ability.is_main_series || ability.id > 10000) return null
        const flavor = ability.flavor_text_entries.filter(({ language }) => language.name === 'en').at(-1)?.flavor_text ?? ''
        const [regular, hidden] = await Promise.all([
            speciesOf(ability.pokemon.filter(({ is_hidden }) => !is_hidden).map(({ pokemon }) => pokemon)),
            speciesOf(ability.pokemon.filter(({ is_hidden }) => is_hidden).map(({ pokemon }) => pokemon)),
        ])
        return {
            id: ability.id,
            slug: ability.name,
            generation: generationNumber(ability.generation.name),
            effect: effectText(ability.effect_entries, null),
            flavor: flavor.replace(/\s+/g, ' ').trim(),
            regular,
            hidden: hidden.filter((item) => !regular.some((other) => other.id === item.id)),
        }
    } catch (error) {
        if (error instanceof NotFoundError) return null
        throw error
    }
}

export async function getAbilityList() {
    const data = await getJson<{ results: Named[] }>('ability/?limit=1000')
    return data.results.filter(({ url }) => getSpeciesId(url) < 10000).map(({ name }) => name).sort()
}
