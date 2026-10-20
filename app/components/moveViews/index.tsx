'use client'

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import { useTranslatedText } from "../../hooks/useTranslatedText";
import { prettify, type Language } from "../../i18n/translations";
import { describeAbility, describeMove } from "../../lib/moveText";
import type { AbilityProfile, MoveProfile } from "../../lib/movesServer";
import type { PokemonListItem } from "../../lib/pokemonServer";
import { typeLabel } from "../../lib/pokemonText";
import { getSpeciesArtwork } from "../../lib/sprites";
import { comboPath } from "../../lib/typeCombos";
import { TYPE_COLORS } from "../../lib/typeColors";

const LABELS = {
    pt: {
        moves: 'Golpes', abilities: 'Habilidades', about: 'Sobre o golpe', aboutAbility: 'Sobre a habilidade', effect: 'Efeito oficial',
        translated: 'Tradução automática do texto oficial em inglês.', learners: 'Pokémon que aprendem ({n})', holders: 'Pokémon com a habilidade ({n})',
        hidden: 'Como habilidade oculta ({n})', power: 'Poder', accuracy: 'Precisão', pp: 'PP', priority: 'Prioridade', category: 'Categoria',
        generation: 'Geração', type: 'Tipo', physical: 'Físico', special: 'Especial', status: 'Status', showAll: 'Mostrar todos',
        movesTitle: 'Golpes Pokémon por tipo', movesIntro: 'Todos os golpes dos jogos principais, separados por tipo. Abra cada um para ver poder, precisão, PP, efeitos e quais Pokémon aprendem.',
        abilitiesTitle: 'Habilidades Pokémon de A a Z', abilitiesIntro: 'Todas as habilidades dos jogos principais. Abra cada uma para ver o efeito e a lista de Pokémon que podem ter a habilidade, inclusive como oculta.',
        search: 'Buscar', names: 'Os nomes de golpes e habilidades seguem o inglês, como nos jogos, que não têm versão em português.',
    },
    en: {
        moves: 'Moves', abilities: 'Abilities', about: 'About the move', aboutAbility: 'About the ability', effect: 'Official effect',
        translated: 'Machine translation of the official English text.', learners: 'Pokémon that learn it ({n})', holders: 'Pokémon with the ability ({n})',
        hidden: 'As a hidden ability ({n})', power: 'Power', accuracy: 'Accuracy', pp: 'PP', priority: 'Priority', category: 'Category',
        generation: 'Generation', type: 'Type', physical: 'Physical', special: 'Special', status: 'Status', showAll: 'Show all',
        movesTitle: 'Pokémon moves by type', movesIntro: 'Every main-series move, grouped by type. Open each one to see power, accuracy, PP, effects and which Pokémon learn it.',
        abilitiesTitle: 'Pokémon abilities from A to Z', abilitiesIntro: 'Every main-series ability. Open each one to see its effect and the list of Pokémon that can have it, including as a hidden ability.',
        search: 'Search', names: 'Move and ability names follow the English games.',
    },
} satisfies Record<Language, Record<string, string>>

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3 rounded-3xl bg-white/90 p-6 shadow-lg dark:bg-zinc-900/90">
            <h2 className="text-xl font-black">{title}</h2>
            {children}
        </section>
    )
}

function TypeBadge({ type, language }: { type: string; language: Language }) {
    return (
        <Link href={comboPath([type])} className={`inline-block rounded-full px-3 py-1 text-xs font-black uppercase ${TYPE_COLORS[type]?.card ?? ''} ${TYPE_COLORS[type]?.text ?? ''}`}>
            {typeLabel(type, language)}
        </Link>
    )
}

function Breadcrumb({ section, href }: { section: string; href: string }) {
    return (
        <nav aria-label="breadcrumb" className="text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/pokemon" className="hover:underline">Pokédex</Link>
            {' / '}
            <Link href={href} className="hover:underline">{section}</Link>
        </nav>
    )
}

function OfficialEffect({ text }: { text: string }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const translation = useTranslatedText(text)
    if (!text) return null
    return (
        <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800">
            <p className="text-xs font-black uppercase text-zinc-500">{L.effect}</p>
            <p>{translation.text}</p>
            {translation.translated && <p className="mt-1 text-xs text-zinc-500">{L.translated}</p>}
        </div>
    )
}

const PREVIEW = 48

function PokemonList({ pokemon }: { pokemon: PokemonListItem[] }) {
    const { language } = useLanguage()
    const [all, setAll] = useState(pokemon.length <= PREVIEW)
    const shown = all ? pokemon : pokemon.slice(0, PREVIEW)
    return (
        <>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
                {shown.map(({ id, slug }) => (
                    <li key={id}>
                        <Link href={`/pokemon/${slug}`} prefetch={false} className="flex flex-col items-center gap-1 rounded-2xl bg-zinc-100 p-2 text-center text-xs font-bold hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                            <Image src={getSpeciesArtwork(id)} alt="" width={64} height={64} className="size-14 object-contain" />
                            {prettify(slug)}
                        </Link>
                    </li>
                ))}
            </ul>
            {!all && (
                <button type="button" onClick={() => setAll(true)} className="w-fit rounded-full bg-zinc-200 px-4 py-1.5 text-sm font-bold dark:bg-zinc-700">
                    {LABELS[language].showAll} ({pokemon.length})
                </button>
            )}
        </>
    )
}

export function MoveView({ move }: { move: MoveProfile }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const paragraphs = describeMove(move, language)
    const facts: [string, ReactNode][] = [
        [L.type, <TypeBadge key="type" type={move.type} language={language} />],
        [L.category, L[move.damageClass]],
        [L.power, move.power ?? '—'],
        [L.accuracy, move.accuracy ? `${move.accuracy}%` : '—'],
        [L.pp, move.pp ?? '—'],
        [L.priority, move.priority > 0 ? `+${move.priority}` : move.priority],
        [L.generation, move.generation],
    ]

    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <Breadcrumb section={L.moves} href="/pokemon/golpes" />
            <header className="flex flex-col gap-3">
                <h1 className="text-4xl font-black tracking-tight">{prettify(move.slug)}</h1>
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    {facts.map(([label, value]) => (
                        <div key={label} className="rounded-2xl bg-white p-3 text-center shadow dark:bg-zinc-900">
                            <dt className="text-xs font-bold uppercase text-zinc-500">{label}</dt>
                            <dd className="mt-1 text-lg font-black">{value}</dd>
                        </div>
                    ))}
                </dl>
            </header>
            <Panel title={L.about}>
                {paragraphs.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}
                <OfficialEffect text={move.effect} />
            </Panel>
            <Panel title={L.learners.replace('{n}', String(move.learners.length))}>
                <PokemonList pokemon={move.learners} />
            </Panel>
        </article>
    )
}

export function AbilityView({ ability }: { ability: AbilityProfile }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const paragraphs = describeAbility(ability, language)
    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <Breadcrumb section={L.abilities} href="/pokemon/habilidades" />
            <h1 className="text-4xl font-black tracking-tight">{prettify(ability.slug)}</h1>
            <Panel title={L.aboutAbility}>
                {paragraphs.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}
                <OfficialEffect text={ability.effect || ability.flavor} />
            </Panel>
            {ability.regular.length > 0 && (
                <Panel title={L.holders.replace('{n}', String(ability.regular.length))}>
                    <PokemonList pokemon={ability.regular} />
                </Panel>
            )}
            {ability.hidden.length > 0 && (
                <Panel title={L.hidden.replace('{n}', String(ability.hidden.length))}>
                    <PokemonList pokemon={ability.hidden} />
                </Panel>
            )}
        </article>
    )
}

export function MoveIndex({ groups }: { groups: { type: string; moves: string[] }[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-col gap-3">
                <h1 className="text-4xl font-black tracking-tight">{L.movesTitle}</h1>
                <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">{L.movesIntro}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{L.names}</p>
            </header>
            {groups.map(({ type, moves }) => (
                <section key={type} id={type} className="flex scroll-mt-24 flex-col gap-2 rounded-3xl bg-white/90 p-6 shadow-lg dark:bg-zinc-900/90">
                    <h2 className="flex items-center gap-2 text-xl font-black"><TypeBadge type={type} language={language} /> <span className="text-sm text-zinc-500">{moves.length}</span></h2>
                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-x-4 gap-y-1 text-sm">
                        {moves.map((slug) => (
                            <li key={slug}><Link href={`/pokemon/golpes/${slug}`} prefetch={false} className="hover:text-red-600 hover:underline">{prettify(slug)}</Link></li>
                        ))}
                    </ul>
                </section>
            ))}
        </article>
    )
}

export function AbilityIndex({ abilities }: { abilities: string[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const groups = [...new Set(abilities.map((slug) => slug[0].toUpperCase()))].map((letter) => ({
        letter,
        items: abilities.filter((slug) => slug[0].toUpperCase() === letter),
    }))
    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-col gap-3">
                <h1 className="text-4xl font-black tracking-tight">{L.abilitiesTitle}</h1>
                <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">{L.abilitiesIntro}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{L.names}</p>
            </header>
            {groups.map(({ letter, items }) => (
                <section key={letter} className="flex flex-col gap-2 rounded-3xl bg-white/90 p-6 shadow-lg dark:bg-zinc-900/90">
                    <h2 className="text-xl font-black">{letter}</h2>
                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-x-4 gap-y-1 text-sm">
                        {items.map((slug) => (
                            <li key={slug}><Link href={`/pokemon/habilidades/${slug}`} prefetch={false} className="hover:text-red-600 hover:underline">{prettify(slug)}</Link></li>
                        ))}
                    </ul>
                </section>
            ))}
        </article>
    )
}
