'use client'

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import type { Language } from "../../i18n/translations";
import { RARITY_COLORS, cardName, cardPath, hsLabel, setName, type HsData } from "../../lib/hearthstone";
import { EPIC_PITY, LEGENDARY_PITY, newSession, openPack, packDust, packPool, packableSets, type PackCard, type PackSession } from "../../lib/hsPacks";
import { HsCardImage } from "./cardImage";
import { useHsData } from "./data";

const LABELS = {
    pt: {
        title: 'Simulador de pacotes', intro: 'Escolha uma coleção, abra pacotes e veja o que sairia, com as mesmas garantias de raridade do jogo.',
        set: 'Coleção', open: 'Abrir pacote', open10: 'Abrir 10', reveal: 'Revelar todas', reset: 'Recomeçar',
        click: 'Clique nas cartas para virar', packs: 'Pacotes abertos', legendaries: 'Lendárias', golden: 'Douradas', dust: 'Pó das repetidas',
        thisPack: 'Pó deste pacote se desencantar tudo: {n}', epicIn: 'Épica garantida em até {n} pacote(s)', legendaryIn: 'Lendária garantida em até {n} pacote(s)',
        history: 'Lendárias abertas', duplicate: 'repetida', goldenTag: 'dourada', loading: 'Carregando cartas…', error: 'Não foi possível carregar as cartas.',
        howTo: 'Como funcionam os pacotes',
        howToText: [
            'Cada pacote tem 5 cartas e pelo menos uma rara ou melhor. As chances aproximadas por carta são de 72% para comum, 23% para rara, 4% para épica e 1% para lendária, com uma pequena chance de a carta vir dourada.',
            'O jogo tem garantias: uma épica aparece em no máximo 10 pacotes, uma lendária em no máximo 40, e a primeira lendária de cada coleção vem nos primeiros 10 pacotes. Também não dá lendária repetida antes de completar todas da coleção, e o mesmo vale para as cópias das outras raridades.',
            'O simulador segue essas regras com probabilidades aproximadas, só para diversão: nada aqui afeta a sua conta no jogo. Use para ter ideia de quantos pacotes precisaria para montar um deck e compare com o custo de criar as cartas com pó.',
        ],
        dustGuide: 'Guia de Pó Arcano',
    },
    en: {
        title: 'Pack simulator', intro: 'Pick a set, open packs and see what you would get, with the same rarity guarantees as the game.',
        set: 'Set', open: 'Open pack', open10: 'Open 10', reveal: 'Reveal all', reset: 'Start over',
        click: 'Click the cards to flip them', packs: 'Packs opened', legendaries: 'Legendaries', golden: 'Golden', dust: 'Duplicate dust',
        thisPack: 'Dust from this pack if you disenchant it all: {n}', epicIn: 'Epic guaranteed within {n} pack(s)', legendaryIn: 'Legendary guaranteed within {n} pack(s)',
        history: 'Legendaries opened', duplicate: 'duplicate', goldenTag: 'golden', loading: 'Loading cards…', error: 'Could not load the cards.',
        howTo: 'How packs work',
        howToText: [
            'Each pack has 5 cards and at least one rare or better. Approximate odds per card are 72% common, 23% rare, 4% epic and 1% legendary, with a small chance for the card to be golden.',
            'The game has guarantees: an epic shows up within 10 packs, a legendary within 40, and each set’s first legendary comes within the first 10 packs. You also won’t get a duplicate legendary before owning all of the set’s legendaries, and the same applies to copies of the other rarities.',
            'The simulator follows these rules with approximate odds, just for fun: nothing here affects your game account. Use it to get a sense of how many packs you would need for a deck and compare that with crafting the cards with dust.',
        ],
        dustGuide: 'Arcane Dust guide',
    },
} satisfies Record<Language, Record<string, string | string[]>>

const panel = 'flex flex-col gap-3 rounded-3xl border-2 border-amber-500/30 bg-[#2b1a10]/90 p-6 text-amber-50 shadow-xl'
const button = 'rounded-full px-5 py-2 font-black transition disabled:opacity-40'

function Stat({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-2xl bg-black/30 p-3 text-center">
            <p className="text-xs font-bold uppercase text-amber-200/70">{label}</p>
            <p className="text-2xl font-black">{value}</p>
        </div>
    )
}

export default function PackSimulator() {
    const state = useHsData()
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <>
            <header className="flex flex-col gap-2">
                <Link href="/hearthstone" className="w-fit text-sm font-bold text-amber-300 underline-offset-2 hover:underline">← Hearthstone</Link>
                <h1 className="text-4xl font-black tracking-tight text-amber-100">{L.title}</h1>
                <p className="text-amber-100/75">{L.intro}</p>
            </header>
            {!state && <p className="text-center text-amber-100/70">{L.loading}</p>}
            {state?.status === 'error' && <p role="alert" className="text-center font-bold text-red-300">{L.error}</p>}
            {state?.status === 'success' && <Simulator data={state.data} />}
            <HowPacksWork />
        </>
    )
}

function Simulator({ data }: { data: HsData }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const sets = [...packableSets(data)].reverse()
    const [setIndex, setSetIndex] = useState(() => (sets.find(({ set }) => set.standard) ?? sets[0]).index)
    const [session, setSession] = useState<PackSession>(newSession)
    const [pack, setPack] = useState<PackCard[]>([])
    const [flipped, setFlipped] = useState<boolean[]>([])
    const [legendaries, setLegendaries] = useState<PackCard[]>([])
    const pool = packPool(data, setIndex)

    const open = (count: number) => {
        let current = session
        let last: PackCard[] = []
        const found: PackCard[] = []
        for (let index = 0; index < count; index++) {
            const result = openPack(pool, current)
            current = result.session
            last = result.cards
            found.push(...result.cards.filter(({ card }) => card.rarity === 'LEGENDARY'))
        }
        setSession(current)
        setPack(last)
        setFlipped(last.map(() => count > 1))
        setLegendaries((list) => [...found.reverse(), ...list])
    }

    const reset = (index = setIndex) => {
        setSetIndex(index)
        setSession(newSession())
        setPack([])
        setFlipped([])
        setLegendaries([])
    }

    const epicLeft = EPIC_PITY - session.sinceEpic
    const legendaryLeft = session.legendaries === 0 ? 10 - session.packs : LEGENDARY_PITY - session.sinceLegendary

    return (
        <div className="flex flex-col gap-6">
            <section className={panel}>
                <div className="flex flex-wrap items-end gap-3">
                    <label className="flex flex-col gap-1 text-sm font-bold">
                        {L.set}
                        <select
                            value={setIndex}
                            onChange={(event) => reset(Number(event.target.value))}
                            className="rounded-xl border-2 border-amber-700/60 bg-black/30 px-3 py-2 text-sm font-bold text-amber-50 [&>option]:bg-[#2b1a10]"
                        >
                            {sets.map(({ set, index }) => <option key={set.id} value={index}>{setName(set, language)} ({set.year})</option>)}
                        </select>
                    </label>
                    <button type="button" onClick={() => open(1)} className={`${button} bg-amber-500 text-amber-950 hover:bg-amber-400`}>{L.open}</button>
                    <button type="button" onClick={() => open(10)} className={`${button} bg-amber-700 text-amber-50 hover:bg-amber-600`}>{L.open10}</button>
                    {pack.length > 0 && flipped.some((value) => !value) && (
                        <button type="button" onClick={() => setFlipped(pack.map(() => true))} className={`${button} bg-black/40 hover:bg-black/60`}>{L.reveal}</button>
                    )}
                    {session.packs > 0 && <button type="button" onClick={() => reset()} className={`${button} border border-amber-500/50`}>{L.reset}</button>}
                </div>

                {pack.length > 0 && (
                    <>
                        <p className="text-sm text-amber-200/70">{L.click}</p>
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            <AnimatePresence mode="popLayout">
                                {pack.map((entry, index) => (
                                    <motion.li
                                        key={`${session.packs}-${index}`}
                                        initial={{ opacity: 0, y: 40, rotate: -6 }}
                                        animate={{ opacity: 1, y: 0, rotate: 0, transition: { delay: index * 0.08 } }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setFlipped((current) => current.map((value, position) => (position === index ? true : value)))}
                                            className="w-full perspective-[1000px]"
                                            aria-label={flipped[index] ? cardName(entry.card, language) : `${L.click} (${index + 1})`}
                                        >
                                            <motion.div animate={{ rotateY: flipped[index] ? 0 : 180 }} transition={{ duration: 0.5 }} className="relative transform-3d">
                                                <div className="backface-hidden">
                                                    <HsCardImage card={entry.card} eager className={entry.golden ? 'drop-shadow-[0_0_18px_rgba(250,204,21,0.9)]' : 'drop-shadow-xl'} />
                                                </div>
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center rounded-2xl border-4 backface-hidden transform-[rotateY(180deg)]"
                                                    style={{ borderColor: RARITY_COLORS[entry.card.rarity], background: 'radial-gradient(circle, #5b3a1c, #1c1008)', boxShadow: `0 0 24px ${RARITY_COLORS[entry.card.rarity]}` }}
                                                >
                                                    <span className="text-5xl">🃏</span>
                                                </div>
                                            </motion.div>
                                        </button>
                                        {flipped[index] && (
                                            <p className="text-center text-xs font-bold" style={{ color: RARITY_COLORS[entry.card.rarity] }}>
                                                {hsLabel(entry.card.rarity, language)}
                                                {entry.golden && ` · ${L.goldenTag}`}
                                                {entry.duplicate && ` · ${L.duplicate}`}
                                            </p>
                                        )}
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                        <p className="text-sm text-amber-200/80">{L.thisPack.replace('{n}', String(packDust(pack)))}</p>
                    </>
                )}
            </section>

            {session.packs > 0 && (
                <section className={panel}>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Stat label={L.packs} value={session.packs} />
                        <Stat label={L.legendaries} value={session.byRarity.LEGENDARY} />
                        <Stat label={L.golden} value={session.golden} />
                        <Stat label={L.dust} value={session.duplicateDust} />
                    </div>
                    <ul className="flex flex-wrap gap-2 text-xs font-black">
                        {(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const).map((rarity) => (
                            <li key={rarity} className="rounded-full px-3 py-1 text-zinc-900" style={{ backgroundColor: RARITY_COLORS[rarity] }}>
                                {hsLabel(rarity, language)}: {session.byRarity[rarity]}
                            </li>
                        ))}
                    </ul>
                    <p className="text-sm text-amber-200/80">{L.epicIn.replace('{n}', String(epicLeft))} · {L.legendaryIn.replace('{n}', String(Math.max(1, legendaryLeft)))}</p>
                    {legendaries.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <h2 className="font-black text-amber-200">{L.history}</h2>
                            <ul className="flex flex-wrap gap-2 text-sm">
                                {legendaries.map((entry, index) => (
                                    <li key={`${entry.card.dbfId}-${index}`}>
                                        <Link href={cardPath(entry.card)} className="block rounded-full bg-black/30 px-3 py-1 font-bold text-amber-300 hover:bg-black/50">
                                            {cardName(entry.card, language)}{entry.golden ? ' ✨' : ''}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            )}
        </div>
    )
}

function HowPacksWork() {
    const { language } = useLanguage()
    const L = LABELS[language]
    return (
        <section className={panel}>
            <h2 className="text-xl font-black text-amber-200">{L.howTo}</h2>
            {L.howToText.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <Link href="/guias/po-arcano-e-deck-barato" className="self-start font-bold text-amber-300 underline underline-offset-2 hover:text-amber-100">{L.dustGuide} →</Link>
        </section>
    )
}
