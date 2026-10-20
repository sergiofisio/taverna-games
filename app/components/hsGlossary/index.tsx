'use client'

import Link from "next/link";
import { useLanguage } from "../../context/languageContext";
import { MECHANICS, MECHANIC_TIPS } from "../../lib/cardText";
import type { Language } from "../../i18n/translations";

const LABELS = {
    pt: { title: 'Palavras-chave de A a Z', library: 'Ver todas as cartas na biblioteca' },
    en: { title: 'Keywords from A to Z', library: 'Browse every card in the library' },
} satisfies Record<Language, Record<string, string>>

export default function HsGlossary() {
    const { language } = useLanguage()
    const L = LABELS[language]
    const entries = Object.entries(MECHANICS)
        .map(([id, value]) => ({ id, name: value[language][0], text: value[language][1], tip: MECHANIC_TIPS[id]?.[language] }))
        .sort((a, b) => a.name.localeCompare(b.name, language))

    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-black">{L.title}</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
                {entries.map((entry) => (
                    <div key={entry.id} id={entry.id.toLowerCase()} className="scroll-mt-24 rounded-2xl bg-white p-4 shadow dark:bg-zinc-900">
                        <dt className="text-lg font-black">{entry.name}</dt>
                        <dd className="text-zinc-700 dark:text-zinc-300">{entry.text}</dd>
                        {entry.tip && <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{entry.tip}</dd>}
                    </div>
                ))}
            </dl>
            <Link href="/hearthstone/cartas" className="w-fit font-bold text-amber-700 underline-offset-2 hover:underline dark:text-amber-400">{L.library} →</Link>
        </section>
    )
}
