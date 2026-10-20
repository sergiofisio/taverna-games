'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLanguage } from "../../context/languageContext";
import { animePath, animeTitle, formatLabel, genreLabel, type AnimePool } from "../../lib/anime";

export default function AnimeModal({ pool, animeId, onClose }: { pool: AnimePool | null; animeId: number | null; onClose: () => void }) {
    const { t, language } = useLanguage()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const anime = animeId !== null ? pool?.byId.get(animeId) : undefined

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (anime && !dialog.open) dialog.showModal()
        if (!anime && dialog.open) dialog.close()
    }, [anime])

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close() }}
            aria-label="Anime"
            className="m-auto w-[94vw] max-w-2xl rounded-3xl border-2 border-pink-400 bg-[#1e1033] p-0 text-zinc-100 backdrop:bg-black/80"
        >
            {anime && (
                <div className="relative flex flex-col gap-5 p-6 sm:flex-row">
                    <button type="button" onClick={() => dialogRef.current?.close()} aria-label={t('close')} className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/50 text-xl font-black">×</button>
                    <Image src={anime.img} alt={animeTitle(anime, language)} width={200} height={300} unoptimized className="mx-auto h-auto w-40 shrink-0 rounded-2xl shadow-xl" />
                    <div className="flex flex-col gap-2">
                        <h2 className="pr-8 text-2xl font-black">{animeTitle(anime, language)}</h2>
                        {anime.english && language === 'pt' && anime.english !== anime.romaji && <p className="text-sm text-pink-200">{anime.english}</p>}
                        <p className="text-sm text-zinc-300">{formatLabel(anime.format, language)} · {anime.year ?? '—'} · {anime.studio ?? '—'}</p>
                        <p className="text-sm">{anime.genres.map((genre) => genreLabel(genre, language)).join(', ')}</p>
                        <Link href={animePath(anime)} className="mt-auto self-start font-bold text-pink-300 underline underline-offset-2 hover:text-pink-100">{t('viewFullPage')} →</Link>
                    </div>
                </div>
            )}
        </dialog>
    )
}
