'use client'

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import { useTranslatedText } from "../../hooks/useTranslatedText";
import type { Language } from "../../i18n/translations";
import { ANIME_GENRES, animePath, animeTitle, formatLabel, genreLabel, genreSlug, seasonLabel, sourceLabel, statusLabel, type AnimeSummary } from "../../lib/anime";
import type { AnimeFull } from "../../lib/animeServer";
import { describeAnime } from "../../lib/animeText";

const LABELS = {
    pt: {
        home: 'Animes', homeIntro: 'Os animes mais populares, a temporada atual e todos os gêneros, com fichas em português, personagens e recomendações, além do Animedle diário.',
        trending: 'Em alta agora', season: 'Temporada de {season}', seasonAll: 'Ver a temporada completa', popular: 'Mais populares', popularAll: 'Ver o ranking completo',
        genres: 'Gêneros', challenges: 'Desafios Animedle', challengesDesc: 'Adivinhe o anime por atributos, pela capa ou pelo personagem.',
        basics: 'Como usar as fichas', basicsText: [
            'Cada anime tem uma ficha com título original e em inglês, formato, estúdio, ano de estreia, número de episódios, origem da história, gêneros e temas, além dos personagens principais e de recomendações parecidas.',
            'As notas e a popularidade vêm do AniList, uma das maiores comunidades de anime do mundo. A temporada é atualizada todos os dias, então vale voltar para ver as estreias.',
        ],
        about: 'Sobre', synopsis: 'Sinopse', synopsisNote: 'Sinopse oficial do AniList, traduzida automaticamente quando o navegador permite.', info: 'Ficha técnica',
        characters: 'Personagens', related: 'Relacionados', recommendations: 'Se você gostou, veja também', trailer: 'Ver trailer no YouTube',
        format: 'Formato', episodes: 'Episódios', duration: 'Duração', status: 'Status', start: 'Estreia', studio: 'Estúdio', source: 'Origem',
        score: 'Nota', popularity: 'Popularidade', native: 'Título original', minutes: '{n} min', users: '{n} usuários', main: 'Principal', supporting: 'Coadjuvante',
        play: 'Jogue o Animedle', playText: 'Teste se você reconhece este e outros animes pela capa ou pelos personagens.', playButton: 'Jogar agora',
        popularTitle: 'Animes mais populares', popularIntro: 'O ranking dos animes com mais pessoas assistindo ou que já assistiram, segundo o AniList.',
        seasonTitle: 'Animes da temporada de {season}', seasonIntro: 'As estreias e continuações desta temporada, ordenadas por popularidade.',
        genreTitle: 'Animes de {genre}', allGenres: 'Todos os gêneros', credit: 'Dados fornecidos pelo AniList.',
    },
    en: {
        home: 'Anime', homeIntro: 'The most popular anime, the current season and every genre, with detailed pages, characters and recommendations, plus the daily Animedle.',
        trending: 'Trending now', season: '{season} season', seasonAll: 'See the full season', popular: 'Most popular', popularAll: 'See the full ranking',
        genres: 'Genres', challenges: 'Animedle challenges', challengesDesc: 'Guess the anime by attributes, cover or character.',
        basics: 'How to use the pages', basicsText: [
            'Each anime has a page with its original and English titles, format, studio, premiere year, episode count, story source, genres and themes, plus main characters and similar recommendations.',
            'Scores and popularity come from AniList, one of the largest anime communities in the world. The season page updates daily, so check back for new premieres.',
        ],
        about: 'About', synopsis: 'Synopsis', synopsisNote: 'Official synopsis from AniList.', info: 'Details',
        characters: 'Characters', related: 'Related', recommendations: 'If you liked it, also watch', trailer: 'Watch the trailer on YouTube',
        format: 'Format', episodes: 'Episodes', duration: 'Duration', status: 'Status', start: 'Premiere', studio: 'Studio', source: 'Source',
        score: 'Score', popularity: 'Popularity', native: 'Original title', minutes: '{n} min', users: '{n} users', main: 'Main', supporting: 'Supporting',
        play: 'Play Animedle', playText: 'See if you can recognize this and other anime by their cover or characters.', playButton: 'Play now',
        popularTitle: 'Most popular anime', popularIntro: 'The ranking of anime with the most people watching or who have watched them, according to AniList.',
        seasonTitle: '{season} season anime', seasonIntro: 'This season\'s premieres and continuations, sorted by popularity.',
        genreTitle: '{genre} anime', allGenres: 'All genres', credit: 'Data provided by AniList.',
    },
} satisfies Record<Language, Record<string, string | string[]>>

const panel = 'flex flex-col gap-3 rounded-3xl border border-pink-500/30 bg-[#1e1033]/85 p-6 shadow-xl'

function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
    return (
        <section className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black text-pink-200">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    )
}

function Breadcrumb({ items }: { items: [string, string][] }) {
    return (
        <nav aria-label="breadcrumb" className="text-sm text-zinc-400">
            {items.map(([label, href], index) => <span key={href}>{index > 0 && ' / '}<Link href={href} className="hover:underline">{label}</Link></span>)}
        </nav>
    )
}

export function AnimeGrid({ anime, ranked = false }: { anime: AnimeSummary[]; ranked?: boolean }) {
    const { language } = useLanguage()
    return (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {anime.map((entry, index) => (
                <li key={entry.id}>
                    <Link href={animePath(entry)} prefetch={false} className="group flex flex-col gap-1.5">
                        <span className="relative block aspect-2/3 overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/10">
                            <Image src={entry.img} alt={animeTitle(entry, language)} fill unoptimized loading="lazy" sizes="12rem" className="object-cover transition group-hover:scale-105" />
                            {ranked && <span className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-black">#{index + 1}</span>}
                            {entry.score && <span className="absolute right-2 bottom-2 rounded-full bg-pink-600 px-2 py-0.5 text-xs font-black">{entry.score}%</span>}
                        </span>
                        <span className="line-clamp-2 text-sm font-bold group-hover:text-pink-200">{animeTitle(entry, language)}</span>
                        <span className="text-xs text-zinc-400">{formatLabel(entry.format, language)}{entry.year ? ` · ${entry.year}` : ''}</span>
                    </Link>
                </li>
            ))}
        </ul>
    )
}

function GenreList() {
    const { language } = useLanguage()
    return (
        <ul className="flex flex-wrap gap-2">
            {Object.keys(ANIME_GENRES).filter((genre) => genre !== 'Ecchi').map((genre) => (
                <li key={genre}>
                    <Link href={`/animes/generos/${genreSlug(genre)}`} className="block rounded-full bg-pink-900/40 px-3 py-1 text-sm font-bold hover:bg-pink-800/60">{genreLabel(genre, language)}</Link>
                </li>
            ))}
        </ul>
    )
}

export function AnimeHome({ trending, season, seasonName, year, popular }: { trending: AnimeSummary[]; season: AnimeSummary[]; seasonName: string; year: number; popular: AnimeSummary[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const seasonTitle = L.season.replace('{season}', `${seasonLabel(seasonName, language).toLowerCase()} ${year}`)
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-col gap-2 text-center">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{L.home}</h1>
                <p className="mx-auto max-w-2xl text-zinc-300">{L.homeIntro}</p>
            </header>
            <Link href="/desafios/anime-capa" className="flex flex-col gap-1 rounded-3xl bg-linear-to-r from-fuchsia-600 to-indigo-700 p-5 shadow-xl transition hover:-translate-y-1">
                <span className="text-xl font-black">{L.challenges} →</span>
                <span className="text-sm text-white/85">{L.challengesDesc}</span>
            </Link>
            <Panel title={L.trending}><AnimeGrid anime={trending.slice(0, 12)} /></Panel>
            <Panel title={seasonTitle.charAt(0).toUpperCase() + seasonTitle.slice(1)} action={<Link href="/animes/temporada" className="text-sm font-bold text-pink-300 hover:underline">{L.seasonAll} →</Link>}>
                <AnimeGrid anime={season.slice(0, 12)} />
            </Panel>
            <Panel title={L.popular} action={<Link href="/animes/populares" className="text-sm font-bold text-pink-300 hover:underline">{L.popularAll} →</Link>}>
                <AnimeGrid anime={popular.slice(0, 12)} ranked />
            </Panel>
            <Panel title={L.genres}><GenreList /></Panel>
            <Panel title={L.basics}>{L.basicsText.map((paragraph) => <p key={paragraph} className="leading-relaxed text-zinc-200">{paragraph}</p>)}</Panel>
            <p className="text-center text-xs text-zinc-500">{L.credit}</p>
        </div>
    )
}

export function AnimeListView({ kind, anime, genre, seasonName, year, intro }: { kind: 'popular' | 'season' | 'genre'; anime: AnimeSummary[]; genre?: string; seasonName?: string; year?: number; intro?: [string, string] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const season = seasonName ? `${seasonLabel(seasonName, language).toLowerCase()} ${year}` : ''
    const title = kind === 'popular' ? L.popularTitle : kind === 'season' ? L.seasonTitle.replace('{season}', season) : L.genreTitle.replace('{genre}', genreLabel(genre ?? '', language).toLowerCase())
    const text = kind === 'popular' ? L.popularIntro : kind === 'season' ? L.seasonIntro : intro ? intro[language === 'en' ? 1 : 0] : ''
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <Breadcrumb items={[[L.home, '/animes']]} />
            <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight">{title.charAt(0).toUpperCase() + title.slice(1)}</h1>
                <p className="max-w-3xl text-zinc-300">{text}</p>
            </header>
            <section className={panel}><AnimeGrid anime={anime} ranked={kind === 'popular'} /></section>
            <Panel title={L.allGenres}><GenreList /></Panel>
            <p className="text-center text-xs text-zinc-500">{L.credit}</p>
        </div>
    )
}

function Synopsis({ text }: { text: string }) {
    const { language } = useLanguage()
    const translation = useTranslatedText(text)
    return (
        <>
            <p className="whitespace-pre-line leading-relaxed text-zinc-200">{translation.text}</p>
            <p className="text-xs text-zinc-500">{LABELS[language].synopsisNote}</p>
        </>
    )
}

export function AnimeView({ anime }: { anime: AnimeFull }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const title = animeTitle(anime, language)
    const paragraphs = describeAnime(anime, language)
    const start = anime.start.year ? [anime.start.day, anime.start.month, anime.start.year].filter(Boolean).map((value) => String(value).padStart(2, '0')).join('/') : '—'
    const facts: [string, ReactNode][] = [
        [L.format, formatLabel(anime.format, language)],
        [L.episodes, anime.episodes ?? '—'],
        [L.duration, anime.duration ? L.minutes.replace('{n}', String(anime.duration)) : '—'],
        [L.status, statusLabel(anime.status, language)],
        [L.start, start],
        [L.studio, anime.studios.join(', ') || '—'],
        [L.source, sourceLabel(anime.source, language)],
        [L.score, anime.score ? `${anime.score}%` : '—'],
        [L.popularity, L.users.replace('{n}', anime.popularity.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US'))],
        [L.native, anime.native ?? '—'],
    ]

    return (
        <article className="flex w-full flex-col">
            <header className="relative w-full overflow-hidden">
                {anime.banner && <Image src={anime.banner} alt="" fill priority unoptimized sizes="100vw" className="object-cover opacity-50" />}
                <div className="absolute inset-0 bg-linear-to-t from-[#140b24] via-[#140b24]/70 to-transparent" />
                <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 pt-10 pb-6 sm:flex-row sm:items-end">
                    <Image src={anime.img} alt={title} width={230} height={330} priority unoptimized className="h-auto w-44 shrink-0 rounded-2xl shadow-2xl ring-2 ring-pink-400/50 sm:w-52" />
                    <div className="flex flex-col gap-2">
                        <Breadcrumb items={[[L.home, '/animes']]} />
                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
                        {anime.english && anime.english !== anime.romaji && <p className="text-lg text-pink-200">{language === 'en' ? anime.romaji : anime.english}</p>}
                        <ul className="flex flex-wrap gap-2">
                            {anime.genres.map((genre) => (
                                <li key={genre}><Link href={`/animes/generos/${genreSlug(genre)}`} className="block rounded-full bg-pink-600/80 px-3 py-1 text-xs font-black hover:bg-pink-500">{genreLabel(genre, language)}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="flex flex-col gap-6">
                        <Panel title={L.about}>{paragraphs.map((paragraph) => <p key={paragraph} className="leading-relaxed text-zinc-200">{paragraph}</p>)}</Panel>
                        {anime.description && <Panel title={L.synopsis}><Synopsis text={anime.description} /></Panel>}
                    </div>
                    <Panel title={L.info}>
                        <dl className="flex flex-col gap-2 text-sm">
                            {facts.map(([label, value]) => (
                                <div key={label} className="flex justify-between gap-3 border-b border-white/5 pb-1.5">
                                    <dt className="font-bold text-zinc-400">{label}</dt>
                                    <dd className="text-right">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        {anime.trailer && (
                            <a href={`https://www.youtube.com/watch?v=${anime.trailer}`} target="_blank" rel="noreferrer" className="self-start rounded-full bg-red-600 px-4 py-2 text-sm font-black hover:bg-red-500">▶ {L.trailer}</a>
                        )}
                    </Panel>
                </div>

                {anime.characters.length > 0 && (
                    <Panel title={L.characters}>
                        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                            {anime.characters.map((character) => (
                                <li key={character.id} className="flex flex-col gap-1 text-center text-xs">
                                    <span className="relative block aspect-2/3 overflow-hidden rounded-xl">
                                        <Image src={character.img} alt={character.n} fill unoptimized loading="lazy" sizes="9rem" className="object-cover" />
                                    </span>
                                    <span className="font-bold">{character.n}</span>
                                    <span className="text-zinc-400">{character.role === 'MAIN' ? L.main : L.supporting}</span>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                )}

                {anime.relations.length > 0 && (
                    <Panel title={L.related}>
                        <ul className="flex flex-wrap gap-3">
                            {anime.relations.slice(0, 8).map((relation) => (
                                <li key={relation.id}>
                                    <Link href={animePath({ id: relation.id, romaji: relation.romaji })} prefetch={false} className="flex items-center gap-2 rounded-xl bg-black/30 p-2 pr-3 text-sm font-bold hover:bg-black/50">
                                        <Image src={relation.img} alt="" width={36} height={52} unoptimized className="h-13 w-9 rounded object-cover" />
                                        <span className="max-w-48">{relation.romaji}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                )}

                {anime.recommendations.length > 0 && <Panel title={L.recommendations}><AnimeGrid anime={anime.recommendations} /></Panel>}

                <section className="flex flex-col items-start gap-3 rounded-3xl bg-linear-to-r from-fuchsia-600 to-indigo-700 p-6">
                    <h2 className="text-xl font-black">{L.play}</h2>
                    <p>{L.playText}</p>
                    <Link href="/desafios/anime-personagem" className="rounded-full bg-white px-5 py-2 font-black text-purple-900 hover:bg-pink-100">{L.playButton}</Link>
                </section>
                <p className="text-center text-xs text-zinc-500">{L.credit}</p>
            </div>
        </article>
    )
}
