'use client'

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import { prettify, type Language } from "../../i18n/translations";
import { POKEMON_TYPES } from "../../lib/pokeapi";
import type { TypedPokemon } from "../../lib/pokemonServer";
import { typeLabel } from "../../lib/pokemonText";
import { getSpeciesArtwork } from "../../lib/sprites";
import { comboLabel, comboPath, describeCombo, hasSameTypes, sortTypes } from "../../lib/typeCombos";
import { getDefensiveMatchups, getOffensiveTargets } from "../../lib/typeChart";
import { TYPE_COLORS } from "../../lib/typeColors";

const LABELS = {
    pt: {
        title: 'Calculadora de fraquezas Pokémon',
        intro: 'Escolha um ou dois tipos para ver na hora as fraquezas, resistências e imunidades da combinação, contra quem os golpes desses tipos são fortes e quais Pokémon têm exatamente esses tipos.',
        pick: 'Escolha até 2 tipos', clear: 'Limpar', defense: 'Defesa: dano recebido', offense: 'Ataque: golpes super efetivos contra',
        x4: '4×', x2: '2×', half: '½×', quarter: '¼×', immune: '0×', none: 'nenhum',
        pokemon: 'Pokémon com essa combinação', noPokemon: 'Nenhum Pokémon tem essa combinação.', open: 'Abrir a página dessa combinação',
        matrix: 'Todas as combinações de tipos', matrixHint: 'O número em cada casa é a quantidade de Pokémon com aquela combinação.',
        breadcrumb: 'Tipos', chart: 'Tabela de tipos completa', calculator: 'Calculadora de fraquezas', partial: 'Pokémon que têm {type} como um dos tipos: {n}',
        title1: 'Tipo {name}: fraquezas, resistências e Pokémon', title2: 'Tipos {name}: fraquezas, resistências e Pokémon',
        related: 'Combinações com {type}',
    },
    en: {
        title: 'Pokémon weakness calculator',
        intro: 'Pick one or two types to instantly see the combination’s weaknesses, resistances and immunities, what moves of those types hit hard, and which Pokémon have exactly those types.',
        pick: 'Pick up to 2 types', clear: 'Clear', defense: 'Defense: damage taken', offense: 'Offense: super effective against',
        x4: '4×', x2: '2×', half: '½×', quarter: '¼×', immune: '0×', none: 'none',
        pokemon: 'Pokémon with this combination', noPokemon: 'No Pokémon has this combination.', open: 'Open this combination’s page',
        matrix: 'Every type combination', matrixHint: 'The number in each cell is how many Pokémon have that combination.',
        breadcrumb: 'Types', chart: 'Full type chart', calculator: 'Weakness calculator', partial: 'Pokémon with {type} as one of their types: {n}',
        title1: '{name} type: weaknesses, resistances and Pokémon', title2: '{name} types: weaknesses, resistances and Pokémon',
        related: 'Combinations with {type}',
    },
} satisfies Record<Language, Record<string, string>>

function TypeBadge({ type, language, href }: { type: string; language: Language; href?: string }) {
    const colors = TYPE_COLORS[type] ?? TYPE_COLORS.normal
    const className = `inline-block rounded-full px-3 py-1 text-xs font-black uppercase ${colors.card} ${colors.text}`
    return href ? <Link href={href} className={className}>{typeLabel(type, language)}</Link> : <span className={className}>{typeLabel(type, language)}</span>
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3 rounded-3xl bg-white/90 p-6 shadow-lg dark:bg-zinc-900/90">
            <h2 className="text-xl font-black">{title}</h2>
            {children}
        </section>
    )
}

function Matchups({ types }: { types: string[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const matchups = getDefensiveMatchups(types)
    const rows: [string, string[]][] = [
        [L.x4, matchups.quadruple], [L.x2, matchups.double], [L.half, matchups.half], [L.quarter, matchups.quarter], [L.immune, matchups.immune],
    ]
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
                <h3 className="font-black">{L.defense}</h3>
                <dl className="flex flex-col gap-2">
                    {rows.filter(([, list]) => list.length).map(([label, list]) => (
                        <div key={label} className="flex flex-wrap items-center gap-2">
                            <dt className="w-10 font-mono text-sm font-black">{label}</dt>
                            {list.map((type) => <dd key={type}><TypeBadge type={type} language={language} href={comboPath([type])} /></dd>)}
                        </div>
                    ))}
                </dl>
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="font-black">{L.offense}</h3>
                <dl className="flex flex-col gap-2">
                    {types.map((type) => {
                        const { strong } = getOffensiveTargets(type)
                        return (
                            <div key={type} className="flex flex-wrap items-center gap-2">
                                <dt><TypeBadge type={type} language={language} /></dt>
                                <dd className="text-sm">→</dd>
                                {strong.length ? strong.map((target) => <dd key={target}><TypeBadge type={target} language={language} href={comboPath([target])} /></dd>) : <dd className="text-sm">{L.none}</dd>}
                            </div>
                        )
                    })}
                </dl>
            </div>
        </div>
    )
}

function PokemonGrid({ pokemon }: { pokemon: TypedPokemon[] }) {
    return (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
            {pokemon.map(({ id, slug }) => (
                <li key={id}>
                    <Link href={`/pokemon/${slug}`} prefetch={false} className="flex flex-col items-center gap-1 rounded-2xl bg-zinc-100 p-2 text-center text-xs font-bold hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                        <Image src={getSpeciesArtwork(id)} alt="" width={64} height={64} className="size-14 object-contain" />
                        <span className="font-mono text-[10px] text-zinc-500">#{String(id).padStart(4, '0')}</span>
                        {prettify(slug)}
                    </Link>
                </li>
            ))}
        </ul>
    )
}

export function TypeCalculator({ pokemon }: { pokemon: TypedPokemon[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [selected, setSelected] = useState<string[]>(['fire'])
    const toggle = (type: string) => setSelected((current) =>
        current.includes(type) ? current.filter((value) => value !== type) : sortTypes([...current.slice(-1), type]))
    const matches = selected.length ? pokemon.filter(({ types }) => hasSameTypes(types, selected)) : []
    const counts = new Map<string, number>()
    for (const { types } of pokemon) counts.set(sortTypes(types).join('+'), (counts.get(sortTypes(types).join('+')) ?? 0) + 1)

    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-col gap-3">
                <h1 className="text-4xl font-black tracking-tight">{L.title}</h1>
                <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">{L.intro}</p>
            </header>

            <Panel title={L.pick}>
                <div className="flex flex-wrap gap-2">
                    {POKEMON_TYPES.map((type) => {
                        const active = selected.includes(type)
                        const colors = TYPE_COLORS[type] ?? TYPE_COLORS.normal
                        return (
                            <button
                                key={type}
                                type="button"
                                aria-pressed={active}
                                onClick={() => toggle(type)}
                                className={`rounded-full px-3 py-1.5 text-xs font-black uppercase transition ${colors.card} ${colors.text} ${active ? 'ring-4 ring-zinc-900 dark:ring-white' : 'opacity-60 hover:opacity-100'}`}
                            >
                                {typeLabel(type, language)}
                            </button>
                        )
                    })}
                    {selected.length > 0 && (
                        <button type="button" onClick={() => setSelected([])} className="rounded-full border border-zinc-400 px-3 py-1.5 text-xs font-bold">{L.clear}</button>
                    )}
                </div>
            </Panel>

            {selected.length > 0 && (
                <>
                    <Panel title={comboLabel(selected, language)}>
                        <Matchups types={selected} />
                        <Link href={comboPath(selected)} className="w-fit font-bold text-red-600 underline-offset-2 hover:underline dark:text-red-400">{L.open} →</Link>
                    </Panel>
                    <Panel title={`${L.pokemon} (${matches.length})`}>
                        {matches.length ? <PokemonGrid pokemon={matches} /> : <p>{L.noPokemon}</p>}
                    </Panel>
                </>
            )}

            <Panel title={L.matrix}>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{L.matrixHint}</p>
                <div className="overflow-x-auto">
                    <table className="border-collapse text-center text-xs">
                        <thead>
                            <tr>
                                <th />
                                {POKEMON_TYPES.map((type) => (
                                    <th key={type} scope="col" className={`p-1 ${TYPE_COLORS[type]?.card ?? ''} ${TYPE_COLORS[type]?.text ?? ''}`}>
                                        <abbr title={typeLabel(type, language)} className="no-underline">{typeLabel(type, language).slice(0, 3)}</abbr>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {POKEMON_TYPES.map((row) => (
                                <tr key={row}>
                                    <th scope="row" className={`p-1 text-left ${TYPE_COLORS[row]?.card ?? ''} ${TYPE_COLORS[row]?.text ?? ''}`}>{typeLabel(row, language)}</th>
                                    {POKEMON_TYPES.map((column) => {
                                        const combo = sortTypes([row, column])
                                        const count = counts.get(combo.join('+')) ?? 0
                                        return (
                                            <td key={column} className="border border-zinc-200 p-0 dark:border-zinc-800">
                                                <Link
                                                    href={comboPath(combo)}
                                                    prefetch={false}
                                                    title={comboLabel(combo, language)}
                                                    className={`block min-w-7 p-1 hover:bg-red-100 dark:hover:bg-red-950 ${count ? 'font-bold' : 'text-zinc-300 dark:text-zinc-600'}`}
                                                >
                                                    {count}
                                                </Link>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </article>
    )
}

export function TypeComboView({ types, pokemon, partialCount }: { types: string[]; pokemon: TypedPokemon[]; partialCount: number }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const name = comboLabel(types, language)
    const examples = pokemon.slice(0, 4).map(({ slug }) => prettify(slug))
    const paragraphs = describeCombo(types, examples, pokemon.length, language)
    const related = types.length === 1 ? POKEMON_TYPES.filter((other) => other !== types[0]).map((other) => sortTypes([types[0], other])) : types.map((type) => [type])

    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <nav aria-label="breadcrumb" className="text-sm text-zinc-500 dark:text-zinc-400">
                <Link href="/pokemon" className="hover:underline">Pokédex</Link>
                {' / '}
                <Link href="/pokemon/tipos" className="hover:underline">{L.breadcrumb}</Link>
            </nav>
            <header className="flex flex-col gap-3">
                <div className="flex gap-2">{types.map((type) => <TypeBadge key={type} type={type} language={language} />)}</div>
                <h1 className="text-4xl font-black tracking-tight">{(types.length > 1 ? L.title2 : L.title1).replace('{name}', name)}</h1>
                {paragraphs.map((paragraph) => <p key={paragraph} className="leading-relaxed text-zinc-700 dark:text-zinc-300">{paragraph}</p>)}
                {types.length === 1 && <p className="text-sm text-zinc-500 dark:text-zinc-400">{L.partial.replace('{type}', name).replace('{n}', String(partialCount))}</p>}
            </header>

            <Panel title={name}>
                <Matchups types={types} />
            </Panel>

            <Panel title={`${L.pokemon} (${pokemon.length})`}>
                {pokemon.length ? <PokemonGrid pokemon={pokemon} /> : <p>{L.noPokemon}</p>}
            </Panel>

            <Panel title={types.length === 1 ? L.related.replace('{type}', name) : L.breadcrumb}>
                <ul className="flex flex-wrap gap-2">
                    {related.map((combo) => (
                        <li key={combo.join('-')}>
                            <Link href={comboPath(combo)} prefetch={false} className="block rounded-full bg-zinc-100 px-3 py-1 text-sm font-bold hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                                {comboLabel(combo, language)}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <Link href="/pokemon/tipos" className="font-bold text-red-600 underline-offset-2 hover:underline dark:text-red-400">{L.calculator} →</Link>
                    <Link href="/guias/tabela-de-tipos" className="font-bold text-red-600 underline-offset-2 hover:underline dark:text-red-400">{L.chart} →</Link>
                </div>
            </Panel>
        </article>
    )
}
