'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import {
    BAN_COLORS, YGO_ATTRIBUTE_COLORS, YGO_FRAME_COLORS, loadYgoData, loadYgoPool, loadYgoSets, ygoArchetypePath, ygoAttributeLabel, ygoBanLabel, ygoCardPath,
    ygoImage, ygoKindLabel, ygoLevelLabel, ygoName, ygoRaceLabel, ygoRarityColor, ygoRarityLabel, type YgoCard, type YgoImageSize,
} from "../../lib/ygo";

export const useYgoData = () => useAsyncData('ygo-cards', loadYgoData)
export const useYgoSets = () => useAsyncData('ygo-sets', loadYgoSets)
export const useYgoPool = () => useAsyncData('ygo-pool', loadYgoPool)

const loadText = async (key: string): Promise<[string | null, string] | null> => {
    const id = key.split(':')[1]
    if (id === '0') return null
    const response = await fetch(`/api/ygo/card/${id}`)
    if (!response.ok) throw new Error(`ygo text: HTTP ${response.status}`)
    return (await response.json() as { text: [string | null, string] }).text
}
export const useYgoText = (id: number | null) => useAsyncData(`ygo-text:${id ?? 0}`, loadText)

export function DuelBackdrop({ children, className = 'text-zinc-900 dark:text-zinc-100' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`relative isolate flex min-w-0 flex-1 flex-col bg-amber-50 dark:bg-zinc-950 ${className}`}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,0.3),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(217,119,6,0.3),transparent_45%)]" />
            {children}
        </div>
    )
}

export function YgoEmblem({ className = 'size-9' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path d="M3 4h18L12 21Z" fill="#fbbf24" stroke="#78350f" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M7.2 9.2c1.4-1.6 3-2.4 4.8-2.4s3.4.8 4.8 2.4c-1.4 1.6-3 2.4-4.8 2.4s-3.4-.8-4.8-2.4Z" fill="#fff7ed" stroke="#78350f" strokeWidth="1" />
            <circle cx="12" cy="9.2" r="1.5" fill="#78350f" />
            <path d="M12 11.6v3.2M10.4 13.6l1.6 1.2 1.6-1.2" stroke="#78350f" strokeWidth="1" fill="none" strokeLinecap="round" />
        </svg>
    )
}

const SIZES: Record<YgoImageSize, [number, number]> = { small: [168, 246], full: [421, 614], art: [624, 624] }

export function YgoCardImage({ card, size = 'small', className = '', eager = false }: { card: Pick<YgoCard, 'id' | 'n'>; size?: YgoImageSize; className?: string; eager?: boolean }) {
    const { language } = useLanguage()
    const [width, height] = SIZES[size]
    return (
        <Image
            src={ygoImage(card.id, size)}
            alt={ygoName(card, language)}
            width={width}
            height={height}
            unoptimized
            loading={eager ? 'eager' : 'lazy'}
            className={`h-auto w-full rounded-md bg-zinc-800 ${size === 'art' ? 'aspect-square' : 'aspect-421/614'} ${className}`}
        />
    )
}

export function AttributeIcon({ attribute, className = 'size-6' }: { attribute: string; className?: string }) {
    const { language } = useLanguage()
    return (
        <span title={ygoAttributeLabel(attribute, language)} className={`inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white shadow ring-2 ring-amber-300/70 ${className}`} style={{ backgroundColor: YGO_ATTRIBUTE_COLORS[attribute] ?? '#555' }}>
            {ygoAttributeLabel(attribute, language).slice(0, 2)}
        </span>
    )
}

export function BanBadge({ ban, ocg = false }: { ban: number | undefined; ocg?: boolean }) {
    const { language } = useLanguage()
    if (ban === undefined) return null
    return (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-black text-white" style={{ backgroundColor: BAN_COLORS[ban] }}>
            {ban === 0 ? '⊘' : ban} {ygoBanLabel(ban, language)}{ocg ? ' (OCG)' : ''}
        </span>
    )
}

export function RarityBadge({ rarity, names }: { rarity: string; names?: Record<string, string> }) {
    const { language } = useLanguage()
    return (
        <span title={ygoRarityLabel(rarity, language, names)} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black text-zinc-900" style={{ backgroundColor: ygoRarityColor(rarity) }}>
            {rarity} <span className="font-bold">{ygoRarityLabel(rarity, language, names)}</span>
        </span>
    )
}

export function CardText({ text }: { text: [string | null, string] | null | undefined }) {
    const { language } = useLanguage()
    if (!text) return null
    const value = language === 'pt' ? text[0] ?? text[1] : text[1]
    return (
        <div className="flex flex-col gap-1">
            <p className="rounded-xl bg-amber-100/70 p-3 text-sm leading-relaxed whitespace-pre-line dark:bg-zinc-800">{value}</p>
            {language === 'pt' && !text[0] && <p className="text-xs text-zinc-500">Texto ainda sem tradução oficial em português.</p>}
        </div>
    )
}

export function CardFacts({ card }: { card: YgoCard }) {
    const { language } = useLanguage()
    const pt = language === 'pt'
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full px-2.5 py-0.5 text-xs font-black text-white ring-1 ring-black/20" style={{ backgroundColor: YGO_FRAME_COLORS[card.f], color: card.f === 'synchro' || card.f === 'normal' ? '#18181b' : undefined }}>{ygoKindLabel(card, language)}</span>
                {card.a && <AttributeIcon attribute={card.a} />}
                <BanBadge ban={card.b} />
                {card.b === undefined && card.bo !== undefined && <BanBadge ban={card.bo} ocg />}
            </div>
            {card.k === 'm' && (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                    <div><dt className="font-bold text-zinc-500">{pt ? 'Tipo' : 'Type'}</dt><dd>{ygoRaceLabel(card.r, language)}</dd></div>
                    <div><dt className="font-bold text-zinc-500">{pt ? 'Atributo' : 'Attribute'}</dt><dd>{ygoAttributeLabel(card.a, language)}</dd></div>
                    <div><dt className="font-bold text-zinc-500">{ygoLevelLabel(card, language)}</dt><dd>{card.f === 'link' ? card.l : `${'★'.repeat(Math.min(card.l ?? 0, 12))} ${card.l}`}</dd></div>
                    <div><dt className="font-bold text-zinc-500">ATK</dt><dd className="font-black">{card.atk === -1 ? '?' : card.atk}</dd></div>
                    {card.def !== null && card.def !== undefined && <div><dt className="font-bold text-zinc-500">DEF</dt><dd className="font-black">{card.def === -1 ? '?' : card.def}</dd></div>}
                    {card.p && <div><dt className="font-bold text-zinc-500">{pt ? 'Escala' : 'Scale'}</dt><dd>{card.sc}</dd></div>}
                    {card.lm && <div className="col-span-2"><dt className="font-bold text-zinc-500">{pt ? 'Setas Link' : 'Link Arrows'}</dt><dd>{card.lm.join(', ')}</dd></div>}
                </dl>
            )}
            {card.ar && (
                <p className="text-sm"><span className="font-bold text-zinc-500">{pt ? 'Arquétipo' : 'Archetype'}: </span><ArchetypeLink name={card.ar} /></p>
            )}
            {card.y && <p className="text-sm"><span className="font-bold text-zinc-500">{pt ? 'Lançamento' : 'Released'}: </span>{card.y}{card.ocg ? ' (OCG)' : ''}</p>}
        </div>
    )
}

function ArchetypeLink({ name }: { name: string }) {
    return <Link href={ygoArchetypePath(name)} prefetch={false} className="font-bold text-violet-700 underline-offset-2 hover:underline dark:text-violet-300">{name}</Link>
}

export function YgoCardModal({ card, onClose }: { card: YgoCard | null; onClose: () => void }) {
    const { t, language } = useLanguage()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const text = useYgoText(card?.id ?? null)

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
            aria-label="Yu-Gi-Oh!"
            className="m-auto w-[94vw] max-w-3xl rounded-3xl bg-white p-0 text-zinc-900 backdrop:bg-black/70 dark:bg-zinc-900 dark:text-zinc-100"
        >
            {card && (
                <div className="relative grid gap-5 p-6 sm:grid-cols-[16rem_1fr]">
                    <button type="button" onClick={() => dialogRef.current?.close()} aria-label={t('close')} className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/10 text-xl font-black dark:bg-white/10">×</button>
                    <YgoCardImage card={card} size="full" eager />
                    <div className="flex flex-col gap-3 pr-6">
                        <h2 className="text-2xl font-black">{ygoName(card, language)}</h2>
                        {language === 'pt' && card.n[0] !== card.n[1] && <p className="-mt-2 text-sm text-zinc-500">{card.n[1]}</p>}
                        <CardFacts card={card} />
                        {text?.status === 'success' ? <CardText text={text.data} /> : text ? null : <p className="text-sm text-zinc-500">…</p>}
                        <Link href={ygoCardPath(card)} className="self-start font-bold text-violet-700 underline underline-offset-2 dark:text-violet-300">{t('viewFullPage')} →</Link>
                    </div>
                </div>
            )}
        </dialog>
    )
}