'use client'

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useChallenge } from "../../../hooks/useChallenge";
import { useLanguage } from "../../../context/languageContext";
import type { Language } from "../../../i18n/translations";
import { seededFraction } from "../../../lib/challenge";
import {
    TCGP_POOL, normalizeTcgp, pickPair, rarityInfo, rarityLabel, rarityRank, tcgpImage, tcgpKindLabel, tcgpName, tcgpTypeLabel,
    type TcgpCard, type TcgpData,
} from "../../../lib/tcgp";
import { TcgpCardImage, useTcgpData } from "../../tcgp/shared";
import { HintBoard, type Hint } from "../hints";
import { CARD } from "../shared";
import { PlayBar, SessionEnd, SessionError, SessionLayout, SessionLoading, type SessionProps } from "./common";

type Verdict = 'correct' | 'partial' | 'wrong' | 'higher' | 'lower'

const LABELS = {
    pt: {
        placeholder: 'Digite o nome da carta', noResults: 'Nenhuma carta encontrada.', hint: 'Várias cartas têm o mesmo Pokémon: confira a coleção e a raridade.',
        card: 'Carta', type: 'Tipo', kind: 'Estágio', hp: 'HP', rarity: 'Raridade', set: 'Coleção', retreat: 'Recuo', weakness: 'Fraqueza',
        intro: 'Escolha uma carta: cada palpite mostra o que bate com a carta secreta.', correct: 'Igual', wrong: 'Diferente', partial: 'Em parte',
        higher: 'maior/mais nova', lower: 'menor/mais antiga', guesses: 'Seus palpites', whichArt: 'De qual carta é esta ilustração?',
        firstLetter: 'Primeira letra', illustrator: 'Ilustração', results: '{n} resultado(s)',
    },
    en: {
        placeholder: 'Type a card name', noResults: 'No card found.', hint: 'Many cards share a Pokémon: check the set and rarity.',
        card: 'Card', type: 'Type', kind: 'Stage', hp: 'HP', rarity: 'Rarity', set: 'Set', retreat: 'Retreat', weakness: 'Weakness',
        intro: 'Pick a card: each guess shows what matches the secret card.', correct: 'Match', wrong: 'Different', partial: 'Partial',
        higher: 'higher/newer', lower: 'lower/older', guesses: 'Your guesses', whichArt: 'Which card is this illustration from?',
        firstLetter: 'First letter', illustrator: 'Illustrator', results: '{n} result(s)',
    },
} satisfies Record<Language, Record<string, string>>

const VERDICT_STYLES: Record<Verdict, string> = {
    correct: 'bg-green-600 text-white', partial: 'bg-amber-400 text-zinc-900', wrong: 'bg-red-600 text-white', higher: 'bg-red-600 text-white', lower: 'bg-red-600 text-white',
}
const GRID = 'grid grid-cols-[4.5rem_repeat(7,minmax(0,1fr))] gap-1'

const compareNumber = (guess: number | null, target: number | null): Verdict =>
    guess === null || target === null ? (guess === target ? 'correct' : 'wrong') : guess === target ? 'correct' : target > guess ? 'higher' : 'lower'

function compareCards(data: TcgpData, guess: TcgpCard, target: TcgpCard, language: Language) {
    const setIndex = (card: TcgpCard) => data.sets.findIndex((set) => set.id === card.s)
    return [
        { verdict: guess.ty.join() === target.ty.join() ? 'correct' : 'wrong', value: guess.ty.map((type) => tcgpTypeLabel(type, language)).join(' / ') || '—' },
        { verdict: guess.st === target.st ? 'correct' : 'wrong', value: tcgpKindLabel(guess, language) },
        { verdict: compareNumber(guess.hp, target.hp), value: String(guess.hp ?? '—') },
        { verdict: compareNumber(rarityRank(guess.r), rarityRank(target.r)), value: rarityInfo(guess.r).symbol },
        { verdict: compareNumber(setIndex(guess), setIndex(target)), value: guess.s },
        { verdict: compareNumber(guess.rt, target.rt), value: String(guess.rt ?? '—') },
        { verdict: guess.wk === target.wk ? 'correct' : 'wrong', value: guess.wk ? tcgpTypeLabel(guess.wk, language) : '—' },
    ] satisfies { verdict: Verdict; value: string }[]
}

export default function TcgpSession(session: SessionProps) {
    const state = useTcgpData()
    if (!state) return <SessionLoading />
    if (state.status === 'error') return <SessionError canRetry onRetry={session.onNextRound} />
    return <TcgpRound session={session} data={state.data} />
}

function TcgpRound({ session, data }: { session: SessionProps; data: TcgpData }) {
    const { mode, variant, dateKey, series } = session
    const { language } = useLanguage()
    const { target, solution, guesses, wrongCount, attempts, status, stats, reward, guess, giveUp } = useChallenge(mode, variant, dateKey, series)
    const pool = useMemo(() => TCGP_POOL.map((id) => data.byId.get(id)!).filter(Boolean), [data])
    const card = pool[solution[0]]
    if (!card) return <SessionError canRetry={variant === 'random' && !series} onRetry={session.onNextRound} />

    const revealed = status !== 'playing'
    const guessed = guesses.flatMap((index) => pool[index] ?? [])

    return (
        <SessionLayout
            clue={mode === 'tcg-arte' ? <ArtClue card={card} seed={`${dateKey}:${target}`} revealed={revealed} wrongCount={wrongCount} /> : undefined}
            sticky={!revealed}
            aside={status === 'playing' ? (
                <>
                    <CardGuessInput data={data} pool={pool} guessed={guesses} onGuess={guess} />
                    <PlayBar count={guesses.length} canGiveUp={variant === 'random' || Boolean(series)} onGiveUp={giveUp} />
                </>
            ) : (
                <SessionEnd
                    session={session}
                    status={status}
                    answer={{ ids: [solution[0]], label: tcgpName(card, language), artwork: <span className="mx-auto block w-32"><TcgpCardImage card={card} eager /></span> }}
                    attempts={attempts}
                    stats={stats}
                    reward={reward}
                />
            )}
        >
            {mode === 'tcg-atributos' ? (
                <AttributeGrid data={data} guesses={guessed} target={card} />
            ) : (
                <>
                    <ArtHints data={data} card={card} wrongCount={wrongCount} revealed={revealed} />
                    <GuessList data={data} guesses={guessed} target={card} />
                </>
            )}
        </SessionLayout>
    )
}

function CardGuessInput({ data, pool, guessed, onGuess }: { data: TcgpData; pool: TcgpCard[]; guessed: number[]; onGuess: (index: number) => void }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [query, setQuery] = useState('')
    const [active, setActive] = useState(0)
    const id = useId()
    const normalized = normalizeTcgp(query)
    const options = normalized
        ? pool
            .map((card, index) => ({ card, index }))
            .filter(({ card, index }) => !guessed.includes(index) && card.n.some((name) => normalizeTcgp(name).includes(normalized)))
            .sort((a, b) => Number(normalizeTcgp(tcgpName(b.card, language)).startsWith(normalized)) - Number(normalizeTcgp(tcgpName(a.card, language)).startsWith(normalized)) || a.card.id.localeCompare(b.card.id))
            .slice(0, 60)
        : []
    const activeIndex = Math.min(active, options.length - 1)
    const select = (index: number) => {
        onGuess(index)
        setQuery('')
        setActive(0)
    }
    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown' && options.length) {
            event.preventDefault()
            setActive((activeIndex + 1) % options.length)
        } else if (event.key === 'ArrowUp' && options.length) {
            event.preventDefault()
            setActive((activeIndex - 1 + options.length) % options.length)
        } else if (event.key === 'Enter' && options[activeIndex]) {
            event.preventDefault()
            select(options[activeIndex].index)
        } else if (event.key === 'Escape') {
            setQuery('')
        }
    }

    return (
        <div className={`${CARD} flex flex-col gap-3 p-4`}>
            <label htmlFor={id} className="sr-only">{L.placeholder}</label>
            <input
                id={id}
                type="text"
                role="combobox"
                autoComplete="off"
                autoFocus
                aria-expanded={normalized !== ''}
                aria-controls={`${id}-list`}
                value={query}
                onChange={(event) => { setQuery(event.target.value); setActive(0) }}
                onKeyDown={onKeyDown}
                placeholder={L.placeholder}
                className="w-full rounded-2xl border-4 border-sky-700 bg-white px-4 py-2.5 text-lg font-bold shadow outline-none placeholder:font-normal placeholder:text-zinc-400 focus:border-sky-400 dark:bg-zinc-900"
            />
            <AnimatePresence initial={false}>
                {normalized ? (
                    <motion.div key="results" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <p className="mb-1 px-1 text-xs font-bold text-zinc-500" aria-live="polite">{L.results.replace('{n}', String(options.length))}</p>
                        <ul id={`${id}-list`} role="listbox" className="max-h-[50vh] overflow-y-auto overscroll-contain rounded-2xl bg-zinc-50 p-1.5 ring-1 ring-zinc-200 dark:bg-zinc-950/60 dark:ring-zinc-700">
                            {options.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-zinc-500">{L.noResults}</li>
                            ) : options.map(({ card, index }, position) => {
                                const src = tcgpImage(card, language, 'low')
                                return (
                                    <li
                                        key={card.id}
                                        role="option"
                                        aria-selected={position === activeIndex}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onMouseEnter={() => setActive(position)}
                                        onClick={() => select(index)}
                                        className={`flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 font-semibold ${position === activeIndex ? 'bg-sky-700 text-white' : ''}`}
                                    >
                                        {src && <Image src={src} alt="" width={30} height={42} unoptimized loading="lazy" className="h-10 w-7 rounded object-cover" />}
                                        <span className="min-w-0 flex-1 truncate">{tcgpName(card, language)}</span>
                                        <span className="text-xs opacity-80">{pickPair(data.setById.get(card.s)?.n ?? ['', ''], language)} · {rarityInfo(card.r).symbol}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </motion.div>
                ) : (
                    <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-1 text-center text-xs text-zinc-500">{L.hint}</motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}

function AttributeGrid({ data, guesses, target }: { data: TcgpData; guesses: TcgpCard[]; target: TcgpCard }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const columns = [L.type, L.kind, L.hp, L.rarity, L.set, L.retreat, L.weakness]
    if (guesses.length === 0) return <p className={`${CARD} p-5 text-center text-sm font-semibold`}>{L.intro}</p>
    return (
        <div className={`${CARD} p-3`}>
            <div className="overflow-x-auto pb-1 lg:overflow-visible">
                <div role="table" className="flex min-w-160 flex-col gap-1.5 lg:min-w-0">
                    <div role="row" className={`${GRID} text-center text-[10px] leading-tight font-black uppercase text-zinc-500`}>
                        <span role="columnheader">{L.card}</span>
                        {columns.map((column) => <span key={column} role="columnheader">{column}</span>)}
                    </div>
                    {[...guesses].reverse().map((guess) => (
                        <div key={guess.id} role="row" className={GRID}>
                            <motion.span role="cell" initial={{ scale: 0 }} animate={{ scale: 1 }} title={tcgpName(guess, language)} className={`relative h-16 overflow-hidden rounded-xl ${guess.id === target.id ? 'ring-4 ring-green-600' : ''}`}>
                                <TcgpCardImage card={guess} className="absolute inset-0 h-full object-cover object-top" />
                            </motion.span>
                            {compareCards(data, guess, target, language).map(({ verdict, value }, index) => (
                                <motion.span
                                    key={columns[index]}
                                    role="cell"
                                    initial={{ rotateY: 90, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    transition={{ delay: (index + 1) * 0.1, duration: 0.35 }}
                                    className={`flex h-16 min-w-0 flex-col items-center justify-center rounded-xl px-0.5 text-center text-[11px] font-bold leading-tight wrap-break-word shadow ${VERDICT_STYLES[verdict]}`}
                                >
                                    <span className="line-clamp-3">{value}</span>
                                    {(verdict === 'higher' || verdict === 'lower') && (
                                        <span className="text-base leading-none"><span aria-hidden="true">{verdict === 'higher' ? '↑' : '↓'}</span><span className="sr-only">{L[verdict]}</span></span>
                                    )}
                                </motion.span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <ul className="mt-3 flex flex-wrap justify-center gap-3 text-xs font-semibold">
                {(['correct', 'wrong'] as const).map((verdict) => (
                    <li key={verdict} className="flex items-center gap-1.5"><span className={`size-3 rounded ${VERDICT_STYLES[verdict]}`} />{L[verdict]}</li>
                ))}
                <li>↑ ↓ {L.higher} / {L.lower}</li>
            </ul>
        </div>
    )
}

function GuessList({ data, guesses, target }: { data: TcgpData; guesses: TcgpCard[]; target: TcgpCard }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    if (guesses.length === 0) return null
    return (
        <section className={`${CARD} p-4`}>
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-zinc-500">{L.guesses}</h3>
            <ul className="flex flex-col gap-2">
                {[...guesses].reverse().map((guess) => {
                    const [type, , , rarity, set] = compareCards(data, guess, target, language)
                    return (
                        <motion.li key={guess.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-2xl bg-sky-900 px-3 py-2 text-white">
                            <span className="flex-1 truncate font-black">{tcgpName(guess, language)}</span>
                            {[type, rarity, set].map((cell, index) => (
                                <span key={index} className={`rounded-lg px-2 py-0.5 text-xs font-black ${VERDICT_STYLES[cell.verdict]}`}>{cell.value}{cell.verdict === 'higher' ? ' ↑' : cell.verdict === 'lower' ? ' ↓' : ''}</span>
                            ))}
                        </motion.li>
                    )
                })}
            </ul>
        </section>
    )
}

const MAX_ZOOM = 4
const ZOOM_STEPS = 8

function ArtClue({ card, seed, revealed, wrongCount }: { card: TcgpCard; seed: string; revealed: boolean; wrongCount: number }) {
    const { language } = useLanguage()
    const progress = Math.max(0, 1 - wrongCount / ZOOM_STEPS)
    const src = tcgpImage(card, language)
    const origin = `${30 + seededFraction(`${seed}:x`) * 40}% ${18 + seededFraction(`${seed}:y`) * 22}%`
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} p-6`}>
            <p className="mb-4 text-center text-sm font-black uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">{LABELS[language].whichArt}</p>
            <div className={`relative mx-auto w-full max-w-xs overflow-hidden rounded-2xl border-4 border-sky-700 bg-zinc-900 ${revealed ? 'aspect-367/512' : 'aspect-square'}`}>
                {src && (
                    <motion.div
                        initial={false}
                        animate={{ scale: revealed ? 1 : 1 + (MAX_ZOOM - 1) * progress, filter: `blur(${revealed ? 0 : 6 * progress}px)` }}
                        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                        style={{ transformOrigin: origin }}
                        className="absolute inset-0"
                    >
                        <Image src={src} alt="" fill unoptimized sizes="20rem" className={`object-cover ${revealed ? '' : 'object-[50%_25%]'}`} />
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

function ArtHints({ data, card, wrongCount, revealed }: { data: TcgpData; card: TcgpCard; wrongCount: number; revealed: boolean }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const name = tcgpName(card, language)
    const hints: Hint[] = [
        { at: 2, label: L.type, value: card.ty.map((type) => tcgpTypeLabel(type, language)).join(' / ') || '—' },
        { at: 4, label: L.rarity, value: rarityLabel(card.r, language) },
        { at: 6, label: L.set, value: pickPair(data.setById.get(card.s)?.n ?? ['', ''], language) },
        { at: 8, label: L.illustrator, value: card.il ?? '—' },
        { at: 10, label: L.firstLetter, value: name[0] },
    ]
    return <HintBoard hints={hints} wrongCount={wrongCount} revealed={revealed} />
}
