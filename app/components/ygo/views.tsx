'use client'

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import type { Language } from "../../i18n/translations";
import {
    EXTRA_MAX, MAIN_MAX, MAIN_MIN, YGO_ATTRIBUTES, YGO_FRAMES, YGO_RACES, YGO_SPELL_TYPES, YGO_TRAP_TYPES, copyLimit, isBoosterSet, isExtraDeck,
    matchesYgo, normalizeYgo, openYgoPack, parseYdk, toYdk, ygoArchetypePath, ygoAttributeLabel, ygoBanLabel, ygoCardPath, ygoDeckProblems,
    ygoFrameLabel, ygoKindLabel, ygoName, ygoRaceLabel, ygoRarityRank, ygoSetPath, type YgoCard, type YgoData, type YgoSet, type YgoSetsData,
} from "../../lib/ygo";
import type { YgoPrinting, YgoText } from "../../lib/ygoServer";
import { BanBadge, CardFacts, CardText, RarityBadge, YgoCardImage, YgoCardModal, useYgoData, useYgoSets } from "./shared";

const LABELS = {
    pt: {
        home: 'Yu-Gi-Oh!', homeIntro: 'Todas as cartas de Yu-Gi-Oh! com os textos oficiais em português, arquétipos, a lista de proibidas e limitadas, coleções, simulador de pacotes, montador de decks e o desafio diário Ygodle.',
        library: 'Cartas', libraryDesc: 'Busque e filtre as mais de 14 mil cartas por tipo, atributo, nível e restrição.', archetypes: 'Arquétipos', archetypesDesc: 'Todos os arquétipos com as cartas de cada um.',
        banlist: 'Banlist', banlistDesc: 'A lista de cartas proibidas, limitadas e semilimitadas do TCG e do OCG.', sets: 'Coleções', setsDesc: 'Boosters, decks e coleções com todas as cartas e raridades.',
        packs: 'Simulador de pacotes', packsDesc: 'Abra boosters de graça e veja quais raridades aparecem.', decks: 'Montador de decks', decksDesc: 'Monte seu deck, confira as regras e exporte em YDK.',
        challenges: 'Ygodle', challengesDesc: 'Adivinhe a carta do dia por atributos, ilustração ou efeito.',
        popular: 'Cartas mais populares', topArchetypes: 'Arquétipos com mais cartas', latestSets: 'Coleções mais recentes', stats: '{cards} cartas · {archetypes} arquétipos · {sets} coleções',
        basics: 'Como funciona Yu-Gi-Oh!', basicsText: [
            'Cada duelista começa com 8000 Pontos de Vida e vence quem zerar os pontos do oponente. O Deck Principal tem de 40 a 60 cartas, e o Deck Adicional guarda até 15 monstros de Fusão, Sincro, Xyz e Link, invocados com materiais do campo.',
            'Há três tipos de cards: monstros, magias e armadilhas. Monstros têm atributo, tipo, nível (ou classe e link), ATK e DEF. Magias são jogadas no seu turno (as Rápidas também no do oponente), e armadilhas precisam ser baixadas antes de serem ativadas.',
            'A Konami publica a lista de cartas proibidas e limitadas: cartas proibidas não podem ser usadas, limitadas só com uma cópia e semilimitadas com até duas. O restante permite até três cópias por deck.',
        ],
        search: 'Buscar carta', allKinds: 'Todas as categorias', monsters: 'Monstros', spells: 'Magias', traps: 'Armadilhas', allAttributes: 'Todos os atributos', allRaces: 'Todos os tipos',
        allLevels: 'Qualquer nível', level: 'Nível/Classe/Link {n}', allBans: 'Qualquer restrição', unrestricted: 'Sem restrição', sort: 'Ordenar', sortPopular: 'Mais populares', sortName: 'Nome',
        sortAtk: 'Maior ATK', sortNew: 'Mais recentes', results: '{n} cartas', more: 'Mostrar mais', about: 'Sobre a carta', aboutArchetype: 'Sobre o arquétipo', aboutSet: 'Sobre a coleção', related: 'Outras cartas de {name}', printings: 'Coleções em que saiu',
        noText: 'Não foi possível carregar o texto da carta agora.', archetypeCards: '{n} cartas', searchArchetype: 'Buscar arquétipo', tcg: 'TCG', ocg: 'OCG (Ásia)',
        setCards: '{n} cartas · lançada em {date}', boostersOnly: 'Só boosters', allSets: 'Todas as coleções', openPack: 'Abrir pacote', open10: 'Abrir 10', opened: 'Pacotes abertos',
        hits: 'Cartas Ultra Rara ou melhores', packNote: 'As chances são aproximadas: cada pacote tem 9 cartas, com uma rara garantida e uma brilhante no último espaço.',
        main: 'Deck Principal', extra: 'Deck Adicional', deckEmpty: 'Adicione cartas pela busca abaixo ou importe um arquivo .ydk.', add: 'Adicionar', copyLink: 'Copiar link',
        copied: 'Link copiado!', valid: 'Deck válido para o formato avançado do TCG!', clear: 'Limpar', exportYdk: 'Baixar .ydk', importYdk: 'Importar .ydk',
        loading: 'Carregando cartas…', error: 'Não foi possível carregar as cartas.', credit: 'Dados e imagens das cartas fornecidos pelo YGOPRODeck.', english: 'Nome em inglês',
    },
    en: {
        home: 'Yu-Gi-Oh!', homeIntro: 'Every Yu-Gi-Oh! card with official texts, archetypes, the Forbidden & Limited List, sets, a pack simulator, deck builder and the daily Ygodle challenge.',
        library: 'Cards', libraryDesc: 'Search and filter more than 14,000 cards by type, attribute, level and restriction.', archetypes: 'Archetypes', archetypesDesc: 'Every archetype with all of its cards.',
        banlist: 'Banlist', banlistDesc: 'The TCG and OCG Forbidden, Limited and Semi-Limited lists.', sets: 'Sets', setsDesc: 'Boosters, decks and sets with every card and rarity.',
        packs: 'Pack simulator', packsDesc: 'Open boosters for free and see which rarities you pull.', decks: 'Deck builder', decksDesc: 'Build your deck, check the rules and export it as YDK.',
        challenges: 'Ygodle', challengesDesc: 'Guess the card of the day by attributes, artwork or effect.',
        popular: 'Most popular cards', topArchetypes: 'Archetypes with the most cards', latestSets: 'Latest sets', stats: '{cards} cards · {archetypes} archetypes · {sets} sets',
        basics: 'How Yu-Gi-Oh! works', basicsText: [
            'Each duelist starts with 8000 Life Points, and you win by bringing your opponent to zero. The Main Deck has 40 to 60 cards, and the Extra Deck holds up to 15 Fusion, Synchro, Xyz and Link Monsters, summoned using materials on the field.',
            'There are three kinds of cards: monsters, Spells and Traps. Monsters have an Attribute, Type, Level (or Rank and Link rating), ATK and DEF. Spells are played on your turn (Quick-Play Spells on your opponent\'s too), and Traps must be Set before they can be activated.',
            'Konami publishes the Forbidden & Limited List: Forbidden cards cannot be used, Limited cards are restricted to one copy and Semi-Limited to two. Everything else allows up to three copies per deck.',
        ],
        search: 'Search card', allKinds: 'All categories', monsters: 'Monsters', spells: 'Spells', traps: 'Traps', allAttributes: 'All attributes', allRaces: 'All types',
        allLevels: 'Any level', level: 'Level/Rank/Link {n}', allBans: 'Any restriction', unrestricted: 'Unrestricted', sort: 'Sort', sortPopular: 'Most popular', sortName: 'Name',
        sortAtk: 'Highest ATK', sortNew: 'Newest', results: '{n} cards', more: 'Show more', about: 'About the card', aboutArchetype: 'About the archetype', aboutSet: 'About the set', related: 'More {name} cards', printings: 'Sets it was printed in',
        noText: 'Could not load the card text right now.', archetypeCards: '{n} cards', searchArchetype: 'Search archetype', tcg: 'TCG', ocg: 'OCG (Asia)',
        setCards: '{n} cards · released {date}', boostersOnly: 'Boosters only', allSets: 'All sets', openPack: 'Open pack', open10: 'Open 10', opened: 'Packs opened',
        hits: 'Ultra Rare or better pulls', packNote: 'Odds are approximate: each pack has 9 cards, with a guaranteed rare and a foil in the last slot.',
        main: 'Main Deck', extra: 'Extra Deck', deckEmpty: 'Add cards using the search below or import a .ydk file.', add: 'Add', copyLink: 'Copy link',
        copied: 'Link copied!', valid: 'Valid deck for the TCG Advanced Format!', clear: 'Clear', exportYdk: 'Download .ydk', importYdk: 'Import .ydk',
        loading: 'Loading cards…', error: 'Could not load the cards.', credit: 'Card data and images provided by YGOPRODeck.', english: 'English name',
    },
} satisfies Record<Language, Record<string, string | string[]>>

const panel = 'flex flex-col gap-3 rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-amber-900/10 dark:bg-zinc-900/90 dark:ring-amber-200/10'
const select = 'rounded-xl border border-amber-900/20 bg-white px-3 py-2 text-sm font-bold dark:border-zinc-700 dark:bg-zinc-900'
const button = 'rounded-full bg-violet-700 px-5 py-2 font-black text-white transition hover:bg-violet-600 disabled:opacity-40'
const formatDate = (date: string, language: Language) => new Date(`${date}T12:00:00`).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'medium' })

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return <section className={panel}><h2 className="text-xl font-black text-violet-900 dark:text-amber-300">{title}</h2>{children}</section>
}

function Header({ title, text, crumbs = [], children }: { title: string; text: string; crumbs?: [string, string][]; children?: ReactNode }) {
    return (
        <header className="flex flex-col gap-2">
            <nav aria-label="breadcrumb" className="text-sm text-zinc-500">
                {[['Yu-Gi-Oh!', '/yu-gi-oh'] as [string, string], ...crumbs].map(([label, href], index) => <span key={href}>{index > 0 && ' / '}<Link href={href} className="hover:underline">{label}</Link></span>)}
            </nav>
            <h1 className="text-4xl font-black tracking-tight">{title}</h1>
            {children}
            <p className="max-w-3xl text-zinc-600 dark:text-zinc-300">{text}</p>
        </header>
    )
}

function Basics() {
    const { language } = useLanguage()
    const L = LABELS[language]
    return <Panel title={L.basics}>{L.basicsText.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}</Panel>
}

function Credit() {
    const { language } = useLanguage()
    return <p className="text-center text-xs text-zinc-500">{LABELS[language].credit}</p>
}

function Loading({ children }: { children: (data: YgoData) => ReactNode }) {
    const state = useYgoData()
    const { language } = useLanguage()
    if (!state) return <p className="text-center text-zinc-500">{LABELS[language].loading}</p>
    if (state.status === 'error') return <p role="alert" className="text-center font-bold text-red-600">{LABELS[language].error}</p>
    return <>{children(state.data)}</>
}

export function CardGrid({ cards, onSelect, badges }: { cards: YgoCard[]; onSelect?: (card: YgoCard) => void; badges?: (card: YgoCard) => ReactNode }) {
    const { language } = useLanguage()
    return (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {cards.map((card) => (
                <li key={card.id} className="flex flex-col gap-1 text-xs font-bold">
                    {onSelect ? (
                        <button type="button" onClick={() => onSelect(card)} className="block w-full text-left transition hover:-translate-y-1"><YgoCardImage card={card} /></button>
                    ) : (
                        <Link href={ygoCardPath(card)} prefetch={false} className="block transition hover:-translate-y-1"><YgoCardImage card={card} /></Link>
                    )}
                    <span className="truncate" title={ygoName(card, language)}>{ygoName(card, language)}</span>
                    {badges?.(card)}
                </li>
            ))}
        </ul>
    )
}

export interface YgoHomeProps {
    stats: { cards: number; archetypes: number; sets: number }
    popular: YgoCard[]
    archetypes: { name: string; slug: string; count: number }[]
    latest: Pick<YgoSet, 's' | 'n' | 'd' | 't'>[]
}

export function YgoHome({ stats, popular, archetypes, latest }: YgoHomeProps) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const number = (value: number) => value.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')
    const sections = [
        ['/yu-gi-oh/cartas', L.library, L.libraryDesc], ['/yu-gi-oh/arquetipos', L.archetypes, L.archetypesDesc], ['/yu-gi-oh/banlist', L.banlist, L.banlistDesc],
        ['/yu-gi-oh/colecoes', L.sets, L.setsDesc], ['/yu-gi-oh/pacotes', L.packs, L.packsDesc], ['/yu-gi-oh/decks', L.decks, L.decksDesc],
        ['/desafios/ygo-atributos', L.challenges, L.challengesDesc],
    ] as const
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-col gap-2 text-center">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{L.home}</h1>
                <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-300">{L.homeIntro}</p>
                <p className="text-sm font-bold text-violet-800 dark:text-amber-300">{L.stats.replace('{cards}', number(stats.cards)).replace('{archetypes}', number(stats.archetypes)).replace('{sets}', number(stats.sets))}</p>
            </header>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sections.map(([href, title, text]) => (
                    <li key={href}>
                        <Link href={href} className="flex h-full flex-col gap-2 rounded-3xl bg-linear-to-br from-violet-800 via-purple-900 to-amber-700 p-5 text-white shadow-lg transition hover:-translate-y-1">
                            <span className="text-lg font-black">{title}</span>
                            <span className="text-sm text-white/85">{text}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Panel title={L.popular}><CardGrid cards={popular} /></Panel>
            <div className="grid gap-6 lg:grid-cols-2">
                <Panel title={L.topArchetypes}>
                    <ul className="flex flex-wrap gap-2">
                        {archetypes.map((entry) => (
                            <li key={entry.slug}><Link href={`/yu-gi-oh/arquetipos/${entry.slug}`} className="block rounded-full bg-violet-100 px-3 py-1 text-sm font-bold hover:bg-violet-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">{entry.name} <span className="text-xs text-zinc-500">{entry.count}</span></Link></li>
                        ))}
                    </ul>
                </Panel>
                <Panel title={L.latestSets}>
                    <ul className="flex flex-col gap-2">
                        {latest.map((set) => (
                            <li key={set.s}>
                                <Link href={ygoSetPath(set)} className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 px-4 py-2 font-bold hover:bg-amber-100 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                                    <span>{set.n}</span>
                                    <span className="shrink-0 text-xs text-zinc-500">{formatDate(set.d, language)}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>
            <Basics />
            <Credit />
        </div>
    )
}

const PAGE = 60
type Sort = 'popular' | 'name' | 'atk' | 'new'

function categoryMatches(card: YgoCard, category: string) {
    if (!category) return true
    const [kind, value] = category.split(':')
    if (kind === 'k') return card.k === value
    if (kind === 'f') return card.k === 'm' && card.f === value
    if (kind === 'p') return Boolean(card.p)
    return card.k === kind && card.r === value
}

export function YgoLibrary() {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('')
    const [attribute, setAttribute] = useState('')
    const [race, setRace] = useState('')
    const [level, setLevel] = useState('')
    const [ban, setBan] = useState('')
    const [sort, setSort] = useState<Sort>('popular')
    const [limit, setLimit] = useState(PAGE)
    const [selected, setSelected] = useState<YgoCard | null>(null)
    const reset = <T,>(setter: (value: T) => void) => (value: T) => { setter(value); setLimit(PAGE) }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Header title={L.library} text={L.libraryDesc} />
            <Loading>
                {(data) => {
                    const normalized = normalizeYgo(query)
                    const filtered = data.cards.filter((card) =>
                        categoryMatches(card, category) && (!attribute || card.a === attribute) && (!race || card.r === race) && (!level || card.l === Number(level))
                        && (!ban || (ban === 'none' ? card.b === undefined : card.b === Number(ban))) && matchesYgo(card, normalized))
                    const cards = sort === 'popular' ? filtered : [...filtered].sort((a, b) =>
                        sort === 'name' ? ygoName(a, language).localeCompare(ygoName(b, language)) : sort === 'atk' ? (b.atk ?? -2) - (a.atk ?? -2) : (b.y ?? 0) - (a.y ?? 0))
                    return (
                        <>
                            <section className={`${panel} sm:flex-row sm:flex-wrap`}>
                                <input type="search" value={query} onChange={(event) => reset(setQuery)(event.target.value)} placeholder={L.search} className={`${select} min-w-48 flex-1`} />
                                <select value={category} onChange={(event) => reset(setCategory)(event.target.value)} className={select} aria-label={L.allKinds}>
                                    <option value="">{L.allKinds}</option>
                                    <optgroup label={L.monsters}>
                                        <option value="k:m">{L.monsters}</option>
                                        {YGO_FRAMES.filter((frame) => frame !== 'spell' && frame !== 'trap').map((frame) => <option key={frame} value={`f:${frame}`}>{ygoFrameLabel(frame, language)}</option>)}
                                        <option value="p:1">{language === 'pt' ? 'Pêndulo' : 'Pendulum'}</option>
                                    </optgroup>
                                    <optgroup label={L.spells}>
                                        <option value="k:s">{L.spells}</option>
                                        {YGO_SPELL_TYPES.map((type) => <option key={type} value={`s:${type}`}>{ygoKindLabel({ k: 's', f: 'spell', r: type }, language)}</option>)}
                                    </optgroup>
                                    <optgroup label={L.traps}>
                                        <option value="k:t">{L.traps}</option>
                                        {YGO_TRAP_TYPES.map((type) => <option key={type} value={`t:${type}`}>{ygoKindLabel({ k: 't', f: 'trap', r: type }, language)}</option>)}
                                    </optgroup>
                                </select>
                                <select value={attribute} onChange={(event) => reset(setAttribute)(event.target.value)} className={select} aria-label={L.allAttributes}>
                                    <option value="">{L.allAttributes}</option>
                                    {YGO_ATTRIBUTES.map((entry) => <option key={entry} value={entry}>{ygoAttributeLabel(entry, language)}</option>)}
                                </select>
                                <select value={race} onChange={(event) => reset(setRace)(event.target.value)} className={select} aria-label={L.allRaces}>
                                    <option value="">{L.allRaces}</option>
                                    {[...YGO_RACES].sort((a, b) => ygoRaceLabel(a, language).localeCompare(ygoRaceLabel(b, language))).map((entry) => <option key={entry} value={entry}>{ygoRaceLabel(entry, language)}</option>)}
                                </select>
                                <select value={level} onChange={(event) => reset(setLevel)(event.target.value)} className={select} aria-label={L.allLevels}>
                                    <option value="">{L.allLevels}</option>
                                    {Array.from({ length: 13 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{L.level.replace('{n}', String(value))}</option>)}
                                </select>
                                <select value={ban} onChange={(event) => reset(setBan)(event.target.value)} className={select} aria-label={L.allBans}>
                                    <option value="">{L.allBans}</option>
                                    {[0, 1, 2].map((value) => <option key={value} value={value}>{ygoBanLabel(value, language)}</option>)}
                                    <option value="none">{L.unrestricted}</option>
                                </select>
                                <select value={sort} onChange={(event) => reset(setSort)(event.target.value as Sort)} className={select} aria-label={L.sort}>
                                    <option value="popular">{L.sortPopular}</option>
                                    <option value="name">{L.sortName}</option>
                                    <option value="atk">{L.sortAtk}</option>
                                    <option value="new">{L.sortNew}</option>
                                </select>
                            </section>
                            <section className={panel}>
                                <p className="text-sm font-bold text-zinc-500">{L.results.replace('{n}', cards.length.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US'))}</p>
                                <CardGrid cards={cards.slice(0, limit)} onSelect={setSelected} badges={(card) => <BanBadge ban={card.b} />} />
                                {cards.length > limit && <button type="button" onClick={() => setLimit(limit + PAGE)} className={`${button} self-center`}>{L.more}</button>}
                            </section>
                            <YgoCardModal card={selected} onClose={() => setSelected(null)} />
                        </>
                    )
                }}
            </Loading>
            <Basics />
            <Credit />
        </div>
    )
}

export interface YgoCardViewProps {
    card: YgoCard
    text: YgoText | null
    printings: YgoPrinting[]
    related: YgoCard[]
    about: [string[], string[]]
    rarities: Record<string, string>
}

export function YgoCardView({ card, text, printings, related, about, rarities }: YgoCardViewProps) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const name = ygoName(card, language)
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <Header title={name} text={ygoKindLabel(card, language)} crumbs={[[L.library, '/yu-gi-oh/cartas'], ...(card.ar ? [[card.ar, ygoArchetypePath(card.ar)] as [string, string]] : [])]}>
                {language === 'pt' && card.n[0] !== card.n[1] && <p className="text-sm text-zinc-500">{L.english}: {card.n[1]}</p>}
            </Header>
            <section className={`${panel} grid gap-6 sm:grid-cols-[18rem_1fr]`}>
                <YgoCardImage card={card} size="full" eager />
                <div className="flex flex-col gap-4">
                    <CardFacts card={card} />
                    {text ? <CardText text={text} /> : <p className="text-sm text-zinc-500">{L.noText}</p>}
                </div>
            </section>
            <Panel title={L.about}>{about[language === 'en' ? 1 : 0].map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}</Panel>
            {printings.length > 0 && (
                <Panel title={L.printings}>
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {[...printings].sort((a, b) => b.set.d.localeCompare(a.set.d)).map(({ set, rarities: list }) => (
                            <li key={set.s} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm dark:bg-zinc-800">
                                <Link href={ygoSetPath(set)} prefetch={false} className="font-bold hover:underline">{set.n} <span className="text-xs text-zinc-500">{set.d.slice(0, 4)}</span></Link>
                                <span className="flex flex-wrap gap-1">{list.map((rarity) => <RarityBadge key={rarity} rarity={rarity} names={rarities} />)}</span>
                            </li>
                        ))}
                    </ul>
                </Panel>
            )}
            {related.length > 0 && card.ar && <Panel title={L.related.replace('{name}', card.ar)}><CardGrid cards={related} /></Panel>}
            <Credit />
        </div>
    )
}

export function YgoArchetypeIndex({ archetypes }: { archetypes: { name: string; slug: string; count: number; cover: YgoCard }[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [query, setQuery] = useState('')
    const normalized = normalizeYgo(query)
    const list = archetypes.filter((entry) => !normalized || normalizeYgo(entry.name).includes(normalized))
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Header title={L.archetypes} text={L.archetypesDesc} />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={L.searchArchetype} className={select} />
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {list.map((entry) => (
                    <li key={entry.slug}>
                        <Link href={`/yu-gi-oh/arquetipos/${entry.slug}`} prefetch={false} className="flex h-full flex-col gap-2 rounded-2xl bg-white/90 p-2 shadow transition hover:-translate-y-1 dark:bg-zinc-900/90">
                            <YgoCardImage card={entry.cover} size="art" />
                            <span className="text-sm font-black leading-tight">{entry.name}</span>
                            <span className="text-xs text-zinc-500">{L.archetypeCards.replace('{n}', String(entry.count))}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Credit />
        </div>
    )
}

export function YgoArchetypeView({ name, cards, about }: { name: string; cards: YgoCard[]; about: [string[], string[]] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const groups = [[L.monsters, cards.filter((card) => card.k === 'm' && !isExtraDeck(card))], [L.extra, cards.filter(isExtraDeck)], [L.spells, cards.filter((card) => card.k === 's')], [L.traps, cards.filter((card) => card.k === 't')]] as const
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Header title={name} text={L.archetypeCards.replace('{n}', String(cards.length))} crumbs={[[L.archetypes, '/yu-gi-oh/arquetipos']]} />
            <Panel title={L.aboutArchetype}>{about[language === 'en' ? 1 : 0].map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}</Panel>
            {groups.filter(([, list]) => list.length > 0).map(([title, list]) => (
                <Panel key={title} title={`${title} (${list.length})`}><CardGrid cards={list} badges={(card) => <BanBadge ban={card.b} />} /></Panel>
            ))}
            <Credit />
        </div>
    )
}

export function YgoBanlist({ cards }: { cards: YgoCard[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [format, setFormat] = useState<'tcg' | 'ocg'>('tcg')
    const status = (card: YgoCard) => (format === 'tcg' ? card.b : card.bo)
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Header title={L.banlist} text={L.banlistDesc} />
            <div role="tablist" className="flex gap-2">
                {(['tcg', 'ocg'] as const).map((value) => (
                    <button key={value} type="button" role="tab" aria-selected={format === value} onClick={() => setFormat(value)} className={`rounded-full px-5 py-2 font-black ${format === value ? 'bg-violet-700 text-white' : 'bg-white/80 dark:bg-zinc-800'}`}>{L[value]}</button>
                ))}
            </div>
            {[0, 1, 2].map((ban) => {
                const list = cards.filter((card) => status(card) === ban)
                return list.length > 0 && <Panel key={ban} title={`${ygoBanLabel(ban, language)} (${list.length})`}><CardGrid cards={list} /></Panel>
            })}
            <Basics />
            <Credit />
        </div>
    )
}

export function YgoSetIndex({ sets }: { sets: (Pick<YgoSet, 's' | 'n' | 'd' | 't' | 'c'> & { booster: boolean })[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [query, setQuery] = useState('')
    const [boosters, setBoosters] = useState(true)
    const normalized = normalizeYgo(query)
    const list = sets.filter((set) => (!boosters || set.booster) && (!normalized || normalizeYgo(`${set.n} ${set.c}`).includes(normalized)))
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <Header title={L.sets} text={L.setsDesc} />
            <section className={`${panel} sm:flex-row sm:items-center`}>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={L.search} className={`${select} flex-1`} />
                <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={boosters} onChange={(event) => setBoosters(event.target.checked)} className="size-4 accent-violet-700" />{L.boostersOnly}</label>
            </section>
            <ul className="grid gap-2 sm:grid-cols-2">
                {list.map((set) => (
                    <li key={set.s}>
                        <Link href={ygoSetPath(set)} prefetch={false} className="flex h-full flex-col rounded-2xl bg-white/90 px-4 py-3 shadow transition hover:-translate-y-0.5 dark:bg-zinc-900/90">
                            <span className="font-black">{set.n}</span>
                            <span className="text-xs text-zinc-500">{set.c} · {L.setCards.replace('{n}', String(set.t)).replace('{date}', formatDate(set.d, language))}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Credit />
        </div>
    )
}

export function YgoSetView({ set, cards, about, booster, rarities }: { set: Pick<YgoSet, 's' | 'n' | 'd' | 't' | 'c'>; cards: { card: YgoCard; rarities: string[] }[]; about: [string[], string[]]; booster: boolean; rarities: Record<string, string> }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const byId = new Map(cards.map((entry) => [entry.card.id, entry.rarities]))
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Header title={set.n} text={`${set.c} · ${L.setCards.replace('{n}', String(set.t)).replace('{date}', formatDate(set.d, language))}`} crumbs={[[L.sets, '/yu-gi-oh/colecoes']]} />
            <Panel title={L.aboutSet}>{about[language === 'en' ? 1 : 0].map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}</Panel>
            {booster && <Link href={`/yu-gi-oh/pacotes?colecao=${set.s}`} className={`${button} self-start`}>{L.openPack} →</Link>}
            <section className={panel}>
                <CardGrid cards={cards.map(({ card }) => card)} badges={(card) => <span className="flex flex-wrap gap-0.5">{(byId.get(card.id) ?? []).map((rarity) => <RarityBadge key={rarity} rarity={rarity} names={rarities} />)}</span>} />
            </section>
            <Credit />
        </div>
    )
}

export function YgoPackSimulator({ initial }: { initial: string | null }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const sets = useYgoSets()
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <Header title={L.packs} text={L.packsDesc} />
            {!sets ? <p className="text-center text-zinc-500">{L.loading}</p> : sets.status === 'error' ? <p role="alert" className="text-center font-bold text-red-600">{L.error}</p> : (
                <Loading>{(data) => <PackSimulator data={data} sets={sets.data} initial={initial} />}</Loading>
            )}
            <p className="text-center text-xs text-zinc-500">{L.packNote}</p>
            <Basics />
            <Credit />
        </div>
    )
}

function PackSimulator({ data, sets, initial }: { data: YgoData; sets: YgoSetsData; initial: string | null }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const boosters = sets.sets.filter(isBoosterSet).reverse()
    const [choice, setChoice] = useState(() => boosters.find((set) => set.s === initial)?.s ?? boosters[0]?.s ?? '')
    const [pack, setPack] = useState<{ card: YgoCard; rarity: string }[]>([])
    const [opened, setOpened] = useState(0)
    const [hits, setHits] = useState<{ card: YgoCard; rarity: string }[]>([])
    const current = sets.bySlug.get(choice)

    const open = (count: number) => {
        if (!current) return
        let last: { card: YgoCard; rarity: string }[] = []
        const found: { card: YgoCard; rarity: string }[] = []
        for (let index = 0; index < count; index++) {
            last = openYgoPack(current).flatMap(({ id, rarity }) => {
                const card = data.byId.get(id)
                return card ? [{ card, rarity }] : []
            })
            found.push(...last.filter(({ rarity }) => ygoRarityRank(rarity) >= ygoRarityRank('UR')))
        }
        setPack(last)
        setOpened((value) => value + count)
        setHits((list) => [...found, ...list].slice(0, 36))
    }

    return (
        <>
            <section className={`${panel} sm:flex-row sm:flex-wrap sm:items-center`}>
                <select value={choice} onChange={(event) => { setChoice(event.target.value); setPack([]); setOpened(0); setHits([]) }} className={`${select} max-w-full`}>
                    {boosters.map((set) => <option key={set.s} value={set.s}>{set.n} ({set.d.slice(0, 4)})</option>)}
                </select>
                <button type="button" disabled={!current} onClick={() => open(1)} className={button}>{L.openPack}</button>
                <button type="button" disabled={!current} onClick={() => open(10)} className="rounded-full bg-amber-600 px-5 py-2 font-black text-white transition hover:bg-amber-500 disabled:opacity-40">{L.open10}</button>
                {opened > 0 && <span className="text-sm font-bold">{L.opened}: {opened}</span>}
            </section>
            {pack.length > 0 && (
                <section className={panel}>
                    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
                        <AnimatePresence mode="popLayout">
                            {pack.map(({ card, rarity }, index) => (
                                <motion.li key={`${opened}-${index}`} initial={{ opacity: 0, y: 30, rotateY: 90 }} animate={{ opacity: 1, y: 0, rotateY: 0, transition: { delay: index * 0.08 } }} className="flex flex-col items-center gap-1">
                                    <Link href={ygoCardPath(card)} prefetch={false} className="block w-full"><YgoCardImage card={card} eager /></Link>
                                    <RarityBadge rarity={rarity} names={sets.rarities} />
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                </section>
            )}
            {hits.length > 0 && (
                <Panel title={L.hits}>
                    <CardGrid cards={hits.map(({ card }) => card).filter((card, index, list) => list.findIndex((other) => other.id === card.id) === index)} />
                </Panel>
            )}
        </>
    )
}

const parseDeck = (value: string | null) =>
    Object.fromEntries((value ?? '').split(',').map((entry) => entry.split(':').map(Number)).filter(([id, count]) => id > 0 && count > 0).map(([id, count]) => [id, Math.min(3, count)]))

export function YgoDeckBuilder({ initial }: { initial: string | null }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Header title={L.decks} text={L.decksDesc} />
            <Loading>{(data) => <DeckBuilder data={data} initial={parseDeck(initial)} />}</Loading>
            <Basics />
            <Credit />
        </div>
    )
}

function DeckBuilder({ data, initial }: { data: YgoData; initial: Record<number, number> }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [counts, setCounts] = useState<Record<number, number>>(() => Object.fromEntries(Object.entries(initial).filter(([id]) => data.byId.has(Number(id)))))
    const [query, setQuery] = useState('')
    const [kind, setKind] = useState('')
    const [message, setMessage] = useState('')
    const deckCards = Object.keys(counts).flatMap((id) => data.byId.get(Number(id)) ?? [])
    const { main, extra, problems } = ygoDeckProblems(deckCards, counts, language)
    const total = main + extra
    const normalized = normalizeYgo(query)
    const results = normalized || kind ? data.cards.filter((card) => (!kind || (kind === 'x' ? isExtraDeck(card) : card.k === kind && !isExtraDeck(card))) && matchesYgo(card, normalized)).slice(0, 30) : []

    const update = (next: Record<number, number>) => {
        setCounts(next)
        setMessage('')
        const value = Object.entries(next).filter(([, count]) => count > 0).map(([id, count]) => `${id}:${count}`).join(',')
        window.history.replaceState(null, '', value ? `${window.location.pathname}?deck=${value}` : window.location.pathname)
    }
    const canAdd = (card: YgoCard) => (counts[card.id] ?? 0) < copyLimit(card) && (isExtraDeck(card) ? extra < EXTRA_MAX : main < MAIN_MAX)
    const add = (card: YgoCard) => { if (canAdd(card)) update({ ...counts, [card.id]: (counts[card.id] ?? 0) + 1 }) }
    const remove = (card: YgoCard) => {
        const next = { ...counts, [card.id]: (counts[card.id] ?? 0) - 1 }
        if (next[card.id] <= 0) delete next[card.id]
        update(next)
    }
    const download = () => {
        const url = URL.createObjectURL(new Blob([toYdk(deckCards, counts)], { type: 'text/plain' }))
        const link = document.createElement('a')
        link.href = url
        link.download = 'deck.ydk'
        link.click()
        URL.revokeObjectURL(url)
    }
    const importFile = async (file: File | undefined) => {
        if (!file) return
        const parsed = parseYdk(await file.text())
        update(Object.fromEntries(Object.entries(parsed).filter(([id]) => data.byId.has(Number(id)))))
    }
    const order = (list: YgoCard[]) => [...list].sort((a, b) => 'mst'.indexOf(a.k) - 'mst'.indexOf(b.k) || ygoName(a, language).localeCompare(ygoName(b, language)))
    const sections = [[L.main, order(deckCards.filter((card) => !isExtraDeck(card))), `${main}/${MAIN_MIN}–${MAIN_MAX}`], [L.extra, order(deckCards.filter(isExtraDeck)), `${extra}/${EXTRA_MAX}`]] as const

    return (
        <>
            <section className={panel}>
                <div className="flex flex-wrap items-center gap-2">
                    {total > 0 && <button type="button" onClick={async () => { await navigator.clipboard.writeText(window.location.href); setMessage(L.copied) }} className="rounded-full bg-violet-700 px-4 py-1.5 text-sm font-black text-white">{L.copyLink}</button>}
                    {total > 0 && <button type="button" onClick={download} className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-black text-white">{L.exportYdk}</button>}
                    <label className="cursor-pointer rounded-full border border-zinc-400 px-4 py-1.5 text-sm font-bold">
                        {L.importYdk}
                        <input type="file" accept=".ydk,text/plain" className="sr-only" onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = '' }} />
                    </label>
                    {total > 0 && <button type="button" onClick={() => update({})} className="rounded-full border border-zinc-400 px-4 py-1.5 text-sm font-bold">{L.clear}</button>}
                    {message && <span role="status" className="text-sm font-bold">{message}</span>}
                </div>
                {total === 0 ? <p className="text-zinc-500">{L.deckEmpty}</p> : sections.map(([title, list, count]) => (
                    <div key={title} className="flex flex-col gap-2">
                        <h2 className="text-lg font-black text-violet-900 dark:text-amber-300">{title} <span className="text-sm text-zinc-500">{count}</span></h2>
                        {list.length > 0 && (
                            <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-12">
                                {list.map((card) => (
                                    <li key={card.id} className="relative">
                                        <button type="button" onClick={() => remove(card)} title={ygoName(card, language)} className="block w-full"><YgoCardImage card={card} /></button>
                                        <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-violet-800 text-xs font-black text-white">{counts[card.id]}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
                {total > 0 && (problems.length ? (
                    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-red-600">{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>
                ) : <p className="font-bold text-green-600">✓ {L.valid}</p>)}
            </section>
            <section className={panel}>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={L.search} className={`${select} flex-1`} />
                    <select value={kind} onChange={(event) => setKind(event.target.value)} className={select} aria-label={L.allKinds}>
                        <option value="">{L.allKinds}</option>
                        <option value="m">{L.monsters}</option>
                        <option value="s">{L.spells}</option>
                        <option value="t">{L.traps}</option>
                        <option value="x">{L.extra}</option>
                    </select>
                </div>
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {results.map((card) => (
                        <li key={card.id} className="flex flex-col gap-1">
                            <YgoCardImage card={card} />
                            <span className="truncate text-xs font-bold" title={ygoName(card, language)}>{ygoName(card, language)}</span>
                            <button type="button" disabled={!canAdd(card)} onClick={() => add(card)} className="rounded-full bg-violet-700 px-2 py-1 text-xs font-black text-white disabled:opacity-40">+ {L.add}</button>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    )
}
