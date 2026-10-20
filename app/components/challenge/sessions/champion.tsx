'use client'

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type KeyboardEvent } from "react";
import { useChallenge } from "../../../hooks/useChallenge";
import { useLanguage } from "../../../context/languageContext";
import type { Language } from "../../../i18n/translations";
import { seededFraction, type ChallengeMode } from "../../../lib/challenge";
import {
    LOL_POOL, LOL_ROLES, championIcon, championName, championSplash, pickLang, rangeLabel, roleLabel, searchChampions, spellIcon,
    type LolChampion, type LolData,
} from "../../../lib/lol";
import { useLolData } from "../../lol/data";
import { HintBoard, type Hint } from "../hints";
import { CARD } from "../shared";
import { PlayBar, SessionEnd, SessionError, SessionLayout, SessionLoading, type SessionProps } from "./common";

type Verdict = 'correct' | 'partial' | 'wrong' | 'higher' | 'lower'

const LABELS = {
    pt: {
        placeholder: 'Digite o nome de um campeão', noResults: 'Nenhum campeão encontrado.', hint: 'Comece a digitar ou filtre por classe.',
        role: 'Classe', all: 'Todas', champion: 'Campeão', roles: 'Classes', resource: 'Recurso', rangeType: 'Ataque', range: 'Alcance',
        hp: 'Vida base', speed: 'Velocidade', difficulty: 'Dificuldade', intro: 'Escolha um campeão: cada palpite mostra o que bate com o campeão secreto.',
        correct: 'Igual', partial: 'Em parte', wrong: 'Diferente', higher: 'maior', lower: 'menor', guesses: 'Seus palpites',
        whichSplash: 'De quem é esta splash art?', whichAbility: 'De quem é esta habilidade?', abilityName: 'Nome da habilidade', key: 'Tecla',
        title: 'Título', firstLetter: 'Primeira letra', results: '{n} resultado(s)',
    },
    en: {
        placeholder: 'Type a champion name', noResults: 'No champion found.', hint: 'Start typing or filter by class.',
        role: 'Class', all: 'All', champion: 'Champion', roles: 'Classes', resource: 'Resource', rangeType: 'Attack', range: 'Range',
        hp: 'Base HP', speed: 'Move speed', difficulty: 'Difficulty', intro: 'Pick a champion: each guess shows what matches the secret champion.',
        correct: 'Match', partial: 'Partial', wrong: 'Different', higher: 'higher', lower: 'lower', guesses: 'Your guesses',
        whichSplash: 'Whose splash art is this?', whichAbility: 'Whose ability is this?', abilityName: 'Ability name', key: 'Key',
        title: 'Title', firstLetter: 'First letter', results: '{n} result(s)',
    },
} satisfies Record<Language, Record<string, string>>

const VERDICT_STYLES: Record<Verdict, string> = {
    correct: 'bg-green-600 text-white',
    partial: 'bg-amber-400 text-zinc-900',
    wrong: 'bg-red-600 text-white',
    higher: 'bg-red-600 text-white',
    lower: 'bg-red-600 text-white',
}
const GRID = 'grid grid-cols-[4.5rem_repeat(7,minmax(0,1fr))] gap-1'

const compareNumber = (guess: number, target: number): Verdict => (guess === target ? 'correct' : target > guess ? 'higher' : 'lower')
const compareSets = (guess: string[], target: string[]): Verdict =>
    guess.length === target.length && guess.every((value) => target.includes(value)) ? 'correct' : guess.some((value) => target.includes(value)) ? 'partial' : 'wrong'

function compareChampions(guess: LolChampion, target: LolChampion, language: Language) {
    return [
        { verdict: compareSets(guess.g, target.g), value: guess.g.map((role) => roleLabel(role, language)).join(' / ') },
        { verdict: guess.p[0] === target.p[0] ? 'correct' : 'wrong', value: pickLang(guess.p, language) || '—' },
        { verdict: rangeLabel(guess, language) === rangeLabel(target, language) ? 'correct' : 'wrong', value: rangeLabel(guess, language) },
        { verdict: compareNumber(guess.r, target.r), value: String(guess.r) },
        { verdict: compareNumber(guess.hp, target.hp), value: String(guess.hp) },
        { verdict: compareNumber(guess.ms, target.ms), value: String(guess.ms) },
        { verdict: compareNumber(guess.f.difficulty, target.f.difficulty), value: `${guess.f.difficulty}/10` },
    ] satisfies { verdict: Verdict; value: string }[]
}

export default function ChampionSession(session: SessionProps) {
    const state = useLolData()
    if (!state) return <SessionLoading />
    if (state.status === 'error') return <SessionError canRetry={false} onRetry={session.onNextRound} />
    return <ChampionRound session={session} data={state.data} />
}

function ChampionRound({ session, data }: { session: SessionProps; data: LolData }) {
    const { mode, variant, dateKey, series } = session
    const { language } = useLanguage()
    const { target, solution, guesses, wrongCount, attempts, status, stats, reward, guess, giveUp } = useChallenge(mode, variant, dateKey, series)
    const pool = LOL_POOL.flatMap((key) => data.byKey.get(key) ?? [])
    const champion = data.byKey.get(solution[0])
    if (!champion) return <SessionError canRetry={variant === 'random' && !series} onRetry={session.onNextRound} />

    const revealed = status !== 'playing'
    const guessed = guesses.flatMap((key) => data.byKey.get(key) ?? [])
    const clue = mode === 'lol-splash'
        ? <SplashClue champion={champion} seed={`${dateKey}:${target}`} revealed={revealed} wrongCount={wrongCount} />
        : mode === 'lol-habilidade'
            ? <AbilityClue data={data} champion={champion} seed={`${dateKey}:${target}`} revealed={revealed} wrongCount={wrongCount} />
            : undefined

    return (
        <SessionLayout
            clue={clue}
            sticky={!revealed}
            aside={status === 'playing' ? (
                <>
                    <ChampionGuessInput data={data} champions={pool} guessed={guesses} onGuess={guess} />
                    <PlayBar count={guesses.length} canGiveUp={variant === 'random' || Boolean(series)} onGiveUp={giveUp} />
                </>
            ) : (
                <SessionEnd
                    session={session}
                    status={status}
                    answer={{
                        ids: [champion.k],
                        label: championName(champion, language),
                        artwork: <Image src={championIcon(data.version, champion)} alt="" width={120} height={120} unoptimized className="mx-auto size-32 rounded-full border-4 border-[#c8aa6e]" />,
                    }}
                    attempts={attempts}
                    stats={stats}
                    reward={reward}
                />
            )}
        >
            {mode === 'lol-atributos' ? (
                <ChampionAttributeGrid data={data} guesses={guessed} target={champion} />
            ) : (
                <>
                    <ChampionHints mode={mode} champion={champion} wrongCount={wrongCount} revealed={revealed} />
                    <ChampionGuessList data={data} guesses={guessed} target={champion} />
                </>
            )}
        </SessionLayout>
    )
}

function ChampionGuessInput({ data, champions, guessed, onGuess }: { data: LolData; champions: LolChampion[]; guessed: number[]; onGuess: (key: number) => void }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [query, setQuery] = useState('')
    const [role, setRole] = useState('')
    const [active, setActive] = useState(0)
    const id = useId()
    const isOpen = query.trim() !== '' || role !== ''
    const base = query.trim() ? searchChampions(champions, query) : [...champions].sort((a, b) => championName(a, language).localeCompare(championName(b, language)))
    const options = isOpen ? base.filter((champion) => !guessed.includes(champion.k) && (!role || champion.g.includes(role))) : []
    const activeIndex = Math.min(active, options.length - 1)

    const select = (champion: LolChampion) => {
        onGuess(champion.k)
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
                className="w-full rounded-2xl border-4 border-[#785a28] bg-white px-4 py-2.5 text-lg font-bold shadow outline-none placeholder:font-normal placeholder:text-zinc-400 focus:border-[#c8aa6e] dark:bg-zinc-900"
            />
            <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-black text-zinc-500">{L.role}:</span>
                {['', ...LOL_ROLES].map((value) => (
                    <button
                        key={value || 'all'}
                        type="button"
                        aria-pressed={role === value}
                        onClick={() => { setRole(value); setActive(0) }}
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${role === value ? 'bg-[#c8aa6e] text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800'}`}
                    >
                        {value ? roleLabel(value, language) : L.all}
                    </button>
                ))}
            </div>
            <AnimatePresence initial={false}>
                {isOpen ? (
                    <motion.div key="results" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <p className="mb-1 px-1 text-xs font-bold text-zinc-500" aria-live="polite">{L.results.replace('{n}', String(options.length))}</p>
                        <ul id={`${id}-list`} role="listbox" className="max-h-[50vh] overflow-y-auto overscroll-contain rounded-2xl bg-zinc-50 p-1.5 ring-1 ring-zinc-200 dark:bg-zinc-950/60 dark:ring-zinc-700">
                            {options.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-zinc-500">{L.noResults}</li>
                            ) : options.map((champion, index) => (
                                <li
                                    key={champion.k}
                                    role="option"
                                    aria-selected={index === activeIndex}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onMouseEnter={() => setActive(index)}
                                    onClick={() => select(champion)}
                                    className={`flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 font-semibold ${index === activeIndex ? 'bg-[#0a3a4a] text-white' : ''}`}
                                >
                                    <Image src={championIcon(data.version, champion)} alt="" width={32} height={32} unoptimized loading="lazy" className="size-8 rounded-full" />
                                    <span className="flex-1 truncate">{championName(champion, language)}</span>
                                    <span className="text-xs opacity-70">{champion.g.map((value) => roleLabel(value, language)).join(' / ')}</span>
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

function ChampionAttributeGrid({ data, guesses, target }: { data: LolData; guesses: LolChampion[]; target: LolChampion }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const columns = [L.roles, L.resource, L.rangeType, L.range, L.hp, L.speed, L.difficulty]
    if (guesses.length === 0) return <p className={`${CARD} p-5 text-center text-sm font-semibold`}>{L.intro}</p>

    return (
        <div className={`${CARD} p-3`}>
            <div className="overflow-x-auto pb-1 lg:overflow-visible">
                <div role="table" className="flex min-w-[40rem] flex-col gap-1.5 lg:min-w-0">
                    <div role="row" className={`${GRID} text-center text-[10px] leading-tight font-black uppercase text-zinc-500`}>
                        <span role="columnheader">{L.champion}</span>
                        {columns.map((column) => <span key={column} role="columnheader">{column}</span>)}
                    </div>
                    {[...guesses].reverse().map((guess) => {
                        const cells = compareChampions(guess, target, language)
                        return (
                            <div key={guess.k} role="row" className={GRID}>
                                <motion.span role="cell" initial={{ scale: 0 }} animate={{ scale: 1 }} title={championName(guess, language)} className={`relative h-14 overflow-hidden rounded-xl ${guess.k === target.k ? 'ring-4 ring-green-600' : ''}`}>
                                    <Image src={championIcon(data.version, guess)} alt="" fill unoptimized sizes="4.5rem" className="object-cover" />
                                    <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 text-[9px] leading-tight font-bold text-white line-clamp-1">{championName(guess, language)}</span>
                                </motion.span>
                                {cells.map(({ verdict, value }, index) => (
                                    <motion.span
                                        key={columns[index]}
                                        role="cell"
                                        initial={{ rotateY: 90, opacity: 0 }}
                                        animate={{ rotateY: 0, opacity: 1 }}
                                        transition={{ delay: (index + 1) * 0.1, duration: 0.35 }}
                                        className={`flex h-14 min-w-0 flex-col items-center justify-center rounded-xl px-0.5 text-center text-[11px] font-bold leading-tight break-words shadow ${VERDICT_STYLES[verdict]}`}
                                    >
                                        <span className="line-clamp-3">{value}</span>
                                        {(verdict === 'higher' || verdict === 'lower') && (
                                            <span className="text-base leading-none">
                                                <span aria-hidden="true">{verdict === 'higher' ? '↑' : '↓'}</span>
                                                <span className="sr-only">{L[verdict]}</span>
                                            </span>
                                        )}
                                    </motion.span>
                                ))}
                            </div>
                        )
                    })}
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

function ChampionGuessList({ data, guesses, target }: { data: LolData; guesses: LolChampion[]; target: LolChampion }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    if (guesses.length === 0) return null
    return (
        <section className={`${CARD} p-4`}>
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-zinc-500">{L.guesses}</h3>
            <ul className="flex flex-col gap-2">
                {[...guesses].reverse().map((guess) => {
                    const [roles, resource] = compareChampions(guess, target, language)
                    return (
                        <motion.li key={guess.k} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-2xl bg-[#091428] px-3 py-2 text-white">
                            <Image src={championIcon(data.version, guess)} alt="" width={32} height={32} unoptimized className="size-8 rounded-full" />
                            <span className="flex-1 truncate font-black">{championName(guess, language)}</span>
                            <span className={`rounded-lg px-2 py-0.5 text-xs font-black ${VERDICT_STYLES[roles.verdict]}`}>{roles.value}</span>
                            <span className={`rounded-lg px-2 py-0.5 text-xs font-black ${VERDICT_STYLES[resource.verdict]}`}>{resource.value}</span>
                        </motion.li>
                    )
                })}
            </ul>
        </section>
    )
}

const MAX_ZOOM = 5
const ZOOM_STEPS = 8
const MAX_BLUR = 6

function ClueFrame({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} p-6`}>
            <p className="mb-4 text-center text-sm font-black uppercase tracking-[0.2em] text-[#785a28] dark:text-[#c8aa6e]">{title}</p>
            {children}
        </motion.div>
    )
}

function SplashClue({ champion, seed, revealed, wrongCount }: { champion: LolChampion; seed: string; revealed: boolean; wrongCount: number }) {
    const { language } = useLanguage()
    const progress = Math.max(0, 1 - wrongCount / ZOOM_STEPS)
    const scale = revealed ? 1 : 1 + (MAX_ZOOM - 1) * progress
    const blur = revealed ? 0 : MAX_BLUR * progress
    const skins = [0, ...champion.sk]
    const skin = skins[Math.floor(seededFraction(`${seed}:skin`) * skins.length)]
    const origin = `${30 + seededFraction(`${seed}:x`) * 40}% ${25 + seededFraction(`${seed}:y`) * 40}%`
    return (
        <ClueFrame title={LABELS[language].whichSplash}>
            <div className="relative mx-auto aspect-[1215/717] w-full max-w-2xl overflow-hidden rounded-2xl border-4 border-[#785a28] bg-zinc-900">
                <motion.div initial={false} animate={{ scale, filter: `blur(${blur}px)` }} transition={{ type: 'spring', stiffness: 90, damping: 18 }} style={{ transformOrigin: origin }} className="absolute inset-0">
                    <Image src={championSplash(champion, skin)} alt="" fill unoptimized sizes="42rem" className="object-cover" />
                </motion.div>
            </div>
        </ClueFrame>
    )
}

function AbilityClue({ data, champion, seed, revealed, wrongCount }: { data: LolData; champion: LolChampion; seed: string; revealed: boolean; wrongCount: number }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const spell = champion.s[Math.floor(seededFraction(`${seed}:spell`) * champion.s.length)]
    const blur = revealed ? 0 : Math.max(0, 4 - wrongCount)
    return (
        <ClueFrame title={L.whichAbility}>
            <div className="flex flex-col items-center gap-3">
                <motion.div initial={false} animate={{ filter: `blur(${blur}px) grayscale(${revealed ? 0 : Math.max(0, 1 - wrongCount / 3)})` }} className="overflow-hidden rounded-2xl border-4 border-[#785a28]">
                    <Image src={spellIcon(data.version, spell.img)} alt="" width={128} height={128} unoptimized className="size-32" />
                </motion.div>
                {(revealed || wrongCount >= 4) && <p className="text-lg font-black">{pickLang(spell.n, language)}</p>}
                {(revealed || wrongCount >= 2) && <p className="text-sm font-bold text-zinc-500">{L.key}: {spell.k}</p>}
            </div>
        </ClueFrame>
    )
}

function ChampionHints({ mode, champion, wrongCount, revealed }: { mode: ChallengeMode; champion: LolChampion; wrongCount: number; revealed: boolean }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const name = championName(champion, language)
    const base = [
        { label: L.roles, value: champion.g.map((role) => roleLabel(role, language)).join(' / ') },
        { label: L.rangeType, value: rangeLabel(champion, language) },
        { label: L.resource, value: pickLang(champion.p, language) || '—' },
        { label: L.title, value: pickLang(champion.t, language) },
    ]
    const ordered = mode === 'lol-habilidade' ? base : [base[0], base[2], base[1], base[3]]
    const hints: Hint[] = [
        ...ordered.map((hint, index) => ({ ...hint, at: (index + 1) * 2 })),
        { at: 10, label: L.firstLetter, value: name[0] },
    ]
    return <HintBoard hints={hints} wrongCount={wrongCount} revealed={revealed} />
}
