'use client'

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { useChallenge } from "../../../hooks/useChallenge";
import { useLanguage } from "../../../context/languageContext";
import type { Language } from "../../../i18n/translations";
import { seededFraction, type ChallengeMode } from "../../../lib/challenge";
import { ANIME_POOL, animeTitle, formatLabel, genreLabel, searchAnime, sourceLabel, type AnimePool, type AnimeSummary } from "../../../lib/anime";
import { useAnimePool } from "../../anime/data";
import { HintBoard, type Hint } from "../hints";
import { CARD } from "../shared";
import { PlayBar, SessionEnd, SessionError, SessionLayout, SessionLoading, type SessionProps } from "./common";

type Verdict = 'correct' | 'partial' | 'wrong' | 'higher' | 'lower'

const LABELS = {
    pt: {
        placeholder: 'Digite o nome de um anime', noResults: 'Nenhum anime encontrado.', hint: 'Digite em japonês romanizado ou em inglês.',
        anime: 'Anime', genres: 'Gêneros', format: 'Formato', year: 'Ano', episodes: 'Episódios', studio: 'Estúdio', source: 'Origem', score: 'Nota',
        intro: 'Escolha um anime: cada palpite mostra o que bate com o anime secreto.', correct: 'Igual', partial: 'Em parte', wrong: 'Diferente',
        higher: 'maior', lower: 'menor', guesses: 'Seus palpites', whichCover: 'De qual anime é esta capa?', whichCharacter: 'De qual anime é este personagem?',
        character: 'Personagem', firstLetter: 'Primeira letra', results: '{n} resultado(s)',
    },
    en: {
        placeholder: 'Type an anime title', noResults: 'No anime found.', hint: 'Type the romanized Japanese or the English title.',
        anime: 'Anime', genres: 'Genres', format: 'Format', year: 'Year', episodes: 'Episodes', studio: 'Studio', source: 'Source', score: 'Score',
        intro: 'Pick an anime: each guess shows what matches the secret anime.', correct: 'Match', partial: 'Partial', wrong: 'Different',
        higher: 'higher', lower: 'lower', guesses: 'Your guesses', whichCover: 'Which anime is this cover from?', whichCharacter: 'Which anime is this character from?',
        character: 'Character', firstLetter: 'First letter', results: '{n} result(s)',
    },
} satisfies Record<Language, Record<string, string>>

const VERDICT_STYLES: Record<Verdict, string> = {
    correct: 'bg-green-600 text-white', partial: 'bg-amber-400 text-zinc-900', wrong: 'bg-red-600 text-white', higher: 'bg-red-600 text-white', lower: 'bg-red-600 text-white',
}
const GRID = 'grid grid-cols-[4.5rem_repeat(7,minmax(0,1fr))] gap-1'

const compareNumber = (guess: number | null, target: number | null): Verdict =>
    guess === null || target === null ? (guess === target ? 'correct' : 'wrong') : guess === target ? 'correct' : target > guess ? 'higher' : 'lower'
const compareSets = (guess: string[], target: string[]): Verdict =>
    guess.length === target.length && guess.every((value) => target.includes(value)) ? 'correct' : guess.some((value) => target.includes(value)) ? 'partial' : 'wrong'

function compareAnime(guess: AnimeSummary, target: AnimeSummary, language: Language) {
    return [
        { verdict: compareSets(guess.genres, target.genres), value: guess.genres.map((genre) => genreLabel(genre, language)).join(', ') || '—' },
        { verdict: guess.format === target.format ? 'correct' : 'wrong', value: formatLabel(guess.format, language) },
        { verdict: compareNumber(guess.year, target.year), value: String(guess.year ?? '—') },
        { verdict: compareNumber(guess.episodes, target.episodes), value: String(guess.episodes ?? '—') },
        { verdict: guess.studio === target.studio ? 'correct' : 'wrong', value: guess.studio ?? '—' },
        { verdict: guess.source === target.source ? 'correct' : 'wrong', value: sourceLabel(guess.source, language) },
        { verdict: compareNumber(guess.score, target.score), value: guess.score ? `${guess.score}%` : '—' },
    ] satisfies { verdict: Verdict; value: string }[]
}

export default function AnimeSession(session: SessionProps) {
    const state = useAnimePool()
    if (!state) return <SessionLoading />
    if (state.status === 'error') return <SessionError canRetry onRetry={session.onNextRound} />
    return <AnimeRound session={session} pool={state.data} />
}

function AnimeRound({ session, pool }: { session: SessionProps; pool: AnimePool }) {
    const { mode, variant, dateKey, series } = session
    const { language } = useLanguage()
    const { target, solution, guesses, wrongCount, attempts, status, stats, reward, guess, giveUp } = useChallenge(mode, variant, dateKey, series)
    const options = ANIME_POOL.flatMap((id) => pool.byId.get(id) ?? [])
    const anime = pool.byId.get(solution[0])
    if (!anime) return <SessionError canRetry={variant === 'random' && !series} onRetry={session.onNextRound} />

    const revealed = status !== 'playing'
    const guessed = guesses.flatMap((id) => pool.byId.get(id) ?? [])
    const clue = mode === 'anime-capa'
        ? <CoverClue anime={anime} seed={`${dateKey}:${target}`} revealed={revealed} wrongCount={wrongCount} />
        : mode === 'anime-personagem'
            ? <CharacterClue anime={anime} seed={`${dateKey}:${target}`} revealed={revealed} wrongCount={wrongCount} />
            : undefined

    return (
        <SessionLayout
            clue={clue}
            sticky={!revealed}
            aside={status === 'playing' ? (
                <>
                    <AnimeGuessInput anime={options} guessed={guesses} onGuess={guess} />
                    <PlayBar count={guesses.length} canGiveUp={variant === 'random' || Boolean(series)} onGiveUp={giveUp} />
                </>
            ) : (
                <SessionEnd
                    session={session}
                    status={status}
                    answer={{ ids: [anime.id], label: animeTitle(anime, language), artwork: <Image src={anime.img} alt="" width={160} height={230} unoptimized className="mx-auto h-40 w-auto rounded-xl shadow-lg" /> }}
                    attempts={attempts}
                    stats={stats}
                    reward={reward}
                />
            )}
        >
            {mode === 'anime-atributos' ? (
                <AnimeAttributeGrid guesses={guessed} target={anime} />
            ) : (
                <>
                    <AnimeHints mode={mode} anime={anime} wrongCount={wrongCount} revealed={revealed} />
                    <AnimeGuessList guesses={guessed} target={anime} />
                </>
            )}
        </SessionLayout>
    )
}

function AnimeGuessInput({ anime, guessed, onGuess }: { anime: AnimeSummary[]; guessed: number[]; onGuess: (id: number) => void }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [query, setQuery] = useState('')
    const [active, setActive] = useState(0)
    const id = useId()
    const isOpen = query.trim() !== ''
    const options = isOpen ? searchAnime(anime, query).filter((entry) => !guessed.includes(entry.id)).slice(0, 50) : []
    const activeIndex = Math.min(active, options.length - 1)

    const select = (entry: AnimeSummary) => {
        onGuess(entry.id)
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
            select(options[activeIndex])
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
                aria-expanded={isOpen}
                aria-controls={`${id}-list`}
                value={query}
                onChange={(event) => { setQuery(event.target.value); setActive(0) }}
                onKeyDown={onKeyDown}
                placeholder={L.placeholder}
                className="w-full rounded-2xl border-4 border-pink-700 bg-white px-4 py-2.5 text-lg font-bold shadow outline-none placeholder:font-normal placeholder:text-zinc-400 focus:border-pink-400 dark:bg-zinc-900"
            />
            <AnimatePresence initial={false}>
                {isOpen ? (
                    <motion.div key="results" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <p className="mb-1 px-1 text-xs font-bold text-zinc-500" aria-live="polite">{L.results.replace('{n}', String(options.length))}</p>
                        <ul id={`${id}-list`} role="listbox" className="max-h-[50vh] overflow-y-auto overscroll-contain rounded-2xl bg-zinc-50 p-1.5 ring-1 ring-zinc-200 dark:bg-zinc-950/60 dark:ring-zinc-700">
                            {options.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-zinc-500">{L.noResults}</li>
                            ) : options.map((entry, index) => (
                                <li
                                    key={entry.id}
                                    role="option"
                                    aria-selected={index === activeIndex}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onMouseEnter={() => setActive(index)}
                                    onClick={() => select(entry)}
                                    className={`flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 font-semibold ${index === activeIndex ? 'bg-pink-700 text-white' : ''}`}
                                >
                                    <Image src={entry.img} alt="" width={28} height={40} unoptimized loading="lazy" className="h-10 w-7 rounded object-cover" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate">{animeTitle(entry, language)}</span>
                                        {entry.english && entry.english !== entry.romaji && <span className="block truncate text-xs opacity-70">{language === 'en' ? entry.romaji : entry.english}</span>}
                                    </span>
                                    <span className="text-xs opacity-70">{entry.year}</span>
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

function AnimeAttributeGrid({ guesses, target }: { guesses: AnimeSummary[]; target: AnimeSummary }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const columns = [L.genres, L.format, L.year, L.episodes, L.studio, L.source, L.score]
    if (guesses.length === 0) return <p className={`${CARD} p-5 text-center text-sm font-semibold`}>{L.intro}</p>
    return (
        <div className={`${CARD} p-3`}>
            <div className="overflow-x-auto pb-1 lg:overflow-visible">
                <div role="table" className="flex min-w-160 flex-col gap-1.5 lg:min-w-0">
                    <div role="row" className={`${GRID} text-center text-[10px] leading-tight font-black uppercase text-zinc-500`}>
                        <span role="columnheader">{L.anime}</span>
                        {columns.map((column) => <span key={column} role="columnheader">{column}</span>)}
                    </div>
                    {[...guesses].reverse().map((guess) => (
                        <div key={guess.id} role="row" className={GRID}>
                            <motion.span role="cell" initial={{ scale: 0 }} animate={{ scale: 1 }} title={animeTitle(guess, language)} className={`relative h-16 overflow-hidden rounded-xl ${guess.id === target.id ? 'ring-4 ring-green-600' : ''}`}>
                                <Image src={guess.img} alt="" fill unoptimized sizes="4.5rem" className="object-cover" />
                                <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 text-[9px] leading-tight font-bold text-white line-clamp-2">{animeTitle(guess, language)}</span>
                            </motion.span>
                            {compareAnime(guess, target, language).map(({ verdict, value }, index) => (
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

function AnimeGuessList({ guesses, target }: { guesses: AnimeSummary[]; target: AnimeSummary }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    if (guesses.length === 0) return null
    return (
        <section className={`${CARD} p-4`}>
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-zinc-500">{L.guesses}</h3>
            <ul className="flex flex-col gap-2">
                {[...guesses].reverse().map((guess) => {
                    const [genres, , year] = compareAnime(guess, target, language)
                    return (
                        <motion.li key={guess.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-2xl bg-[#1e1033] px-3 py-2 text-white">
                            <Image src={guess.img} alt="" width={28} height={40} unoptimized className="h-10 w-7 rounded object-cover" />
                            <span className="flex-1 truncate font-black">{animeTitle(guess, language)}</span>
                            <span className={`max-w-40 truncate rounded-lg px-2 py-0.5 text-xs font-black ${VERDICT_STYLES[genres.verdict]}`}>{genres.value}</span>
                            <span className={`rounded-lg px-2 py-0.5 text-xs font-black ${VERDICT_STYLES[year.verdict]}`}>{year.value}{year.verdict === 'higher' ? ' ↑' : year.verdict === 'lower' ? ' ↓' : ''}</span>
                        </motion.li>
                    )
                })}
            </ul>
        </section>
    )
}

const MAX_ZOOM = 4
const ZOOM_STEPS = 8
const MAX_BLUR = 8

function ClueFrame({ title, children }: { title: string; children: ReactNode }) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} p-6`}>
            <p className="mb-4 text-center text-sm font-black uppercase tracking-[0.2em] text-pink-700 dark:text-pink-300">{title}</p>
            {children}
        </motion.div>
    )
}

function CoverClue({ anime, seed, revealed, wrongCount }: { anime: AnimeSummary; seed: string; revealed: boolean; wrongCount: number }) {
    const { language } = useLanguage()
    const progress = Math.max(0, 1 - wrongCount / ZOOM_STEPS)
    const origin = `${25 + seededFraction(`${seed}:x`) * 50}% ${20 + seededFraction(`${seed}:y`) * 50}%`
    return (
        <ClueFrame title={LABELS[language].whichCover}>
            <div className="relative mx-auto aspect-2/3 w-full max-w-xs overflow-hidden rounded-2xl border-4 border-pink-700 bg-zinc-900">
                <motion.div
                    initial={false}
                    animate={{ scale: revealed ? 1 : 1 + (MAX_ZOOM - 1) * progress, filter: `blur(${revealed ? 0 : MAX_BLUR * progress}px)` }}
                    transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                    style={{ transformOrigin: origin }}
                    className="absolute inset-0"
                >
                    <Image src={anime.img} alt="" fill unoptimized sizes="20rem" className="object-cover" />
                </motion.div>
            </div>
        </ClueFrame>
    )
}

function CharacterClue({ anime, seed, revealed, wrongCount }: { anime: AnimeSummary; seed: string; revealed: boolean; wrongCount: number }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const characters = anime.chars.length ? anime.chars : []
    const first = Math.floor(seededFraction(`${seed}:char`) * Math.max(1, characters.length))
    const shown = characters.length ? [characters[first], ...(wrongCount >= 4 || revealed ? characters.filter((_, index) => index !== first).slice(0, 1) : [])] : []
    const blur = revealed ? 0 : Math.max(0, 6 - wrongCount * 1.5)
    return (
        <ClueFrame title={L.whichCharacter}>
            <ul className="flex justify-center gap-4">
                {shown.map((character) => (
                    <li key={character.id} className="flex flex-col items-center gap-2">
                        <motion.div initial={false} animate={{ filter: `blur(${blur}px)` }} className="relative aspect-2/3 w-36 overflow-hidden rounded-2xl border-4 border-pink-700 bg-zinc-900 sm:w-44">
                            <Image src={character.img} alt="" fill unoptimized sizes="11rem" className="object-cover" />
                        </motion.div>
                        {(revealed || wrongCount >= 6) && <p className="text-sm font-black">{character.n}</p>}
                    </li>
                ))}
            </ul>
        </ClueFrame>
    )
}

function AnimeHints({ mode, anime, wrongCount, revealed }: { mode: ChallengeMode; anime: AnimeSummary; wrongCount: number; revealed: boolean }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const title = animeTitle(anime, language)
    const base = [
        { label: L.genres, value: anime.genres.map((genre) => genreLabel(genre, language)).join(', ') || '—' },
        { label: L.year, value: String(anime.year ?? '—') },
        { label: L.studio, value: anime.studio ?? '—' },
        { label: L.format, value: formatLabel(anime.format, language) },
    ]
    const ordered = mode === 'anime-personagem' ? [base[0], base[3], base[1], base[2]] : base
    const hints: Hint[] = [
        ...ordered.map((hint, index) => ({ ...hint, at: (index + 1) * 2 })),
        { at: 10, label: L.firstLetter, value: title[0] },
    ]
    return <HintBoard hints={hints} wrongCount={wrongCount} revealed={revealed} />
}
