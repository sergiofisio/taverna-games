'use client'

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../../context/languageContext";
import type { Language } from "../../i18n/translations";
import { CLASS_COLORS, hsLabel } from "../../lib/hearthstone";

export interface TierDeck {
    name: string
    cls: string
    code: string
    dust: number
    note: [string, string]
}

export interface TierListData {
    updated: string
    format: string
    note: [string, string]
    tiers: { tier: string; decks: TierDeck[] }[]
}

const LABELS = {
    pt: {
        title: 'Tier list de decks do Hearthstone', intro: 'Os decks mais fortes do formato {format} nesta semana, separados por nível. Clique no deck para abrir no montador ou copie o código para importar no jogo.',
        updated: 'Atualizada em {date}', copy: 'Copiar código', copied: 'Copiado!', open: 'Abrir no montador', dust: '{n} de pó',
        standard: 'Padrão', wild: 'Livre', how: 'Como ler a tier list',
        howText: [
            'O tier S reúne os decks que mais vencem e que definem o meta; o tier A tem decks muito fortes e consistentes; o B, opções boas que dependem mais do confronto; o C, decks viáveis, mas que pedem mais habilidade ou sorte.',
            'A tier list é um retrato da semana: o meta muda com cada atualização de balanceamento e com cada expansão. Use como ponto de partida e ajuste o deck à sua coleção com o montador, que mostra quanto pó falta.',
        ],
    },
    en: {
        title: 'Hearthstone deck tier list', intro: 'This week’s strongest {format} decks, grouped by tier. Click a deck to open it in the builder or copy the code to import it into the game.',
        updated: 'Updated on {date}', copy: 'Copy code', copied: 'Copied!', open: 'Open in builder', dust: '{n} dust',
        standard: 'Standard', wild: 'Wild', how: 'How to read the tier list',
        howText: [
            'Tier S holds the decks that win the most and define the meta; tier A has very strong, consistent decks; B is good options that depend more on matchups; C is viable decks that ask for more skill or luck.',
            'The tier list is a snapshot of the week: the meta shifts with each balance patch and each expansion. Use it as a starting point and fit the deck to your collection with the builder, which shows how much dust you are missing.',
        ],
    },
} satisfies Record<Language, Record<string, string | string[]>>

const TIER_COLORS: Record<string, string> = { S: '#ef4444', A: '#f59e0b', B: '#22c55e', C: '#3b82f6', D: '#a1a1aa' }
const panel = 'flex flex-col gap-3 rounded-3xl border-2 border-amber-500/30 bg-[#2b1a10]/90 p-6 text-amber-50 shadow-xl'

function CopyButton({ code }: { code: string }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const [copied, setCopied] = useState(false)
    return (
        <button
            type="button"
            onClick={async () => {
                await navigator.clipboard.writeText(code)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
            }}
            className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold hover:bg-black/60"
        >
            {copied ? `✓ ${L.copied}` : L.copy}
        </button>
    )
}

export default function TierListView({ data }: { data: TierListData }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const pick = (pair: [string, string]) => (language === 'en' ? pair[1] : pair[0])
    const date = new Date(`${data.updated}T12:00:00`).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'long' })

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-2">
                <Link href="/hearthstone" className="w-fit text-sm font-bold text-amber-300 underline-offset-2 hover:underline">← Hearthstone</Link>
                <h1 className="text-4xl font-black tracking-tight text-amber-100">{L.title}</h1>
                <p className="text-amber-100/75">{L.intro.replace('{format}', data.format === 'wild' ? L.wild : L.standard)}</p>
                <p className="text-xs text-amber-100/50">{L.updated.replace('{date}', date)}</p>
                {pick(data.note) && <p className="rounded-2xl bg-black/30 p-3 text-sm">{pick(data.note)}</p>}
            </header>

            {data.tiers.map(({ tier, decks }) => (
                <section key={tier} className={`${panel} sm:flex-row sm:items-start`}>
                    <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-zinc-950" style={{ backgroundColor: TIER_COLORS[tier] ?? '#a1a1aa' }}>{tier}</span>
                    <ul className="grid flex-1 gap-3 md:grid-cols-2">
                        {decks.map((deck) => (
                            <li key={deck.name} className="flex flex-col gap-2 rounded-2xl bg-black/25 p-3" style={{ borderLeft: `6px solid ${CLASS_COLORS[deck.cls] ?? CLASS_COLORS.NEUTRAL}` }}>
                                <div>
                                    <Link href={`/hearthstone/decks?deck=${encodeURIComponent(deck.code)}`} className="font-black text-amber-100 hover:underline">{deck.name}</Link>
                                    <p className="text-xs font-bold text-amber-200/70">{hsLabel(deck.cls, language)} · {L.dust.replace('{n}', deck.dust.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US'))}</p>
                                </div>
                                {pick(deck.note) && <p className="text-sm text-amber-50/90">{pick(deck.note)}</p>}
                                <div className="flex flex-wrap gap-2">
                                    <CopyButton code={deck.code} />
                                    <Link href={`/hearthstone/decks?deck=${encodeURIComponent(deck.code)}`} className="rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-amber-950 hover:bg-amber-400">{L.open}</Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}

            <section className={panel}>
                <h2 className="text-xl font-black text-amber-200">{L.how}</h2>
                {L.howText.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
        </div>
    )
}
