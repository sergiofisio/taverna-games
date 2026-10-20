'use client'

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../../context/languageContext";
import type { Language } from "../../i18n/translations";
import { BG_TIERS, bgArt, type BgData } from "../../lib/battlegrounds";
import { hsLabel, normalizeSearch } from "../../lib/hearthstone";
import { CardText } from "./cardImage";

const LABELS = {
    pt: {
        title: 'Campos de Batalha', intro: 'Todos os lacaios da taverna por tier, os heróis com seus Poderes Heroicos e os feitiços da taverna do modo Campos de Batalha do Hearthstone.',
        minions: 'Lacaios', heroes: 'Heróis', spells: 'Feitiços da taverna', tier: 'Tier', all: 'Todos', tribe: 'Tribo', none: 'Sem tribo',
        search: 'Buscar pelo nome', armor: '{n} de Armadura', cost: 'custa {n}', updated: 'Dados atualizados em {date}', empty: 'Nada encontrado.',
        basics: 'Como funcionam os Campos de Batalha',
        basicsText: [
            'Nos Campos de Batalha, oito jogadores escolhem um herói e montam um time de lacaios comprando na taverna de Bob. A cada turno você recebe ouro para comprar, vender e reorganizar lacaios; depois o combate acontece sozinho contra outro jogador, e quem perde sofre dano.',
            'A taverna tem tiers de 1 a 7. Subir de tier custa ouro, mas libera lacaios mais fortes. Juntar três cópias do mesmo lacaio cria uma versão dourada, com o dobro de atributos, e dá uma descoberta do tier seguinte.',
            'As tribos são a base das estratégias: cada partida usa só algumas delas, então vale olhar quais estão disponíveis antes de decidir o plano. O Poder Heroico de cada herói muda bastante o ritmo, por isso a escolha do herói no início pesa tanto.',
        ],
    },
    en: {
        title: 'Battlegrounds', intro: 'Every tavern minion by tier, every hero with their Hero Power and every tavern spell from Hearthstone Battlegrounds.',
        minions: 'Minions', heroes: 'Heroes', spells: 'Tavern spells', tier: 'Tier', all: 'All', tribe: 'Tribe', none: 'No tribe',
        search: 'Search by name', armor: '{n} Armor', cost: 'costs {n}', updated: 'Data updated on {date}', empty: 'Nothing found.',
        basics: 'How Battlegrounds works',
        basicsText: [
            'In Battlegrounds, eight players pick a hero and build a team of minions bought from Bob’s tavern. Each turn you get gold to buy, sell and rearrange minions; then combat plays out automatically against another player, and the loser takes damage.',
            'The tavern has tiers from 1 to 7. Leveling up costs gold but unlocks stronger minions. Combining three copies of the same minion creates a golden version with double stats and grants a discover from the next tier.',
            'Tribes are the core of every strategy: each game only uses some of them, so check which are available before settling on a plan. Each hero’s Hero Power changes the pace a lot, which is why the hero pick at the start matters so much.',
        ],
    },
} satisfies Record<Language, Record<string, string | string[]>>

type Tab = 'minions' | 'heroes' | 'spells'
const panel = 'flex flex-col gap-3 rounded-3xl border-2 border-amber-500/30 bg-[#2b1a10]/90 p-6 text-amber-50 shadow-xl'
const pill = (active: boolean) => `rounded-full px-3 py-1 text-sm font-black transition ${active ? 'bg-amber-400 text-amber-950' : 'bg-black/30 hover:bg-black/50'}`

function Art({ id, alt }: { id: string; alt: string }) {
    return <Image src={bgArt(id)} alt={alt} width={64} height={64} unoptimized loading="lazy" className="size-14 shrink-0 rounded-full border-2 border-amber-500/60 object-cover" />
}

export default function BattlegroundsView({ data }: { data: BgData }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const pick = (pair: [string, string]) => (language === 'en' ? pair[1] : pair[0])
    const [tab, setTab] = useState<Tab>('minions')
    const [tier, setTier] = useState<number | null>(null)
    const [tribe, setTribe] = useState<string | null>(null)
    const [query, setQuery] = useState('')
    const normalized = normalizeSearch(query)
    const matches = (name: [string, string]) => !normalized || normalizeSearch(name[0]).includes(normalized) || normalizeSearch(name[1]).includes(normalized)
    const tribes = [...new Set(data.minions.flatMap(({ r }) => r))].filter((race) => race !== 'ALL').sort((a, b) => hsLabel(a, language).localeCompare(hsLabel(b, language)))

    const minions = data.minions.filter((minion) =>
        (tier === null || minion.l === tier)
        && (tribe === null || (tribe === 'NONE' ? minion.r.length === 0 : minion.r.includes(tribe) || minion.r.includes('ALL')))
        && matches(minion.n))
    const spells = data.spells.filter((spell) => (tier === null || spell.l === tier) && matches(spell.n))
    const heroes = data.heroes.filter((hero) => matches(hero.n))
    const date = new Date(`${data.updated}T12:00:00`).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'long' })

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-2">
                <Link href="/hearthstone" className="w-fit text-sm font-bold text-amber-300 underline-offset-2 hover:underline">← Hearthstone</Link>
                <h1 className="text-4xl font-black tracking-tight text-amber-100">{L.title}</h1>
                <p className="text-amber-100/75">{L.intro}</p>
                <p className="text-xs text-amber-100/50">{L.updated.replace('{date}', date)}</p>
            </header>

            <section className={panel}>
                <div role="tablist" className="flex flex-wrap gap-2">
                    {(['minions', 'heroes', 'spells'] as const).map((value) => (
                        <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={pill(tab === value)}>
                            {L[value]} ({value === 'minions' ? data.minions.length : value === 'heroes' ? data.heroes.length : data.spells.length})
                        </button>
                    ))}
                </div>
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={L.search}
                    className="rounded-xl border-2 border-amber-700/60 bg-black/30 px-3 py-2 text-sm text-amber-50 placeholder:text-amber-100/40"
                />
                {tab !== 'heroes' && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-amber-200/80">{L.tier}:</span>
                        <button type="button" onClick={() => setTier(null)} className={pill(tier === null)}>{L.all}</button>
                        {BG_TIERS.map((value) => <button key={value} type="button" onClick={() => setTier(value)} className={pill(tier === value)}>★ {value}</button>)}
                    </div>
                )}
                {tab === 'minions' && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-amber-200/80">{L.tribe}:</span>
                        <button type="button" onClick={() => setTribe(null)} className={pill(tribe === null)}>{L.all}</button>
                        {tribes.map((value) => <button key={value} type="button" onClick={() => setTribe(value)} className={pill(tribe === value)}>{hsLabel(value, language)}</button>)}
                        <button type="button" onClick={() => setTribe('NONE')} className={pill(tribe === 'NONE')}>{L.none}</button>
                    </div>
                )}
            </section>

            <section className={panel}>
                {tab === 'minions' && (minions.length ? (
                    <ul className="grid gap-3 md:grid-cols-2">
                        {minions.map((minion) => (
                            <li key={minion.d} className="flex gap-3 rounded-2xl bg-black/25 p-3">
                                <Art id={minion.i} alt={pick(minion.n)} />
                                <div className="min-w-0 text-sm">
                                    <p className="font-black text-amber-100">{pick(minion.n)} <span className="font-mono text-amber-300">★{minion.l}</span> <span className="font-mono text-amber-200/70">{minion.a}/{minion.h}</span></p>
                                    {minion.r.length > 0 && <p className="text-xs font-bold text-amber-200/60">{minion.r.map((race) => hsLabel(race, language)).join(' / ')}</p>}
                                    <CardText text={pick(minion.t)} className="text-amber-50/90" />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p>{L.empty}</p>)}

                {tab === 'heroes' && (heroes.length ? (
                    <ul className="grid gap-3 md:grid-cols-2">
                        {heroes.map((hero) => (
                            <li key={hero.d} className="flex gap-3 rounded-2xl bg-black/25 p-3">
                                <Art id={hero.i} alt={pick(hero.n)} />
                                <div className="min-w-0 text-sm">
                                    <p className="font-black text-amber-100">{pick(hero.n)} <span className="text-xs font-bold text-amber-200/70">{L.armor.replace('{n}', String(hero.ar))}</span></p>
                                    <p className="text-xs font-bold text-amber-300">{pick(hero.p.n)} · {L.cost.replace('{n}', String(hero.p.c))}</p>
                                    <CardText text={pick(hero.p.t)} className="text-amber-50/90" />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p>{L.empty}</p>)}

                {tab === 'spells' && (spells.length ? (
                    <ul className="grid gap-3 md:grid-cols-2">
                        {spells.map((spell) => (
                            <li key={spell.d} className="flex gap-3 rounded-2xl bg-black/25 p-3">
                                <Art id={spell.i} alt={pick(spell.n)} />
                                <div className="min-w-0 text-sm">
                                    <p className="font-black text-amber-100">{pick(spell.n)} <span className="font-mono text-amber-300">★{spell.l}</span> <span className="text-xs font-bold text-amber-200/70">{L.cost.replace('{n}', String(spell.c))}</span></p>
                                    <CardText text={pick(spell.t)} className="text-amber-50/90" />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p>{L.empty}</p>)}
            </section>

            <section className={panel}>
                <h2 className="text-xl font-black text-amber-200">{L.basics}</h2>
                {L.basicsText.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
        </div>
    )
}
