'use client'

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "../../context/authContext";
import { useLanguage } from "../../context/languageContext";
import { prettify, type Language } from "../../i18n/translations";
import type { TypedPokemon } from "../../lib/pokemonServer";
import { typeLabel } from "../../lib/pokemonText";
import { getSpeciesArtwork } from "../../lib/sprites";
import { TEAM_SIZE, analyzeTeam, describeTeam } from "../../lib/teamAnalysis";
import { comboPath } from "../../lib/typeCombos";
import { TYPE_COLORS } from "../../lib/typeColors";

const LABELS = {
    pt: {
        title: 'Montador de time Pokémon', intro: 'Monte um time de até 6 Pokémon e veja na hora quais tipos de golpe ameaçam o time, o que ele cobre no ataque e que tipo vale colocar na próxima vaga.',
        add: 'Adicionar Pokémon', addButton: 'Adicionar', invalid: 'Escolha um Pokémon da lista.', full: 'O time já tem 6 Pokémon.',
        remove: 'Remover {name}', clear: 'Limpar time', fromProfile: 'Usar o time do meu perfil', copy: 'Copiar link do time', copied: 'Link copiado!',
        empty: 'Adicione Pokémon para ver a análise.', analysis: 'Análise', defense: 'Defesa do time', defenseHint: 'Dano que cada membro recebe de cada tipo de golpe.',
        weak: 'Fracos', resist: 'Resistem', threats: 'Ameaças', uncovered: 'Sem cobertura no ataque', suggestions: 'Tipos sugeridos para a próxima vaga',
        covers: 'resiste a {types}', none: 'nenhum', howTo: 'Como usar o montador',
        howToText: [
            'Digite o nome de um Pokémon e clique em Adicionar, até completar seis. A tabela de defesa mostra o dano que cada membro recebe de cada tipo de golpe: vermelho é fraqueza, verde é resistência e preto é imunidade.',
            'Uma linha marcada como ameaça indica um tipo de golpe que acerta vários membros em cheio e que quase ninguém resiste. É o tipo que o adversário vai explorar, então vale ter pelo menos um Pokémon que resista a ele para trocar na hora certa.',
            'A cobertura de ataque considera só os golpes do mesmo tipo de cada Pokémon. Se algum tipo aparece sem cobertura, ensine a alguém um golpe de outro tipo que acerte esse alvo. O link do time guarda a escalação, então dá para compartilhar com amigos.',
        ],
    },
    en: {
        title: 'Pokémon team builder', intro: 'Build a team of up to 6 Pokémon and instantly see which move types threaten it, what it covers on offense and which type to add next.',
        add: 'Add Pokémon', addButton: 'Add', invalid: 'Pick a Pokémon from the list.', full: 'The team already has 6 Pokémon.',
        remove: 'Remove {name}', clear: 'Clear team', fromProfile: 'Use my profile team', copy: 'Copy team link', copied: 'Link copied!',
        empty: 'Add Pokémon to see the analysis.', analysis: 'Analysis', defense: 'Team defense', defenseHint: 'Damage each member takes from each move type.',
        weak: 'Weak', resist: 'Resist', threats: 'Threats', uncovered: 'No offensive coverage', suggestions: 'Suggested types for the next slot',
        covers: 'resists {types}', none: 'none', howTo: 'How to use the builder',
        howToText: [
            'Type a Pokémon’s name and click Add, up to six. The defense table shows the damage each member takes from each move type: red is a weakness, green is a resistance and black is an immunity.',
            'A row flagged as a threat is a move type that hits several members hard and that almost nobody resists. That is the type your opponent will exploit, so keep at least one Pokémon that resists it to switch in at the right time.',
            'Offensive coverage only counts each Pokémon’s same-type moves. If a type shows up uncovered, teach someone a move of another type that hits it. The team link stores your lineup, so you can share it with friends.',
        ],
    },
} satisfies Record<Language, Record<string, string | string[]>>

const CELL: Record<string, string> = {
    '4': 'bg-red-600 text-white font-black', '2': 'bg-red-400 text-white font-bold',
    '0.5': 'bg-green-400 text-white font-bold', '0.25': 'bg-green-600 text-white font-black', '0': 'bg-zinc-900 text-white font-black',
}
const CELL_LABEL: Record<string, string> = { '4': '4', '2': '2', '0.5': '½', '0.25': '¼', '0': '0' }

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
        <Link href={comboPath([type])} className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${TYPE_COLORS[type]?.card ?? ''} ${TYPE_COLORS[type]?.text ?? ''}`}>
            {typeLabel(type, language)}
        </Link>
    )
}

export default function TeamBuilder({ pokemon, initial }: { pokemon: TypedPokemon[]; initial: number[] }) {
    const { language } = useLanguage()
    const { profile } = useAuth()
    const L = LABELS[language]
    const byId = new Map(pokemon.map((entry) => [entry.id, entry]))
    const [team, setTeamState] = useState(() => initial.filter((id) => byId.has(id)).slice(0, TEAM_SIZE))
    const [query, setQuery] = useState('')
    const [message, setMessage] = useState('')
    const members = team.map((id) => byId.get(id)!).filter(Boolean)
    const analysis = analyzeTeam(members)
    const paragraphs = describeTeam(analysis, members.length, language)

    const setTeam = (next: number[]) => {
        setTeamState(next)
        setMessage('')
        const url = next.length ? `${window.location.pathname}?time=${next.join(',')}` : window.location.pathname
        window.history.replaceState(null, '', url)
    }

    const add = (event: FormEvent) => {
        event.preventDefault()
        if (team.length >= TEAM_SIZE) return setMessage(L.full)
        const value = query.trim().toLowerCase()
        const found = pokemon.find(({ slug }) => slug === value || prettify(slug).toLowerCase() === value)
        if (!found) return setMessage(L.invalid)
        setTeam([...team, found.id])
        setQuery('')
    }

    const copy = async () => {
        await navigator.clipboard.writeText(window.location.href)
        setMessage(L.copied)
    }

    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-col gap-3">
                <h1 className="text-4xl font-black tracking-tight">{L.title}</h1>
                <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">{L.intro}</p>
            </header>

            <Panel title={`${L.add} (${members.length}/${TEAM_SIZE})`}>
                <form onSubmit={add} className="flex flex-wrap gap-2">
                    <input
                        list="team-pokemon"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        aria-label={L.add}
                        className="min-w-48 flex-1 rounded-xl border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
                    />
                    <button type="submit" className="rounded-xl bg-red-600 px-5 py-2 font-black text-white hover:bg-red-700">{L.addButton}</button>
                </form>
                <datalist id="team-pokemon">
                    {pokemon.map(({ slug }) => <option key={slug} value={prettify(slug)} />)}
                </datalist>
                {message && <p role="status" className="text-sm font-bold">{message}</p>}

                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {members.map((member, index) => (
                        <li key={`${member.id}-${index}`} className="relative flex flex-col items-center gap-1 rounded-2xl bg-zinc-100 p-3 text-center dark:bg-zinc-800">
                            <button
                                type="button"
                                onClick={() => setTeam(team.filter((_, position) => position !== index))}
                                aria-label={L.remove.replace('{name}', prettify(member.slug))}
                                className="absolute top-1 right-2 text-lg font-black text-zinc-500 hover:text-red-600"
                            >
                                ×
                            </button>
                            <Image src={getSpeciesArtwork(member.id)} alt="" width={80} height={80} className="size-16 object-contain" />
                            <Link href={`/pokemon/${member.slug}`} className="text-sm font-black hover:underline">{prettify(member.slug)}</Link>
                            <div className="flex flex-wrap justify-center gap-1">{member.types.map((type) => <TypeBadge key={type} type={type} language={language} />)}</div>
                        </li>
                    ))}
                </ul>

                <div className="flex flex-wrap gap-2 text-sm">
                    {profile?.team?.length ? (
                        <button type="button" onClick={() => setTeam(profile.team.slice(0, TEAM_SIZE))} className="rounded-full bg-zinc-900 px-4 py-1.5 font-bold text-white dark:bg-white dark:text-zinc-900">{L.fromProfile}</button>
                    ) : null}
                    {members.length > 0 && (
                        <>
                            <button type="button" onClick={copy} className="rounded-full bg-zinc-200 px-4 py-1.5 font-bold dark:bg-zinc-700">{L.copy}</button>
                            <button type="button" onClick={() => setTeam([])} className="rounded-full border border-zinc-400 px-4 py-1.5 font-bold">{L.clear}</button>
                        </>
                    )}
                </div>
            </Panel>

            {members.length === 0 ? (
                <p className="text-center text-zinc-500">{L.empty}</p>
            ) : (
                <>
                    <Panel title={L.analysis}>
                        {paragraphs.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}
                        <dl className="flex flex-col gap-2 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <dt className="font-black">{L.threats}:</dt>
                                {analysis.threats.length ? analysis.threats.map((type) => <dd key={type}><TypeBadge type={type} language={language} /></dd>) : <dd>{L.none}</dd>}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <dt className="font-black">{L.uncovered}:</dt>
                                {analysis.uncovered.length ? analysis.uncovered.map((type) => <dd key={type}><TypeBadge type={type} language={language} /></dd>) : <dd>{L.none}</dd>}
                            </div>
                        </dl>
                        {members.length < TEAM_SIZE && analysis.suggestions.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <h3 className="font-black">{L.suggestions}</h3>
                                <ul className="flex flex-col gap-1 text-sm">
                                    {analysis.suggestions.map(({ type, covers }) => (
                                        <li key={type} className="flex flex-wrap items-center gap-2">
                                            <TypeBadge type={type} language={language} />
                                            <span>{L.covers.replace('{types}', covers.map((value) => typeLabel(value, language)).join(', '))}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Panel>

                    <Panel title={L.defense}>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{L.defenseHint}</p>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-center text-xs">
                                <thead>
                                    <tr>
                                        <th />
                                        {members.map((member, index) => (
                                            <th key={`${member.id}-${index}`} scope="col" className="p-1">
                                                <Image src={getSpeciesArtwork(member.id)} alt={prettify(member.slug)} width={40} height={40} className="mx-auto size-8 object-contain" />
                                            </th>
                                        ))}
                                        <th scope="col" className="p-1">{L.weak}</th>
                                        <th scope="col" className="p-1">{L.resist}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analysis.defense.map((row) => (
                                        <tr key={row.attacker} className={analysis.threats.includes(row.attacker) ? 'outline-2 outline-red-500' : ''}>
                                            <th scope="row" className={`p-1 text-left ${TYPE_COLORS[row.attacker]?.card ?? ''} ${TYPE_COLORS[row.attacker]?.text ?? ''}`}>{typeLabel(row.attacker, language)}</th>
                                            {row.multipliers.map((value, index) => (
                                                <td key={index} className={`border border-zinc-200 p-1 dark:border-zinc-800 ${CELL[String(value)] ?? ''}`}>{CELL_LABEL[String(value)] ?? ''}</td>
                                            ))}
                                            <td className={`border border-zinc-200 p-1 font-bold dark:border-zinc-800 ${row.weak >= 3 ? 'text-red-600' : ''}`}>{row.weak}</td>
                                            <td className="border border-zinc-200 p-1 font-bold dark:border-zinc-800">{row.resist}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </>
            )}

            <Panel title={L.howTo}>
                {L.howToText.map((paragraph) => <p key={paragraph} className="leading-relaxed text-zinc-700 dark:text-zinc-300">{paragraph}</p>)}
                <Link href="/guias/tabela-de-tipos" className="w-fit font-bold text-red-600 underline-offset-2 hover:underline dark:text-red-400">{language === 'pt' ? 'Tabela de tipos completa' : 'Full type chart'} →</Link>
            </Panel>
        </article>
    )
}
