'use client'

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useChallenge } from "../../../hooks/useChallenge";
import { useLanguage } from "../../../context/languageContext";
import type { Language } from "../../../i18n/translations";
import { seededFraction } from "../../../lib/challenge";
import {
    YGO_POOL, normalizeYgo, ygoAttributeLabel, ygoFrameLabel, ygoImage, ygoKindLabel, ygoName, ygoRaceLabel,
    type YgoPoolCard, type YgoPoolData,
} from "../../../lib/ygo";
import { YgoCardImage, useYgoPool } from "../../ygo/shared";
import { HintBoard, type Hint } from "../hints";
import { CARD } from "../shared";
import { PlayBar, SessionEnd, SessionError, SessionLayout, SessionLoading, type SessionProps } from "./common";

type Verdict = 'correct' | 'partial' | 'wrong' | 'higher' | 'lower'

const LABELS = {
    pt: {
        placeholder: 'Digite o nome da carta', noResults: 'Nenhuma carta encontrada.', hint: 'Só as 1000 cartas mais populares entram no sorteio. Vale buscar pelo nome em português ou em inglês.',
        card: 'Carta', category: 'Categoria', attribute: 'Atributo', type: 'Tipo', level: 'Nível', atk: 'ATK', def: 'DEF', year: 'Ano',
        intro: 'Escolha uma carta: cada palpite mostra o que bate com a carta secreta.', correct: 'Igual', wrong: 'Diferente', partial: 'Em parte',
        higher: 'maior/mais nova', lower: 'menor/mais antiga', guesses: 'Seus palpites', whichArt: 'De qual carta é esta ilustração?',
        whichEffect: 'De qual carta é este efeito?', firstLetter: 'Primeira letra', archetype: 'Arquétipo', stats: 'Nível · ATK / DEF', results: '{n} resultado(s)',
    },
    en: {
        placeholder: 'Type a card name', noResults: 'No card found.', hint: 'Only the 1000 most popular cards are in the draw. You can search by English or Portuguese name.',
        card: 'Card', category: 'Category', attribute: 'Attribute', type: 'Type', level: 'Level', atk: 'ATK', def: 'DEF', year: 'Year',
        intro: 'Pick a card: each guess shows what matches the secret card.', correct: 'Match', wrong: 'Different', partial: 'Partial',
        higher: 'higher/newer', lower: 'lower/older', guesses: 'Your guesses', whichArt: 'Which card is this artwork from?',
        whichEffect: 'Which card has this effect?', firstLetter: 'First letter', archetype: 'Archetype', stats: 'Level · ATK / DEF', results: '{n} result(s)',
    },
} satisfies Record<Language, Record<string, string>>

const VERDICT_STYLES: Record<Verdict, string> = {
    correct: 'bg-green-600 text-white', partial: 'bg-amber-400 text-zinc-900', wrong: 'bg-red-600 text-white', higher: 'bg-red-600 text-white', lower: 'bg-red-600 text-white',
}
const GRID = 'grid grid-cols-[4.5rem_repeat(7,minmax(0,1fr))] gap-1'

const compareNumber = (guess: number | null | undefined, target: number | null | undefined): Verdict =>
    guess == null || target == null ? (guess == target ? 'correct' : 'wrong') : guess === target ? 'correct' : target > guess ? 'higher' : 'lower'

const category = (card: YgoPoolCard, language: Language) => card.k === 'm' ? `${ygoFrameLabel(card.f, language)}${card.p ? ' ⟠' : ''}` : ygoKindLabel(card, language)
const typeOf = (card: YgoPoolCard, language: Language) => card.k === 'm' ? ygoRaceLabel(card.r, language) : '—'
const stat = (value: number | null | undefined) => value == null ? '—' : value === -1 ? '?' : String(value)

function compareCards(guess: YgoPoolCard, target: YgoPoolCard, language: Language) {
    const sameCategory = guess.k === target.k && guess.f === target.f && Boolean(guess.p) === Boolean(target.p) && (guess.k === 'm' || guess.r === target.r)
    return [
        { verdict: sameCategory ? 'correct' : guess.k === target.k ? 'partial' : 'wrong', value: category(guess, language) },
        { verdict: (guess.a ?? null) === (target.a ?? null) ? 'correct' : 'wrong', value: ygoAttributeLabel(guess.a, language) },
        { verdict: typeOf(guess, language) === typeOf(target, language) ? 'correct' : 'wrong', value: typeOf(guess, language) },
        { verdict: compareNumber(guess.l, target.l), value: stat(guess.l) },
        { verdict: compareNumber(guess.atk, target.atk), value: stat(guess.atk) },
        { verdict: compareNumber(guess.def, target.def), value: stat(guess.def) },
        { verdict: compareNumber(guess.y, target.y), value: String(guess.y ?? '—') },
    ] satisfies { verdict: Verdict; value: string }[]
}

export default function YgoSession(session: SessionProps) {
    const state = useYgoPool()
    if (!state) return <SessionLoading />
    if (state.status === 'error') return <SessionError canRetry onRetry={session.onNextRound} />
    return <YgoRound session={session} data={state.data} />
}

function YgoRound({ session, data }: { session: SessionProps; data: YgoPoolData }) {
    const { mode, variant, dateKey, series } = session
    const { language } = useLanguage()
    const { target, solution, guesses, wrongCount, attempts, status, stats, reward, guess, giveUp } = useChallenge(mode, variant, dateKey, series)
    const pool = useMemo(() => YGO_POOL.map((id) => data.byId.get(id)!).filter(Boolean), [data])
    const card = pool[solution[0]]
    if (!card) return <SessionError canRetry={variant === 'random' && !series} onRetry={session.onNextRound} />

    const revealed = status !== 'playing'
    const guessed = guesses.flatMap((index) => pool[index] ?? [])

    return (
        <SessionLayout
            clue={mode === 'ygo-arte' ? <ArtClue card={card} seed={`${dateKey}:${target}`} revealed={revealed} wrongCount={wrongCount} /> : mode === 'ygo-efeito' ? <EffectClue card={card} revealed={revealed} /> : undefined}
            sticky={!revealed}
            aside={status === 'playing' ? (
                <>
                    <CardGuessInput pool={pool} guessed={guesses} onGuess={guess} />
                    <PlayBar count={guesses.length} canGiveUp={variant === 'random' || Boolean(series)} onGiveUp={giveUp} />
                </>
            ) : (
                <SessionEnd
                    session={session}
                    status={status}
                    answer={{ ids: [solution[0]], label: ygoName(card, language), artwork: <span className="mx-auto block w-32"><YgoCardImage card={card} eager /></span> }}
                    attempts={attempts}
                    stats={stats}
                    reward={reward}
                />
            )}
        >
            {mode === 'ygo-atributos' ? (
                <AttributeGrid guesses={guessed} target={card} />
            ) : (
                <>
                    <ClueHints card={card} wrongCount={wrongCount} revealed={revealed} />
                    <GuessList guesses={guessed} target={card} />
                </>
            )}
        </SessionLayout>
    )
}

function CardGuessInput({ pool, guessed, onGuess }: { pool: YgoPoolCard[]; guessed: number[]; onGuess: (index: number) => void }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [query, setQuery] = useState('')
    const [active, setActive] = useState(0)
    const id = useId()
    const normalized = normalizeYgo(query)
    const options = normalized
        ? pool
            .map((card, index) => ({ card, index }))
            .filter(({ card, index }) => !guessed.includes(index) && card.n.some((name) => normalizeYgo(name).includes(normalized)))
            .sort((a, b) => Number(normalizeYgo(ygoName(b.card, language)).startsWith(normalized)) - Number(normalizeYgo(ygoName(a.card, language)).startsWith(normalized)) || ygoName(a.card, language).localeCompare(ygoName(b.card, language)))
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
                className="w-full rounded-2xl border-4 border-violet-800 bg-white px-4 py-2.5 text-lg font-bold shadow outline-none placeholder:font-normal placeholder:text-zinc-400 focus:border-amber-500 dark:bg-zinc-900"
            />
            <AnimatePresence initial={false}>
                {normalized ? (
                    <motion.div key="results" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <p className="mb-1 px-1 text-xs font-bold text-zinc-500" aria-live="polite">{L.results.replace('{n}', String(options.length))}</p>
                        <ul id={`${id}-list`} role="listbox" className="max-h-[50vh] overflow-y-auto overscroll-contain rounded-2xl bg-zinc-50 p-1.5 ring-1 ring-zinc-200 dark:bg-zinc-950/60 dark:ring-zinc-700">
                            {options.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-zinc-500">{L.noResults}</li>
                            ) : options.map(({ card, index }, position) => (
                                <li
                                    key={card.id}
                                    role="option"
                                    aria-selected={position === activeIndex}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onMouseEnter={() => setActive(position)}
                                    onClick={() => select(index)}
                                    className={`flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 font-semibold ${position === activeIndex ? 'bg-violet-800 text-white' : ''}`}
                                >
                                    <Image src={ygoImage(card.id, 'art')} alt="" width={40} height={40} unoptimized loading="lazy" className="size-10 rounded object-cover" />
                                    <span className="min-w-0 flex-1 truncate">{ygoName(card, language)}</span>
                                    {language === 'pt' && card.n[0] !== card.n[1] && <span className="hidden max-w-[40%] truncate text-xs opacity-70 sm:inline">{card.n[1]}</span>}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ) : (
                    <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-1 text-center text-xs text-zinc-500">{L.hint}</motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}

function AttributeGrid({ guesses, target }: { guesses: YgoPoolCard[]; target: YgoPoolCard }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const columns = [L.category, L.attribute, L.type, L.level, L.atk, L.def, L.year]
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
                            <motion.span role="cell" initial={{ scale: 0 }} animate={{ scale: 1 }} title={ygoName(guess, language)} className={`relative h-16 overflow-hidden rounded-xl ${guess.id === target.id ? 'ring-4 ring-green-600' : ''}`}>
                                <Image src={ygoImage(guess.id, 'art')} alt={ygoName(guess, language)} fill unoptimized sizes="4.5rem" className="object-cover" />
                            </motion.span>
                            {compareCards(guess, target, language).map(({ verdict, value }, index) => (
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
                {(['correct', 'partial', 'wrong'] as const).map((verdict) => (
                    <li key={verdict} className="flex items-center gap-1.5"><span className={`size-3 rounded ${VERDICT_STYLES[verdict]}`} />{L[verdict]}</li>
                ))}
                <li>↑ ↓ {L.higher} / {L.lower}</li>
            </ul>
        </div>
    )
}

function GuessList({ guesses, target }: { guesses: YgoPoolCard[]; target: YgoPoolCard }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    if (guesses.length === 0) return null
    return (
        <section className={`${CARD} p-4`}>
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-zinc-500">{L.guesses}</h3>
            <ul className="flex flex-col gap-2">
                {[...guesses].reverse().map((guess) => {
                    const [kind, attribute, , level, , , year] = compareCards(guess, target, language)
                    return (
                        <motion.li key={guess.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-2xl bg-violet-950 px-3 py-2 text-white">
                            <span className="flex-1 truncate font-black">{ygoName(guess, language)}</span>
                            {[kind, attribute, level, year].map((cell, index) => (
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

function ArtClue({ card, seed, revealed, wrongCount }: { card: YgoPoolCard; seed: string; revealed: boolean; wrongCount: number }) {
    const { language } = useLanguage()
    const progress = Math.max(0, 1 - wrongCount / ZOOM_STEPS)
    const origin = `${25 + seededFraction(`${seed}:x`) * 50}% ${25 + seededFraction(`${seed}:y`) * 50}%`
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} p-6`}>
            <p className="mb-4 text-center text-sm font-black uppercase tracking-[0.2em] text-violet-800 dark:text-amber-300">{LABELS[language].whichArt}</p>
            <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-2xl border-4 border-amber-600 bg-zinc-900">
                <motion.div
                    initial={false}
                    animate={{ scale: revealed ? 1 : 1 + (MAX_ZOOM - 1) * progress, filter: `blur(${revealed ? 0 : 6 * progress}px)` }}
                    transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                    style={{ transformOrigin: origin }}
                    className="absolute inset-0"
                >
                    <Image src={ygoImage(card.id, 'art')} alt="" fill unoptimized sizes="20rem" className="object-cover" />
                </motion.div>
            </div>
        </motion.div>
    )
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function maskCardName(text: string, card: Pick<YgoPoolCard, 'n'>) {
    return [...new Set(card.n)].sort((a, b) => b.length - a.length).reduce((result, name) => result.replace(new RegExp(escapeRegex(name), 'gi'), '■■■'), text)
}

function EffectClue({ card, revealed }: { card: YgoPoolCard; revealed: boolean }) {
    const { language } = useLanguage()
    const text = language === 'pt' ? card.tx[0] ?? card.tx[1] : card.tx[1]
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} flex flex-col gap-4 p-6`}>
            <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-violet-800 dark:text-amber-300">{LABELS[language].whichEffect}</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {revealed && <span className="mx-auto block w-36 shrink-0"><YgoCardImage card={card} eager /></span>}
                <p className="flex-1 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed whitespace-pre-line text-zinc-900 ring-2 ring-amber-600/40 dark:bg-zinc-950 dark:text-zinc-100">{revealed ? text : maskCardName(text, card)}</p>
            </div>
        </motion.div>
    )
}

function ClueHints({ card, wrongCount, revealed }: { card: YgoPoolCard; wrongCount: number; revealed: boolean }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const name = ygoName(card, language)
    const hints: Hint[] = [
        { at: 2, label: L.category, value: ygoKindLabel(card, language) },
        { at: 4, label: `${L.attribute} · ${L.type}`, value: card.k === 'm' ? `${ygoAttributeLabel(card.a, language)} · ${ygoRaceLabel(card.r, language)}` : '—' },
        { at: 6, label: L.stats, value: card.k === 'm' ? `${card.l} · ${stat(card.atk)} / ${stat(card.def)}` : '—' },
        { at: 8, label: L.archetype, value: card.ar ?? '—' },
        { at: 10, label: L.firstLetter, value: name[0] },
    ]
    return <HintBoard hints={hints} wrongCount={wrongCount} revealed={revealed} />
}
