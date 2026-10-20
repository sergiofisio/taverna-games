'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLanguage } from "../../context/languageContext";
import { championName, championPath, championSplash, pickLang, rangeLabel, roleLabel, spellIcon, type LolData } from "../../lib/lol";

export default function ChampionModal({ data, championKey, onClose }: { data: LolData | null; championKey: number | null; onClose: () => void }) {
    const { t, language } = useLanguage()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const champion = championKey !== null ? data?.byKey.get(championKey) : undefined

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (champion && !dialog.open) dialog.showModal()
        if (!champion && dialog.open) dialog.close()
    }, [champion])

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close() }}
            aria-label="League of Legends"
            className="m-auto w-[96vw] max-w-3xl overflow-hidden rounded-3xl border-2 border-[#c8aa6e] bg-[#091428] p-0 text-slate-100 backdrop:bg-black/80"
        >
            {champion && data && (
                <div className="flex flex-col">
                    <div className="relative aspect-[1215/717] w-full">
                        <Image src={championSplash(champion)} alt={championName(champion, language)} fill sizes="768px" unoptimized className="object-cover" />
                        <div className="absolute inset-0 bg-linear-to-t from-[#091428] via-transparent" />
                        <button type="button" onClick={() => dialogRef.current?.close()} aria-label={t('close')} className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-xl font-black">×</button>
                    </div>
                    <div className="flex flex-col gap-3 p-6">
                        <div>
                            <h2 className="text-3xl font-black text-[#f0e6d2]">{championName(champion, language)}</h2>
                            <p className="text-sm text-[#c8aa6e] first-letter:uppercase">{pickLang(champion.t, language)}</p>
                        </div>
                        <p className="text-sm text-slate-300">
                            {champion.g.map((role) => roleLabel(role, language)).join(' / ')} · {pickLang(champion.p, language)} · {rangeLabel(champion, language)}
                        </p>
                        <ul className="flex flex-wrap gap-2">
                            {champion.s.map((spell) => (
                                <li key={spell.k} title={pickLang(spell.n, language)} className="flex items-center gap-2 rounded-xl bg-black/30 px-2 py-1 text-xs font-bold">
                                    <Image src={spellIcon(data.version, spell.img)} alt="" width={28} height={28} unoptimized className="size-7 rounded" />
                                    {spell.k} · {pickLang(spell.n, language)}
                                </li>
                            ))}
                        </ul>
                        <Link href={championPath(champion)} className="self-start font-bold text-[#c8aa6e] underline underline-offset-2 hover:text-[#f0e6d2]">
                            {t('viewFullPage')} →
                        </Link>
                    </div>
                </div>
            )}
        </dialog>
    )
}
