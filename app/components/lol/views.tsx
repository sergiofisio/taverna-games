'use client'

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import type { Language } from "../../i18n/translations";
import {
    LOL_ROLES, SPELL_LABELS, championIcon, championLoading, championName, championPath, championSplash, itemIcon, normalizeLol, pickLang,
    rangeLabel, roleLabel, runeIcon, spellIcon, type LolChampion,
} from "../../lib/lol";
import type { ChampionPage, LolItem, LolRuneTree } from "../../lib/lolServer";
import { describeChampion } from "../../lib/lolText";

const LABELS = {
    pt: {
        home: 'League of Legends', homeIntro: 'Campeões, itens e runas de Summoner\'s Rift em português, com habilidades, atributos, histórias e skins, além de desafios diários no estilo LoLdle.',
        champions: 'Campeões', championsDesc: 'Todos os campeões com habilidades, atributos, história e skins.',
        items: 'Itens', itemsDesc: 'Itens de Summoner\'s Rift com custo, atributos e receitas.',
        runes: 'Runas', runesDesc: 'As cinco árvores de runas e o que cada runa faz.',
        challenges: 'Desafios LoLdle', challengesDesc: 'Adivinhe o campeão por atributos, splash art ou habilidade.',
        basics: 'O básico do League of Legends',
        basicsText: [
            'League of Legends é um jogo de estratégia em que dois times de cinco campeões disputam o mapa de Summoner\'s Rift. O objetivo é destruir o Nexus inimigo, avançando pelas três rotas e derrubando as torres pelo caminho.',
            'Cada jogador ocupa uma posição: topo, selva, meio, atirador (rota inferior) e suporte. As classes dos campeões, como tanques, magos e assassinos, ajudam a entender que papel cada um cumpre na luta.',
            'Durante a partida você ganha ouro para comprar itens, que aumentam os atributos e dão efeitos especiais, e escolhe runas antes de começar, para reforçar o estilo do seu campeão.',
        ],
        search: 'Buscar campeão', all: 'Todos', difficulty: 'Dificuldade', resource: 'Recurso', range: 'Tipo de ataque',
        about: 'Sobre', abilities: 'Habilidades', lore: 'História', allyTips: 'Dicas para jogar com', enemyTips: 'Dicas para jogar contra',
        stats: 'Atributos base', skins: 'Skins', similar: 'Campeões parecidos', previous: 'Anterior', next: 'Próximo',
        cooldown: 'Recarga', cost: 'Custo', play: 'Jogue o LoLdle', playText: 'Teste se você reconhece este e outros campeões nos desafios diários.',
        playButton: 'Jogar agora', gold: '{n} de ouro', sell: 'vende por {n}', buildsFrom: 'Feito com', buildsInto: 'Vira', itemsTitle: 'Itens de Summoner\'s Rift',
        starter: 'Básicos', epic: 'Intermediários', legendary: 'Completos', runesTitle: 'Runas do League of Legends', keystone: 'Runa principal', slot: 'Linha {n}',
        attack: 'Ataque', defense: 'Defesa', magic: 'Magia', hp: 'Vida', mp: 'Mana', armor: 'Armadura', mr: 'Resist. mágica', ad: 'Dano de ataque',
        as: 'Vel. de ataque', ms: 'Vel. de movimento', attackRange: 'Alcance', perLevel: 'por nível', allItems: 'Todos os itens', tag: 'Categoria',
    },
    en: {
        home: 'League of Legends', homeIntro: 'Summoner\'s Rift champions, items and runes, with abilities, stats, lore and skins, plus LoLdle-style daily challenges.',
        champions: 'Champions', championsDesc: 'Every champion with abilities, stats, lore and skins.',
        items: 'Items', itemsDesc: 'Summoner\'s Rift items with cost, stats and recipes.',
        runes: 'Runes', runesDesc: 'The five rune trees and what each rune does.',
        challenges: 'LoLdle challenges', challengesDesc: 'Guess the champion by stats, splash art or ability.',
        basics: 'League of Legends basics',
        basicsText: [
            'League of Legends is a strategy game where two teams of five champions fight over Summoner\'s Rift. The goal is to destroy the enemy Nexus, pushing down three lanes and taking towers along the way.',
            'Each player fills a position: top, jungle, mid, bot (marksman) and support. Champion classes such as tanks, mages and assassins help explain the role each one plays in a fight.',
            'During a match you earn gold to buy items, which raise your stats and add special effects, and you pick runes before the game starts to reinforce your champion\'s style.',
        ],
        search: 'Search champion', all: 'All', difficulty: 'Difficulty', resource: 'Resource', range: 'Attack type',
        about: 'About', abilities: 'Abilities', lore: 'Lore', allyTips: 'Tips for playing', enemyTips: 'Tips for playing against',
        stats: 'Base stats', skins: 'Skins', similar: 'Similar champions', previous: 'Previous', next: 'Next',
        cooldown: 'Cooldown', cost: 'Cost', play: 'Play LoLdle', playText: 'See if you can recognize this and other champions in the daily challenges.',
        playButton: 'Play now', gold: '{n} gold', sell: 'sells for {n}', buildsFrom: 'Builds from', buildsInto: 'Builds into', itemsTitle: 'Summoner\'s Rift items',
        starter: 'Basic', epic: 'Epic', legendary: 'Legendary', runesTitle: 'League of Legends runes', keystone: 'Keystone', slot: 'Row {n}',
        attack: 'Attack', defense: 'Defense', magic: 'Magic', hp: 'HP', mp: 'Mana', armor: 'Armor', mr: 'Magic resist', ad: 'Attack damage',
        as: 'Attack speed', ms: 'Move speed', attackRange: 'Range', perLevel: 'per level', allItems: 'All items', tag: 'Category',
    },
} satisfies Record<Language, Record<string, string | string[]>>

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

const panel = 'flex flex-col gap-3 rounded-3xl border border-[#785a28] bg-[#091428]/90 p-6 shadow-xl'
const gold = 'text-[#c8aa6e]'

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className={panel}>
            <h2 className={`text-xl font-black ${gold}`}>{title}</h2>
            {children}
        </section>
    )
}

function Breadcrumb({ items }: { items: [string, string][] }) {
    return (
        <nav aria-label="breadcrumb" className="text-sm text-slate-400">
            {items.map(([label, href], index) => (
                <span key={href}>{index > 0 && ' / '}<Link href={href} className="hover:underline">{label}</Link></span>
            ))}
        </nav>
    )
}

export function LolHome({ version, featured }: { version: string; featured: LolChampion[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const sections = [
        ['/lol/campeoes', L.champions, L.championsDesc],
        ['/lol/itens', L.items, L.itemsDesc],
        ['/lol/runas', L.runes, L.runesDesc],
        ['/desafios/lol-atributos', L.challenges, L.challengesDesc],
    ] as const
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-col gap-2 text-center">
                <h1 className="text-4xl font-black tracking-tight text-[#f0e6d2] sm:text-5xl">{L.home}</h1>
                <p className="mx-auto max-w-2xl text-slate-300">{L.homeIntro}</p>
            </header>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sections.map(([href, title, text]) => (
                    <li key={href}>
                        <Link href={href} className="flex h-full flex-col gap-2 rounded-3xl border border-[#785a28] bg-linear-to-br from-[#0a3a4a] to-[#091428] p-5 transition hover:-translate-y-1 hover:border-[#c8aa6e]">
                            <span className="text-xl font-black text-[#f0e6d2]">{title}</span>
                            <span className="text-sm text-slate-300">{text}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Panel title={L.champions}>
                <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
                    {featured.map((champion) => (
                        <li key={champion.k}>
                            <Link href={championPath(champion)} className="flex flex-col items-center gap-1 text-center text-xs font-bold hover:text-[#c8aa6e]">
                                <Image src={championIcon(version, champion)} alt="" width={64} height={64} unoptimized className="size-14 rounded-full border-2 border-[#785a28]" />
                                {championName(champion, language)}
                            </Link>
                        </li>
                    ))}
                </ul>
            </Panel>
            <Panel title={L.basics}>
                {L.basicsText.map((paragraph) => <p key={paragraph} className="leading-relaxed text-slate-200">{paragraph}</p>)}
            </Panel>
        </div>
    )
}

export function ChampionIndex({ version, champions }: { version: string; champions: LolChampion[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [query, setQuery] = useState('')
    const [role, setRole] = useState('')
    const normalized = normalizeLol(query)
    const shown = champions.filter((champion) => (!role || champion.g.includes(role)) && (!normalized || champion.n.some((name) => normalizeLol(name).includes(normalized))))
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Breadcrumb items={[['League of Legends', '/lol']]} />
            <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-[#f0e6d2]">{L.champions}</h1>
                <p className="text-slate-300">{L.championsDesc}</p>
            </header>
            <section className={panel}>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={L.search} className="rounded-xl border border-[#785a28] bg-black/30 px-3 py-2 text-slate-100 placeholder:text-slate-500" />
                <div className="flex flex-wrap gap-2">
                    {['', ...LOL_ROLES].map((value) => (
                        <button key={value || 'all'} type="button" onClick={() => setRole(value)} className={`rounded-full px-3 py-1 text-sm font-bold ${role === value ? 'bg-[#c8aa6e] text-zinc-900' : 'bg-black/30 hover:bg-black/50'}`}>
                            {value ? roleLabel(value, language) : L.all}
                        </button>
                    ))}
                </div>
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
                    {shown.map((champion) => (
                        <li key={champion.k}>
                            <Link href={championPath(champion)} prefetch={false} className="flex flex-col items-center gap-1 text-center text-xs font-bold hover:text-[#c8aa6e]">
                                <Image src={championIcon(version, champion)} alt="" width={72} height={72} unoptimized loading="lazy" className="size-16 rounded-xl border-2 border-[#785a28]" />
                                {championName(champion, language)}
                                <span className="text-[10px] font-normal text-slate-400">{champion.g.map((value) => roleLabel(value, language)).join(' / ')}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}

function Bar({ label, value }: { label: string; value: number }) {
    return (
        <div className="grid grid-cols-[6rem_1fr_2rem] items-center gap-2 text-sm">
            <span className="font-bold">{label}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-black/40"><span className="block h-full rounded-full bg-[#c8aa6e]" style={{ width: `${value * 10}%` }} /></span>
            <span className="text-right font-mono">{value}</span>
        </div>
    )
}

export function ChampionView({ page }: { page: ChampionPage }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const { champion, full, version } = page
    const name = championName(champion, language)
    const paragraphs = describeChampion(page, language)
    const stats: [string, number, number | undefined][] = [
        [L.hp, full.stats.hp, full.stats.hpperlevel], [L.mp, full.stats.mp, full.stats.mpperlevel], [L.armor, full.stats.armor, full.stats.armorperlevel],
        [L.mr, full.stats.spellblock, full.stats.spellblockperlevel], [L.ad, full.stats.attackdamage, full.stats.attackdamageperlevel],
        [L.as, full.stats.attackspeed, full.stats.attackspeedperlevel], [L.ms, full.stats.movespeed, undefined], [L.attackRange, full.stats.attackrange, undefined],
    ]
    const tips = (list: string[]) => list.length > 0 && <ul className="flex list-disc flex-col gap-1 pl-5 text-slate-200">{list.map((tip) => <li key={tip}>{tip}</li>)}</ul>

    return (
        <article className="flex w-full flex-col">
            <header className="relative min-h-[22rem] w-full overflow-hidden">
                <Image src={championSplash(champion)} alt={name} fill priority unoptimized sizes="100vw" className="object-cover object-top" />
                <div className="absolute inset-0 bg-linear-to-t from-[#010a13] via-[#010a13]/60 to-transparent" />
                <div className="relative mx-auto flex h-full min-h-[22rem] max-w-6xl flex-col justify-end gap-2 px-4 pb-6">
                    <Breadcrumb items={[['League of Legends', '/lol'], [L.champions, '/lol/campeoes']]} />
                    <h1 className="text-5xl font-black tracking-tight text-[#f0e6d2]">{name}</h1>
                    <p className={`text-lg ${gold}`}>{capitalize(pickLang(champion.t, language))}</p>
                    <p className="text-sm text-slate-200">{champion.g.map((role) => roleLabel(role, language)).join(' / ')} · {pickLang(champion.p, language) || '—'} · {rangeLabel(champion, language)}</p>
                </div>
            </header>

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <Panel title={L.about}>
                        {paragraphs.map((paragraph) => <p key={paragraph} className="leading-relaxed text-slate-200">{paragraph}</p>)}
                    </Panel>
                    <Panel title={L.difficulty}>
                        <Bar label={L.attack} value={champion.f.attack} />
                        <Bar label={L.defense} value={champion.f.defense} />
                        <Bar label={L.magic} value={champion.f.magic} />
                        <Bar label={L.difficulty} value={champion.f.difficulty} />
                    </Panel>
                </div>

                <Panel title={L.abilities}>
                    <ul className="flex flex-col gap-4">
                        {champion.s.map((spell, index) => {
                            const detail = index === 0 ? null : full.spells[index - 1]
                            return (
                                <li key={spell.k} className="flex gap-4">
                                    <Image src={spellIcon(version, spell.img)} alt="" width={64} height={64} unoptimized className="size-14 shrink-0 rounded-xl border border-[#785a28]" />
                                    <div className="flex flex-col gap-1">
                                        <p className="font-black text-[#f0e6d2]"><span className={gold}>{pickLang(SPELL_LABELS[spell.k], language)}</span> · {pickLang(spell.n, language)}</p>
                                        <p className="text-sm leading-relaxed text-slate-200">{pickLang(detail ? detail.d : full.passive, language)}</p>
                                        {detail && <p className="text-xs text-slate-400">{L.cooldown}: {detail.cd}s{detail.cost && detail.cost !== '0' ? ` · ${L.cost}: ${detail.cost}` : ''}</p>}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </Panel>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Panel title={`${L.allyTips} ${name}`}>{tips(pickLang(full.ally, language))}</Panel>
                    <Panel title={`${L.enemyTips} ${name}`}>{tips(pickLang(full.enemy, language))}</Panel>
                </div>

                <Panel title={L.stats}>
                    <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map(([label, value, perLevel]) => (
                            <div key={label} className="rounded-xl bg-black/30 p-3">
                                <dt className="text-xs font-bold uppercase text-slate-400">{label}</dt>
                                <dd className="font-black">{value}{perLevel ? <span className="text-xs font-normal text-slate-400"> (+{perLevel} {L.perLevel})</span> : null}</dd>
                            </div>
                        ))}
                    </dl>
                </Panel>

                <Panel title={L.lore}><p className="leading-relaxed text-slate-200">{pickLang(full.lore, language)}</p></Panel>

                <Panel title={`${L.skins} (${full.skins.length})`}>
                    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
                        {full.skins.map((skin) => (
                            <li key={skin.num} className="flex flex-col gap-1 text-center text-xs">
                                <Image src={championLoading(champion, skin.num)} alt={pickLang(skin.n, language)} width={154} height={280} unoptimized loading="lazy" className="aspect-[154/280] w-full rounded-xl border border-[#785a28] object-cover" />
                                <span className="font-bold">{skin.num === 0 ? name : pickLang(skin.n, language)}</span>
                            </li>
                        ))}
                    </ul>
                </Panel>

                <Panel title={L.similar}>
                    <ul className="flex flex-wrap gap-3">
                        {page.similar.map((other) => (
                            <li key={other.k}>
                                <Link href={championPath(other)} className="flex flex-col items-center gap-1 text-xs font-bold hover:text-[#c8aa6e]">
                                    <Image src={championIcon(version, other)} alt="" width={56} height={56} unoptimized className="size-14 rounded-full border-2 border-[#785a28]" />
                                    {championName(other, language)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>

                <section className="flex flex-col items-start gap-3 rounded-3xl bg-linear-to-r from-[#785a28] to-[#0a3a4a] p-6">
                    <h2 className="text-xl font-black text-[#f0e6d2]">{L.play}</h2>
                    <p className="text-slate-100">{L.playText}</p>
                    <Link href="/desafios/lol-splash" className="rounded-full bg-[#c8aa6e] px-5 py-2 font-black text-zinc-900 hover:bg-[#f0e6d2]">{L.playButton}</Link>
                </section>

                <nav className="flex justify-between gap-3 text-sm font-bold">
                    <Link href={championPath(page.previous)} className="rounded-full bg-black/40 px-4 py-2 hover:bg-black/60">← {L.previous}: {championName(page.previous, language)}</Link>
                    <Link href={championPath(page.next)} className="rounded-full bg-black/40 px-4 py-2 hover:bg-black/60">{L.next}: {championName(page.next, language)} →</Link>
                </nav>
            </div>
        </article>
    )
}

const TIER_KEYS: Record<number, 'starter' | 'epic' | 'legendary'> = { 1: 'starter', 2: 'epic', 3: 'legendary' }

export function ItemIndex({ version, items, slugs }: { version: string; items: LolItem[]; slugs: Record<number, string> }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Breadcrumb items={[['League of Legends', '/lol']]} />
            <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-[#f0e6d2]">{L.itemsTitle}</h1>
                <p className="text-slate-300">{L.itemsDesc}</p>
            </header>
            {[1, 2, 3].map((depth) => (
                <Panel key={depth} title={L[TIER_KEYS[depth]]}>
                    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {items.filter((item) => Math.min(item.depth, 3) === depth).map((item) => (
                            <li key={item.id}>
                                <Link href={`/lol/itens/${slugs[item.id]}`} prefetch={false} className="flex items-center gap-3 rounded-xl bg-black/30 p-2 hover:bg-black/50">
                                    <Image src={itemIcon(version, item.id)} alt="" width={40} height={40} unoptimized loading="lazy" className="size-10 rounded border border-[#785a28]" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-bold">{pickLang(item.n, language)}</span>
                                        <span className="block text-xs text-[#c8aa6e]">{L.gold.replace('{n}', String(item.gold))}</span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>
            ))}
        </div>
    )
}

export function ItemView({ version, item, from, into, slugs }: { version: string; item: LolItem; from: LolItem[]; into: LolItem[]; slugs: Record<number, string> }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const list = (entries: LolItem[]) => (
        <ul className="flex flex-wrap gap-2">
            {entries.map((entry) => (
                <li key={entry.id}>
                    <Link href={`/lol/itens/${slugs[entry.id]}`} className="flex items-center gap-2 rounded-xl bg-black/30 px-2 py-1 text-sm font-bold hover:bg-black/50">
                        <Image src={itemIcon(version, entry.id)} alt="" width={32} height={32} unoptimized className="size-8 rounded" />
                        {pickLang(entry.n, language)}
                    </Link>
                </li>
            ))}
        </ul>
    )
    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
            <Breadcrumb items={[['League of Legends', '/lol'], [L.items, '/lol/itens']]} />
            <header className="flex items-center gap-4">
                <Image src={itemIcon(version, item.id)} alt="" width={80} height={80} unoptimized className="size-20 rounded-xl border-2 border-[#c8aa6e]" />
                <div>
                    <h1 className="text-4xl font-black text-[#f0e6d2]">{pickLang(item.n, language)}</h1>
                    <p className={gold}>{L.gold.replace('{n}', String(item.gold))} · {L.sell.replace('{n}', String(item.sell))}</p>
                    {pickLang(item.pl, language) && <p className="text-sm text-slate-300">{pickLang(item.pl, language)}</p>}
                </div>
            </header>
            <Panel title={L.about}><p className="whitespace-pre-line leading-relaxed text-slate-200">{pickLang(item.d, language)}</p></Panel>
            {from.length > 0 && <Panel title={L.buildsFrom}>{list(from)}</Panel>}
            {into.length > 0 && <Panel title={L.buildsInto}>{list(into)}</Panel>}
            <Link href="/lol/itens" className="self-start font-bold text-[#c8aa6e] underline underline-offset-2">{L.allItems} →</Link>
        </div>
    )
}

export function RunesView({ trees }: { trees: LolRuneTree[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Breadcrumb items={[['League of Legends', '/lol']]} />
            <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-[#f0e6d2]">{L.runesTitle}</h1>
                <p className="text-slate-300">{L.runesDesc}</p>
            </header>
            {trees.map((tree) => (
                <section key={tree.id} id={tree.key.toLowerCase()} className={`${panel} scroll-mt-24`}>
                    <h2 className={`flex items-center gap-3 text-2xl font-black ${gold}`}>
                        <Image src={runeIcon(tree.icon)} alt="" width={40} height={40} unoptimized className="size-10" />
                        {pickLang(tree.n, language)}
                    </h2>
                    {tree.slots.map((slot, index) => (
                        <div key={index} className="flex flex-col gap-2">
                            <h3 className="text-sm font-black uppercase text-slate-400">{index === 0 ? L.keystone : L.slot.replace('{n}', String(index))}</h3>
                            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {slot.map((rune) => (
                                    <li key={rune.id} className="flex gap-3 rounded-2xl bg-black/30 p-3">
                                        <Image src={runeIcon(rune.icon)} alt="" width={48} height={48} unoptimized loading="lazy" className="size-12 shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-black text-[#f0e6d2]">{pickLang(rune.n, language)}</p>
                                            <p className="text-slate-300">{pickLang(rune.d, language)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            ))}
        </div>
    )
}
