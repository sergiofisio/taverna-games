'use client'

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import type { Language } from "../../i18n/translations";
import {
    DECK_SIZE, MAX_COPIES, TCGP_RARITIES, TCGP_TYPES, deckProblems, normalizeTcgp, openTcgpPack, pickPair, rarityInfo, rarityLabel,
    tcgpCardPath, tcgpName, tcgpSetPath, tcgpTypeLabel, type TcgpCard, type TcgpData, type TcgpSet,
} from "../../lib/tcgp";
import type { CardSummary } from "../../lib/tcgpServer";
import { CardFacts, RarityBadge, TcgpCardImage, TcgpCardModal, TypeIcon, useTcgpData } from "./shared";

const LABELS = {
    pt: {
        home: 'Pokémon TCG Pocket', homeIntro: 'Todas as cartas do Pokémon Estampas Ilustradas Pocket em português, com coleções, raridades, simulador de pacotes, montador de decks e o desafio diário Pocketdle.',
        library: 'Cartas', libraryDesc: 'Busque e filtre todas as cartas por coleção, tipo e raridade.', sets: 'Coleções', setsDesc: 'Todas as expansões e pacotes, com as cartas de cada uma.',
        packs: 'Simulador de pacotes', packsDesc: 'Abra pacotes de graça e veja as chances de cada raridade.', decks: 'Montador de decks', decksDesc: 'Monte um deck de 20 cartas e compartilhe pelo link.',
        challenges: 'Pocketdle', challengesDesc: 'Adivinhe a carta do dia por atributos ou pela ilustração.',
        basics: 'Como funciona o TCG Pocket', basicsText: [
            'No Pokémon TCG Pocket os decks têm só 20 cartas, com no máximo duas cópias de cada uma. Em vez de cartas de energia, cada jogador escolhe até três tipos de energia, e a Zona de Energia gera uma energia por turno.',
            'Vence quem fizer 3 pontos primeiro: nocautear um Pokémon comum vale 1 ponto, e um Pokémon ex vale 2. Por isso os ex são fortes, mas arriscados.',
            'Os pacotes têm 5 cartas. As três primeiras são sempre comuns, e a quarta e a quinta têm chance de raridades maiores, como as cartas de arte (estrela) e a rara coroa.',
        ],
        search: 'Buscar carta', allSets: 'Todas as coleções', allTypes: 'Todos os tipos', allRarities: 'Todas as raridades', allKinds: 'Pokémon e treinadores',
        pokemon: 'Pokémon', trainer: 'Treinadores', results: '{n} cartas', more: 'Mostrar mais', about: 'Sobre a carta', otherVersions: 'Outras versões de {name}',
        pokedex: 'Ver {name} na Pokédex', boosters: 'Pacotes', setCards: '{n} cartas · lançada em {date}', openPack: 'Abrir pacote', open10: 'Abrir 10',
        pack: 'Pacote', opened: 'Pacotes abertos', rare: 'Cartas raras (★ ou mais)', reset: 'Recomeçar', packNote: 'As chances são aproximadas, com base nas taxas divulgadas no jogo. Nada aqui afeta a sua conta.',
        deckEmpty: 'Adicione cartas pela busca abaixo.', add: 'Adicionar', copyLink: 'Copiar link do deck', copied: 'Link copiado!', valid: 'Deck válido!',
        energies: 'Energias sugeridas', clear: 'Limpar deck', count: '{n}/{max} cartas', loading: 'Carregando cartas…', error: 'Não foi possível carregar as cartas.',
        credit: 'Dados das cartas fornecidos pela TCGdex.',
    },
    en: {
        home: 'Pokémon TCG Pocket', homeIntro: 'Every Pokémon Trading Card Game Pocket card, with sets, rarities, a pack simulator, deck builder and the daily Pocketdle challenge.',
        library: 'Cards', libraryDesc: 'Search and filter every card by set, type and rarity.', sets: 'Sets', setsDesc: 'Every expansion and booster, with each one\'s cards.',
        packs: 'Pack simulator', packsDesc: 'Open packs for free and see the odds of each rarity.', decks: 'Deck builder', decksDesc: 'Build a 20-card deck and share it by link.',
        challenges: 'Pocketdle', challengesDesc: 'Guess the card of the day by attributes or illustration.',
        basics: 'How TCG Pocket works', basicsText: [
            'In Pokémon TCG Pocket, decks have only 20 cards, with at most two copies of each. Instead of energy cards, each player picks up to three energy types, and the Energy Zone generates one energy per turn.',
            'The first to score 3 points wins: knocking out a regular Pokémon is worth 1 point, and a Pokémon ex is worth 2. That makes ex cards strong but risky.',
            'Packs have 5 cards. The first three are always common, while the fourth and fifth can roll higher rarities such as art cards (stars) and the rare crown.',
        ],
        search: 'Search card', allSets: 'All sets', allTypes: 'All types', allRarities: 'All rarities', allKinds: 'Pokémon and trainers',
        pokemon: 'Pokémon', trainer: 'Trainers', results: '{n} cards', more: 'Show more', about: 'About the card', otherVersions: 'Other versions of {name}',
        pokedex: 'See {name} in the Pokédex', boosters: 'Packs', setCards: '{n} cards · released {date}', openPack: 'Open pack', open10: 'Open 10',
        pack: 'Pack', opened: 'Packs opened', rare: 'Rare cards (★ or higher)', reset: 'Start over', packNote: 'Odds are approximate, based on the rates disclosed in the game. Nothing here affects your account.',
        deckEmpty: 'Add cards using the search below.', add: 'Add', copyLink: 'Copy deck link', copied: 'Link copied!', valid: 'Valid deck!',
        energies: 'Suggested energies', clear: 'Clear deck', count: '{n}/{max} cards', loading: 'Loading cards…', error: 'Could not load the cards.',
        credit: 'Card data provided by TCGdex.',
    },
} satisfies Record<Language, Record<string, string | string[]>>

const panel = 'flex flex-col gap-3 rounded-3xl bg-white/90 p-6 shadow-lg dark:bg-slate-900/90'
const select = 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900'

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return <section className={panel}><h2 className="text-xl font-black text-sky-800 dark:text-sky-300">{title}</h2>{children}</section>
}

function Header({ title, text, crumbs = [] }: { title: string; text: string; crumbs?: [string, string][] }) {
    return (
        <header className="flex flex-col gap-2">
            <nav aria-label="breadcrumb" className="text-sm text-slate-500">
                {[['Pokémon TCG Pocket', '/tcg-pocket'] as [string, string], ...crumbs].map(([label, href], index) => <span key={href}>{index > 0 && ' / '}<Link href={href} className="hover:underline">{label}</Link></span>)}
            </nav>
            <h1 className="text-4xl font-black tracking-tight">{title}</h1>
            <p className="max-w-3xl text-slate-600 dark:text-slate-300">{text}</p>
        </header>
    )
}

function Loading({ children }: { children: (data: TcgpData) => ReactNode }) {
    const state = useTcgpData()
    const { language } = useLanguage()
    if (!state) return <p className="text-center text-slate-500">{LABELS[language].loading}</p>
    if (state.status === 'error') return <p role="alert" className="text-center font-bold text-red-600">{LABELS[language].error}</p>
    return <>{children(state.data)}</>
}

export function CardGrid({ cards, onSelect }: { cards: (CardSummary | TcgpCard)[]; onSelect?: (id: string) => void }) {
    const { language } = useLanguage()
    return (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {cards.map((card) => (
                <li key={card.id}>
                    {onSelect ? (
                        <button type="button" onClick={() => onSelect(card.id)} className="block w-full transition hover:-translate-y-1"><TcgpCardImage card={card as TcgpCard} /></button>
                    ) : (
                        <Link href={tcgpCardPath(card)} prefetch={false} className="flex flex-col gap-1 text-xs font-bold transition hover:-translate-y-1">
                            <TcgpCardImage card={card as TcgpCard} />
                            <span className="truncate">{tcgpName(card, language)} <span className="text-slate-400">{rarityInfo(card.r).symbol}</span></span>
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    )
}

export function TcgpHome({ sets }: { sets: TcgpSet[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const sections = [
        ['/tcg-pocket/cartas', L.library, L.libraryDesc], ['/tcg-pocket/colecoes', L.sets, L.setsDesc], ['/tcg-pocket/pacotes', L.packs, L.packsDesc],
        ['/tcg-pocket/decks', L.decks, L.decksDesc], ['/desafios/tcg-atributos', L.challenges, L.challengesDesc],
    ] as const
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-col gap-2 text-center">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{L.home}</h1>
                <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">{L.homeIntro}</p>
            </header>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {sections.map(([href, title, text]) => (
                    <li key={href}>
                        <Link href={href} className="flex h-full flex-col gap-2 rounded-3xl bg-linear-to-br from-sky-500 to-indigo-700 p-5 text-white shadow-lg transition hover:-translate-y-1">
                            <span className="text-lg font-black">{title}</span>
                            <span className="text-sm text-white/85">{text}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Panel title={L.sets}>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {[...sets].reverse().map((set) => (
                        <li key={set.id}>
                            <Link href={tcgpSetPath(set)} className="flex items-center justify-between gap-2 rounded-xl bg-sky-50 px-4 py-2 font-bold hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                                <span>{pickPair(set.n, language)}</span>
                                <span className="text-xs text-slate-500">{set.id} · {set.total}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </Panel>
            <Panel title={L.basics}>{L.basicsText.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}</Panel>
            <p className="text-center text-xs text-slate-500">{L.credit}</p>
        </div>
    )
}

function Basics() {
    const { language } = useLanguage()
    const L = LABELS[language]
    return <Panel title={L.basics}>{L.basicsText.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}</Panel>
}

const PAGE = 60

export function TcgpLibrary() {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [query, setQuery] = useState('')
    const [set, setSet] = useState('')
    const [type, setType] = useState('')
    const [rarity, setRarity] = useState('')
    const [kind, setKind] = useState('')
    const [limit, setLimit] = useState(PAGE)
    const [selected, setSelected] = useState<string | null>(null)
    const reset = <T,>(setter: (value: T) => void) => (value: T) => { setter(value); setLimit(PAGE) }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Header title={L.library} text={L.libraryDesc} />
            <Loading>
                {(data) => {
                    const normalized = normalizeTcgp(query)
                    const cards = data.cards.filter((card) =>
                        (!set || card.s === set) && (!type || card.ty.includes(type)) && (!rarity || card.r === rarity) && (!kind || card.c === kind)
                        && (!normalized || card.n.some((name) => normalizeTcgp(name).includes(normalized))))
                    return (
                        <>
                            <section className={`${panel} sm:flex-row sm:flex-wrap`}>
                                <input type="search" value={query} onChange={(event) => reset(setQuery)(event.target.value)} placeholder={L.search} className={`${select} min-w-48 flex-1`} />
                                <select value={set} onChange={(event) => reset(setSet)(event.target.value)} className={select}>
                                    <option value="">{L.allSets}</option>
                                    {[...data.sets].reverse().map((entry) => <option key={entry.id} value={entry.id}>{pickPair(entry.n, language)}</option>)}
                                </select>
                                <select value={type} onChange={(event) => reset(setType)(event.target.value)} className={select}>
                                    <option value="">{L.allTypes}</option>
                                    {TCGP_TYPES.map((entry) => <option key={entry} value={entry}>{tcgpTypeLabel(entry, language)}</option>)}
                                </select>
                                <select value={rarity} onChange={(event) => reset(setRarity)(event.target.value)} className={select}>
                                    <option value="">{L.allRarities}</option>
                                    {TCGP_RARITIES.map((entry) => <option key={entry} value={entry}>{rarityInfo(entry).symbol} {rarityLabel(entry, language)}</option>)}
                                </select>
                                <select value={kind} onChange={(event) => reset(setKind)(event.target.value)} className={select}>
                                    <option value="">{L.allKinds}</option>
                                    <option value="Pokemon">{L.pokemon}</option>
                                    <option value="Trainer">{L.trainer}</option>
                                </select>
                            </section>
                            <section className={panel}>
                                <p className="text-sm font-bold text-slate-500">{L.results.replace('{n}', String(cards.length))}</p>
                                <CardGrid cards={cards.slice(0, limit)} onSelect={setSelected} />
                                {cards.length > limit && <button type="button" onClick={() => setLimit(limit + PAGE)} className="self-center rounded-full bg-sky-600 px-5 py-2 font-black text-white">{L.more}</button>}
                            </section>
                            <TcgpCardModal data={data} cardId={selected} onClose={() => setSelected(null)} />
                        </>
                    )
                }}
            </Loading>
            <Basics />
        </div>
    )
}

export function TcgpCardView({ cardId, about, sameName, pokedexSlug }: { cardId: string; about: [string[], string[]]; sameName: CardSummary[]; pokedexSlug: string | null }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <Loading>
                {(data) => {
                    const card = data.byId.get(cardId)!
                    const name = tcgpName(card, language)
                    const set = data.setById.get(card.s)!
                    return (
                        <>
                            <Header title={name} text={`${pickPair(set.n, language)} · ${card.no}`} crumbs={[[L.library, '/tcg-pocket/cartas'], [pickPair(set.n, language), tcgpSetPath(set)]]} />
                            <section className={`${panel} grid gap-6 sm:grid-cols-[18rem_1fr]`}>
                                <TcgpCardImage card={card} eager />
                                <CardFacts card={card} data={data} />
                            </section>
                            {card.d && <p className="italic text-slate-500">{pickPair(card.d, language)}</p>}
                            {pokedexSlug && <Link href={`/pokemon/${pokedexSlug}`} className="self-start font-bold text-red-600 underline-offset-2 hover:underline">{L.pokedex.replace('{name}', name.replace(/ ex$/, ''))} →</Link>}
                            {sameName.length > 0 && <Panel title={L.otherVersions.replace('{name}', name)}><CardGrid cards={sameName} /></Panel>}
                        </>
                    )
                }}
            </Loading>
            <Panel title={L.about}>{about[language === 'en' ? 1 : 0].map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}</Panel>
            <p className="text-center text-xs text-slate-500">{L.credit}</p>
        </div>
    )
}

export function TcgpSetIndex({ sets }: { sets: TcgpSet[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <Header title={L.sets} text={L.setsDesc} />
            <ul className="grid gap-3 sm:grid-cols-2">
                {[...sets].reverse().map((set) => (
                    <li key={set.id}>
                        <Link href={tcgpSetPath(set)} className={`${panel} transition hover:-translate-y-1`}>
                            <span className="text-xl font-black">{pickPair(set.n, language)}</span>
                            <span className="text-sm text-slate-500">{L.setCards.replace('{n}', String(set.total)).replace('{date}', new Date(`${set.date}T12:00:00`).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'medium' }))}</span>
                            {set.boosters.length > 0 && <span className="text-sm">{L.boosters}: {set.boosters.map((booster) => pickPair(booster.n, language)).join(', ')}</span>}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export function TcgpSetView({ set, cards, about }: { set: TcgpSet; cards: CardSummary[]; about: [string[], string[]] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Header title={pickPair(set.n, language)} text={L.setCards.replace('{n}', String(set.total)).replace('{date}', new Date(`${set.date}T12:00:00`).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'medium' }))} crumbs={[[L.sets, '/tcg-pocket/colecoes']]} />
            <Panel title={L.about}>{about[language === 'en' ? 1 : 0].map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}</Panel>
            <section className={panel}><CardGrid cards={cards} /></section>
            <Link href="/tcg-pocket/pacotes" className="self-start rounded-full bg-sky-600 px-5 py-2 font-black text-white">{L.packs} →</Link>
        </div>
    )
}

export function TcgpPackSimulator() {
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <Header title={L.packs} text={L.packsDesc} />
            <Loading>{(data) => <PackSimulator data={data} />}</Loading>
            <p className="text-center text-xs text-slate-500">{L.packNote}</p>
            <Basics />
        </div>
    )
}

function PackSimulator({ data }: { data: TcgpData }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const boosters = data.sets
        .flatMap((set) => set.boosters.map((booster) => ({ set, booster })))
        .filter(({ set, booster }) => data.cards.some((card) => card.s === set.id && card.b.includes(booster.id) && card.ie))
    const [choice, setChoice] = useState(boosters.length - 1)
    const [pack, setPack] = useState<TcgpCard[]>([])
    const [opened, setOpened] = useState(0)
    const [rare, setRare] = useState<TcgpCard[]>([])
    const current = boosters[choice]
    const pool = data.cards.filter((card) => card.s === current.set.id && card.b.includes(current.booster.id) && card.ie)

    const open = (count: number) => {
        let last: TcgpCard[] = []
        const found: TcgpCard[] = []
        for (let index = 0; index < count; index++) {
            last = openTcgpPack(pool).filter(Boolean)
            found.push(...last.filter((card) => card.r.includes('Star') || card.r === 'Crown' || card.r.includes('Shiny')))
        }
        setPack(last)
        setOpened((value) => value + count)
        setRare((list) => [...found, ...list].slice(0, 30))
    }

    return (
        <>
            <section className={`${panel} sm:flex-row sm:flex-wrap sm:items-center`}>
                <select value={choice} onChange={(event) => { setChoice(Number(event.target.value)); setPack([]); setOpened(0); setRare([]) }} className={select}>
                    {boosters.map(({ set, booster }, index) => <option key={booster.id} value={index}>{pickPair(set.n, language)} · {pickPair(booster.n, language)}</option>)}
                </select>
                <button type="button" disabled={!pool.length} onClick={() => open(1)} className="rounded-full bg-sky-600 px-5 py-2 font-black text-white disabled:opacity-40">{L.openPack}</button>
                <button type="button" disabled={!pool.length} onClick={() => open(10)} className="rounded-full bg-indigo-600 px-5 py-2 font-black text-white disabled:opacity-40">{L.open10}</button>
                {opened > 0 && <span className="text-sm font-bold">{L.opened}: {opened}</span>}
            </section>
            {pack.length > 0 && (
                <section className={panel}>
                    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                        <AnimatePresence mode="popLayout">
                            {pack.map((card, index) => (
                                <motion.li key={`${opened}-${index}`} initial={{ opacity: 0, y: 30, rotateY: 90 }} animate={{ opacity: 1, y: 0, rotateY: 0, transition: { delay: index * 0.12 } }} className="flex flex-col items-center gap-1">
                                    <TcgpCardImage card={card} eager />
                                    <RarityBadge rarity={card.r} />
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                </section>
            )}
            {rare.length > 0 && <Panel title={L.rare}><CardGrid cards={rare.filter((card, index, list) => list.findIndex((other) => other.id === card.id) === index)} /></Panel>}
        </>
    )
}

const parseDeck = (value: string | null) =>
    Object.fromEntries((value ?? '').split(',').map((entry) => entry.split(':')).filter(([id, count]) => id && Number(count) > 0).map(([id, count]) => [id, Math.min(MAX_COPIES, Number(count))]))

export function TcgpDeckBuilder({ initial }: { initial: string | null }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Header title={L.decks} text={L.decksDesc} />
            <Loading>{(data) => <DeckBuilder data={data} initial={parseDeck(initial)} />}</Loading>
            <Basics />
        </div>
    )
}

function DeckBuilder({ data, initial }: { data: TcgpData; initial: Record<string, number> }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(Object.entries(initial).filter(([id]) => data.byId.has(id))))
    const [query, setQuery] = useState('')
    const [message, setMessage] = useState('')
    const deckCards = Object.keys(counts).flatMap((id) => data.byId.get(id) ?? [])
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
    const problems = deckProblems(deckCards, counts, language)
    const energies = [...new Set(deckCards.flatMap((card) => card.c === 'Pokemon' ? card.at.flatMap((attack) => attack.cost) : []))].filter((type) => type !== 'Colorless').slice(0, 3)
    const normalized = normalizeTcgp(query)
    const results = normalized ? data.cards.filter((card) => card.ie && card.n.some((name) => normalizeTcgp(name).includes(normalized))).slice(0, 24) : []

    const update = (next: Record<string, number>) => {
        setCounts(next)
        setMessage('')
        const value = Object.entries(next).filter(([, count]) => count > 0).map(([id, count]) => `${id}:${count}`).join(',')
        window.history.replaceState(null, '', value ? `${window.location.pathname}?deck=${value}` : window.location.pathname)
    }
    const add = (card: TcgpCard) => {
        if (total >= DECK_SIZE) return
        update({ ...counts, [card.id]: Math.min(MAX_COPIES, (counts[card.id] ?? 0) + 1) })
    }
    const remove = (card: TcgpCard) => {
        const next = { ...counts, [card.id]: (counts[card.id] ?? 0) - 1 }
        if (next[card.id] <= 0) delete next[card.id]
        update(next)
    }

    return (
        <>
            <section className={panel}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl font-black text-sky-800 dark:text-sky-300">{L.count.replace('{n}', String(total)).replace('{max}', String(DECK_SIZE))}</h2>
                    <div className="flex gap-2">
                        {total > 0 && <button type="button" onClick={async () => { await navigator.clipboard.writeText(window.location.href); setMessage(L.copied) }} className="rounded-full bg-sky-600 px-4 py-1.5 text-sm font-black text-white">{L.copyLink}</button>}
                        {total > 0 && <button type="button" onClick={() => update({})} className="rounded-full border border-slate-400 px-4 py-1.5 text-sm font-bold">{L.clear}</button>}
                    </div>
                </div>
                {message && <p role="status" className="text-sm font-bold">{message}</p>}
                {deckCards.length === 0 ? <p className="text-slate-500">{L.deckEmpty}</p> : (
                    <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-10">
                        {deckCards.map((card) => (
                            <li key={card.id} className="relative">
                                <button type="button" onClick={() => remove(card)} title={tcgpName(card, language)} className="block w-full"><TcgpCardImage card={card} /></button>
                                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-sky-700 text-xs font-black text-white">{counts[card.id]}</span>
                            </li>
                        ))}
                    </ul>
                )}
                {total > 0 && (problems.length ? (
                    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-red-600">{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>
                ) : <p className="font-bold text-green-600">✓ {L.valid}</p>)}
                {energies.length > 0 && <p className="flex items-center gap-2 text-sm font-bold">{L.energies}: {energies.map((type) => <TypeIcon key={type} type={type} />)}</p>}
            </section>
            <section className={panel}>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={L.search} className={select} />
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {results.map((card) => (
                        <li key={card.id} className="flex flex-col gap-1">
                            <TcgpCardImage card={card} />
                            <button type="button" disabled={total >= DECK_SIZE || (counts[card.id] ?? 0) >= MAX_COPIES} onClick={() => add(card)} className="rounded-full bg-sky-600 px-2 py-1 text-xs font-black text-white disabled:opacity-40">+ {L.add}</button>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    )
}
