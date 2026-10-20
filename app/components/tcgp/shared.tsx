'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { loadTcgpData, pickPair, rarityInfo, rarityLabel, tcgpCardPath, tcgpImage, tcgpKindLabel, tcgpName, tcgpTypeLabel, TCGP_TYPE_COLORS, type TcgpCard, type TcgpData } from "../../lib/tcgp";

export const useTcgpData = () => useAsyncData('tcgp-cards', loadTcgpData)

export function PocketBackdrop({ children, className = 'text-slate-900 dark:text-slate-100' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`relative isolate flex min-w-0 flex-1 flex-col bg-sky-50 dark:bg-slate-950 ${className}`}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(56,189,248,0.35),transparent_45%),radial-gradient(circle_at_90%_80%,rgba(129,140,248,0.3),transparent_45%)]" />
            {children}
        </div>
    )
}

export function PocketEmblem({ className = 'size-9' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <rect x="5" y="2.5" width="14" height="19" rx="2.5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="4.2" fill="#fff" stroke="#0369a1" strokeWidth="1.2" />
            <path d="M7.8 12h8.4" stroke="#0369a1" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="1.4" fill="#ef4444" stroke="#0369a1" strokeWidth="0.8" />
        </svg>
    )
}

export function TcgpCardImage({ card, className = '', eager = false }: { card: TcgpCard; className?: string; eager?: boolean }) {
    const { language } = useLanguage()
    const src = tcgpImage(card, language)
    if (!src) {
        return (
            <span className={`flex aspect-367/512 w-full items-center justify-center rounded-xl bg-slate-200 p-2 text-center text-xs font-bold text-slate-500 dark:bg-slate-800 ${className}`}>
                {tcgpName(card, language)}
            </span>
        )
    }
    return <Image src={src} alt={tcgpName(card, language)} width={367} height={512} unoptimized loading={eager ? 'eager' : 'lazy'} className={`aspect-367/512 h-auto w-full rounded-xl ${className}`} />
}

export function TypeIcon({ type, className = 'size-5' }: { type: string; className?: string }) {
    const { language } = useLanguage()
    return (
        <span title={tcgpTypeLabel(type, language)} className={`inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white shadow ring-1 ring-black/20 ${className}`} style={{ backgroundColor: TCGP_TYPE_COLORS[type] ?? '#999' }}>
            {tcgpTypeLabel(type, language).charAt(0)}
        </span>
    )
}

export function RarityBadge({ rarity }: { rarity: string }) {
    const { language } = useLanguage()
    const info = rarityInfo(rarity)
    return (
        <span title={rarityLabel(rarity, language)} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-black text-slate-900" style={{ backgroundColor: info.color }}>
            {info.symbol} <span className="font-bold">{rarityLabel(rarity, language)}</span>
        </span>
    )
}

export function CardFacts({ card, data }: { card: TcgpCard; data: TcgpData }) {
    const { language } = useLanguage()
    const set = data.setById.get(card.s)
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                {card.ty.map((type) => <TypeIcon key={type} type={type} />)}
                <span className="text-sm font-bold">{tcgpKindLabel(card, language)}</span>
                {card.hp && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-black text-white">{card.hp} HP</span>}
                <RarityBadge rarity={card.r} />
            </div>
            {card.ab.map((ability) => (
                <div key={ability.n[1]} className="rounded-xl bg-red-50 p-3 text-sm dark:bg-red-950/40">
                    <p className="font-black text-red-700 dark:text-red-300">{language === 'en' ? 'Ability' : 'Habilidade'}: {pickPair(ability.n, language)}</p>
                    <p>{pickPair(ability.e, language)}</p>
                </div>
            ))}
            {card.at.map((attack) => (
                <div key={attack.n[1]} className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
                    <p className="flex items-center gap-2 font-black">
                        <span className="flex gap-0.5">{attack.cost.map((type, index) => <TypeIcon key={index} type={type} className="size-4" />)}</span>
                        <span className="flex-1">{pickPair(attack.n, language)}</span>
                        {attack.dmg && <span className="text-lg">{attack.dmg}</span>}
                    </p>
                    {attack.e && <p className="mt-1 text-slate-600 dark:text-slate-300">{pickPair(attack.e, language)}</p>}
                </div>
            ))}
            {card.ef && <p className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{pickPair(card.ef, language)}</p>}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {card.wk && <><dt className="font-bold text-slate-500">{language === 'en' ? 'Weakness' : 'Fraqueza'}</dt><dd>{tcgpTypeLabel(card.wk, language)} +20</dd></>}
                {card.rt !== null && <><dt className="font-bold text-slate-500">{language === 'en' ? 'Retreat' : 'Recuo'}</dt><dd>{card.rt}</dd></>}
                {set && <><dt className="font-bold text-slate-500">{language === 'en' ? 'Set' : 'Coleção'}</dt><dd>{pickPair(set.n, language)} · {card.no}</dd></>}
                {card.il && <><dt className="font-bold text-slate-500">{language === 'en' ? 'Illustrator' : 'Ilustração'}</dt><dd>{card.il}</dd></>}
            </dl>
        </div>
    )
}

export function TcgpCardModal({ data, cardId, onClose }: { data: TcgpData | null; cardId: string | null; onClose: () => void }) {
    const { t, language } = useLanguage()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const card = cardId ? data?.byId.get(cardId) : undefined

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (card && !dialog.open) dialog.showModal()
        if (!card && dialog.open) dialog.close()
    }, [card])

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close() }}
            aria-label="Pokémon TCG Pocket"
            className="m-auto w-[94vw] max-w-3xl rounded-3xl bg-white p-0 text-slate-900 backdrop:bg-black/70 dark:bg-slate-900 dark:text-slate-100"
        >
            {card && data && (
                <div className="relative grid gap-5 p-6 sm:grid-cols-[16rem_1fr]">
                    <button type="button" onClick={() => dialogRef.current?.close()} aria-label={t('close')} className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/10 text-xl font-black dark:bg-white/10">×</button>
                    <TcgpCardImage card={card} eager />
                    <div className="flex flex-col gap-3 pr-6">
                        <h2 className="text-2xl font-black">{tcgpName(card, language)}</h2>
                        <CardFacts card={card} data={data} />
                        <Link href={tcgpCardPath(card)} className="self-start font-bold text-sky-700 underline underline-offset-2 dark:text-sky-300">{t('viewFullPage')} →</Link>
                    </div>
                </div>
            )}
        </dialog>
    )
}
