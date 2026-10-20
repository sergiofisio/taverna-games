'use client'

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import { prettify, type Language } from "../../i18n/translations";
import { POPULAR_COMPARISONS, bestStabMultiplier, comparePath, describeComparison } from "../../lib/pokemonCompare";
import type { PokemonListItem, PokemonProfile } from "../../lib/pokemonServer";
import { statLabel, statTotal, typeLabel } from "../../lib/pokemonText";
import { getOfficialArtwork } from "../../lib/sprites";
import { comboPath } from "../../lib/typeCombos";
import { TYPE_COLORS } from "../../lib/typeColors";

const LABELS = {
    pt: {
        title: 'Comparador de Pokémon', intro: 'Coloque dois Pokémon lado a lado e compare atributos base, tipos, velocidade e vantagem de tipo em batalha.',
        first: 'Primeiro Pokémon', second: 'Segundo Pokémon', compare: 'Comparar', invalid: 'Escolha dois Pokémon diferentes da lista.',
        popular: 'Comparações populares', summary: 'Resumo', stats: 'Atributos base', total: 'Total', typeEdge: 'Vantagem de tipo',
        hits: 'Melhor golpe do próprio tipo de {a} contra {b}: {x}×', another: 'Comparar outros Pokémon', profile: 'Ver página de {name}',
        breadcrumb: 'Comparador', howTo: 'O que o comparador analisa',
        howToText: [
            'Os atributos base mostram o potencial de cada espécie em PS, Ataque, Defesa, Ataque Especial, Defesa Especial e Velocidade. A barra verde marca quem leva vantagem em cada um, e o total resume o poder geral.',
            'A Velocidade decide quem age primeiro em condições iguais, o que muitas vezes define a batalha. Já a vantagem de tipo compara o melhor golpe do próprio tipo de cada Pokémon contra o outro: 2× é super efetivo, ½× é pouco efetivo e 0× não causa dano.',
            'Lembre que habilidades, golpes, itens e o treino de cada Pokémon também contam. O comparador mostra a base da espécie, que é o melhor ponto de partida para escolher quem vai para o time.',
        ],
    },
    en: {
        title: 'Pokémon comparison', intro: 'Put two Pokémon side by side and compare base stats, types, speed and type advantage in battle.',
        first: 'First Pokémon', second: 'Second Pokémon', compare: 'Compare', invalid: 'Pick two different Pokémon from the list.',
        popular: 'Popular comparisons', summary: 'Summary', stats: 'Base stats', total: 'Total', typeEdge: 'Type advantage',
        hits: '{a}’s best same-type move against {b}: {x}×', another: 'Compare other Pokémon', profile: 'Open {name}’s page',
        breadcrumb: 'Comparison', howTo: 'What the comparison covers',
        howToText: [
            'Base stats show each species’ potential in HP, Attack, Defense, Special Attack, Special Defense and Speed. The green bar marks who has the edge in each one, and the total sums up overall power.',
            'Speed decides who moves first under equal conditions, which often decides the battle. Type advantage compares each Pokémon’s best same-type move against the other: 2× is super effective, ½× is not very effective and 0× deals no damage.',
            'Remember that abilities, moves, items and training also matter. The comparison shows the species’ base, which is the best starting point for choosing who joins your team.',
        ],
    },
} satisfies Record<Language, Record<string, string | string[]>>

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3 rounded-3xl bg-white/90 p-6 shadow-lg dark:bg-zinc-900/90">
            <h2 className="text-xl font-black">{title}</h2>
            {children}
        </section>
    )
}

export function ComparePicker({ list, initial = ['', ''] }: { list: PokemonListItem[]; initial?: [string, string] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const router = useRouter()
    const [values, setValues] = useState(initial.map(prettify))
    const [error, setError] = useState(false)
    const slugOf = (value: string) => list.find(({ slug }) => prettify(slug).toLowerCase() === value.trim().toLowerCase() || slug === value.trim().toLowerCase())?.slug

    const submit = (event: FormEvent) => {
        event.preventDefault()
        const [a, b] = values.map(slugOf)
        if (!a || !b || a === b) return setError(true)
        router.push(comparePath(a, b))
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-end">
                {[L.first, L.second].map((label, index) => (
                    <label key={label} className={`flex flex-col gap-1 text-sm font-bold ${index === 1 ? 'sm:order-3' : ''}`}>
                        {label}
                        <input
                            list="compare-pokemon"
                            value={values[index]}
                            onChange={(event) => {
                                setError(false)
                                setValues((current) => current.map((value, position) => (position === index ? event.target.value : value)))
                            }}
                            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 font-normal dark:border-zinc-700"
                        />
                    </label>
                ))}
                <span className="hidden text-center text-xl font-black sm:order-2 sm:block">vs</span>
                <button type="submit" className="rounded-xl bg-red-600 px-5 py-2 font-black text-white hover:bg-red-700 sm:order-4">{L.compare}</button>
            </div>
            <datalist id="compare-pokemon">
                {list.map(({ slug }) => <option key={slug} value={prettify(slug)} />)}
            </datalist>
            {error && <p role="alert" className="text-sm font-bold text-red-600">{L.invalid}</p>}
        </form>
    )
}

function PopularList() {
    return (
        <ul className="flex flex-wrap gap-2">
            {POPULAR_COMPARISONS.map(([a, b]) => (
                <li key={`${a}-${b}`}>
                    <Link href={comparePath(a, b)} className="block rounded-full bg-zinc-100 px-3 py-1 text-sm font-bold hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                        {prettify(a)} vs {prettify(b)}
                    </Link>
                </li>
            ))}
        </ul>
    )
}

export function CompareHome({ list }: { list: PokemonListItem[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-col gap-3">
                <h1 className="text-4xl font-black tracking-tight">{L.title}</h1>
                <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">{L.intro}</p>
            </header>
            <Panel title={L.compare}><ComparePicker list={list} /></Panel>
            <Panel title={L.popular}><PopularList /></Panel>
            <Panel title={L.howTo}>
                {L.howToText.map((paragraph) => <p key={paragraph} className="leading-relaxed text-zinc-700 dark:text-zinc-300">{paragraph}</p>)}
            </Panel>
        </article>
    )
}

function Side({ profile, language }: { profile: PokemonProfile; language: Language }) {
    const L = LABELS[language]
    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <Image src={getOfficialArtwork(profile.id)} alt={profile.name} width={200} height={200} className="size-40 object-contain drop-shadow-xl" />
            <p className="font-mono text-xs text-zinc-500">#{String(profile.id).padStart(4, '0')}</p>
            <h2 className="text-2xl font-black">{profile.name}</h2>
            <div className="flex gap-2">
                {profile.types.map((type) => (
                    <Link key={type} href={comboPath([type])} className={`rounded-full px-3 py-1 text-xs font-black uppercase ${TYPE_COLORS[type]?.card ?? ''} ${TYPE_COLORS[type]?.text ?? ''}`}>
                        {typeLabel(type, language)}
                    </Link>
                ))}
            </div>
            <Link href={`/pokemon/${profile.slug}`} className="text-sm font-bold text-red-600 hover:underline dark:text-red-400">{L.profile.replace('{name}', profile.name)} →</Link>
        </div>
    )
}

export function CompareView({ a, b, list }: { a: PokemonProfile; b: PokemonProfile; list: PokemonListItem[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const paragraphs = describeComparison(a, b, language)
    const max = Math.max(...a.stats.map(({ value }) => value), ...b.stats.map(({ value }) => value), 1)
    const rows = a.stats.map(({ name, value }) => ({ label: statLabel(name, language), a: value, b: b.stats.find((entry) => entry.name === name)?.value ?? 0, max }))
    const totalA = statTotal(a)
    const totalB = statTotal(b)

    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <nav aria-label="breadcrumb" className="text-sm text-zinc-500 dark:text-zinc-400">
                <Link href="/pokemon" className="hover:underline">Pokédex</Link>
                {' / '}
                <Link href="/pokemon/comparar" className="hover:underline">{L.breadcrumb}</Link>
            </nav>
            <h1 className="text-center text-3xl font-black tracking-tight">{a.name} vs {b.name}</h1>
            <section className="grid grid-cols-2 gap-4 rounded-3xl bg-white/90 p-6 shadow-lg dark:bg-zinc-900/90">
                <Side profile={a} language={language} />
                <Side profile={b} language={language} />
            </section>

            <Panel title={L.summary}>
                {paragraphs.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}
            </Panel>

            <Panel title={L.stats}>
                <dl className="flex flex-col gap-2">
                    {rows.map((row) => (
                        <div key={row.label} className="grid grid-cols-[2.5rem_1fr_6rem_1fr_2.5rem] items-center gap-2 text-sm">
                            <dd className={`text-right font-mono ${row.a > row.b ? 'font-black text-green-600' : ''}`}>{row.a}</dd>
                            <dd className="flex h-3 justify-end overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                                <span className={`h-full rounded-full ${row.a >= row.b ? 'bg-green-500' : 'bg-zinc-400'}`} style={{ width: `${(row.a / row.max) * 100}%` }} />
                            </dd>
                            <dt className="text-center font-bold">{row.label}</dt>
                            <dd className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                                <span className={`block h-full rounded-full ${row.b >= row.a ? 'bg-green-500' : 'bg-zinc-400'}`} style={{ width: `${(row.b / row.max) * 100}%` }} />
                            </dd>
                            <dd className={`font-mono ${row.b > row.a ? 'font-black text-green-600' : ''}`}>{row.b}</dd>
                        </div>
                    ))}
                    <div className="grid grid-cols-[2.5rem_1fr_6rem_1fr_2.5rem] items-center gap-2 border-t border-zinc-200 pt-2 text-sm font-black dark:border-zinc-700">
                        <dd className="text-right font-mono">{totalA}</dd>
                        <span />
                        <dt className="text-center">{L.total}</dt>
                        <span />
                        <dd className="font-mono">{totalB}</dd>
                    </div>
                </dl>
            </Panel>

            <Panel title={L.typeEdge}>
                <ul className="flex flex-col gap-1">
                    <li>{L.hits.replace('{a}', a.name).replace('{b}', b.name).replace('{x}', String(bestStabMultiplier(a, b)))}</li>
                    <li>{L.hits.replace('{a}', b.name).replace('{b}', a.name).replace('{x}', String(bestStabMultiplier(b, a)))}</li>
                </ul>
            </Panel>

            <Panel title={L.another}>
                <ComparePicker list={list} initial={[a.slug, b.slug]} />
                <PopularList />
            </Panel>
        </article>
    )
}
