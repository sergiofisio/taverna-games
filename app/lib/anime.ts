import ANIME_POOL from "../data/anime-pool.json";
import type { Language } from "../i18n/translations";

export { ANIME_POOL }
export const ANIME_POOL_SIZE = ANIME_POOL.length
const POOL_IDS = new Set(ANIME_POOL)
export const isPoolAnime = (id: number) => POOL_IDS.has(id)

export interface AnimeCharacter {
    id: number
    n: string
    img: string
}

export interface AnimeSummary {
    id: number
    romaji: string
    english: string | null
    img: string
    color: string | null
    format: string | null
    episodes: number | null
    year: number | null
    season: string | null
    genres: string[]
    studio: string | null
    score: number | null
    popularity: number
    source: string | null
    chars: AnimeCharacter[]
}

export interface AnimePool {
    anime: AnimeSummary[]
    byId: Map<number, AnimeSummary>
}

let poolPromise: Promise<AnimePool> | null = null

export function loadAnimePool(): Promise<AnimePool> {
    poolPromise ??= fetch('/api/anime/pool')
        .then((response) => {
            if (!response.ok) throw new Error(`anime: HTTP ${response.status}`)
            return response.json() as Promise<AnimeSummary[]>
        })
        .then((anime) => ({ anime, byId: new Map(anime.map((entry) => [entry.id, entry])) }))
        .catch((error) => {
            poolPromise = null
            throw error
        })
    return poolPromise
}

const pick = (pair: [string, string], language: Language) => (language === 'en' ? pair[1] : pair[0])

export const animeTitle = (anime: Pick<AnimeSummary, 'romaji' | 'english'>, language: Language) =>
    language === 'en' ? anime.english ?? anime.romaji : anime.romaji

export const animeSlug = (anime: Pick<AnimeSummary, 'id' | 'romaji'>) => {
    const base = anime.romaji.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
    return base ? `${base}-${anime.id}` : String(anime.id)
}
export const animePath = (anime: Pick<AnimeSummary, 'id' | 'romaji'>) => `/animes/${animeSlug(anime)}`
export const animeIdFromSlug = (slug: string) => Number(slug.match(/(\d+)$/)?.[1])

export const ANIME_GENRES: Record<string, [string, string, string]> = {
    Action: ['acao', 'Ação', 'Action'],
    Adventure: ['aventura', 'Aventura', 'Adventure'],
    Comedy: ['comedia', 'Comédia', 'Comedy'],
    Drama: ['drama', 'Drama', 'Drama'],
    Ecchi: ['ecchi', 'Ecchi', 'Ecchi'],
    Fantasy: ['fantasia', 'Fantasia', 'Fantasy'],
    Horror: ['terror', 'Terror', 'Horror'],
    'Mahou Shoujo': ['garota-magica', 'Garota mágica', 'Mahou Shoujo'],
    Mecha: ['mecha', 'Mecha', 'Mecha'],
    Music: ['musica', 'Música', 'Music'],
    Mystery: ['misterio', 'Mistério', 'Mystery'],
    Psychological: ['psicologico', 'Psicológico', 'Psychological'],
    Romance: ['romance', 'Romance', 'Romance'],
    'Sci-Fi': ['ficcao-cientifica', 'Ficção científica', 'Sci-Fi'],
    'Slice of Life': ['cotidiano', 'Cotidiano', 'Slice of Life'],
    Sports: ['esportes', 'Esportes', 'Sports'],
    Supernatural: ['sobrenatural', 'Sobrenatural', 'Supernatural'],
    Thriller: ['suspense', 'Suspense', 'Thriller'],
}

export const genreLabel = (genre: string, language: Language) => {
    const entry = ANIME_GENRES[genre]
    return entry ? (language === 'en' ? entry[2] : entry[1]) : genre
}
export const genreSlug = (genre: string) => ANIME_GENRES[genre]?.[0] ?? genre.toLowerCase()
export const genreFromSlug = (slug: string) => Object.keys(ANIME_GENRES).find((genre) => ANIME_GENRES[genre][0] === slug)

const FORMATS: Record<string, [string, string]> = {
    TV: ['Série de TV', 'TV series'], TV_SHORT: ['Série curta', 'TV short'], MOVIE: ['Filme', 'Movie'], SPECIAL: ['Especial', 'Special'],
    OVA: ['OVA', 'OVA'], ONA: ['ONA (web)', 'ONA (web)'], MUSIC: ['Clipe', 'Music video'],
}
const SOURCES: Record<string, [string, string]> = {
    ORIGINAL: ['Original', 'Original'], MANGA: ['Mangá', 'Manga'], LIGHT_NOVEL: ['Light novel', 'Light novel'], VISUAL_NOVEL: ['Visual novel', 'Visual novel'],
    VIDEO_GAME: ['Videogame', 'Video game'], NOVEL: ['Romance', 'Novel'], WEB_NOVEL: ['Web novel', 'Web novel'], OTHER: ['Outro', 'Other'],
    DOUJINSHI: ['Doujinshi', 'Doujinshi'], ANIME: ['Anime', 'Anime'], MULTIMEDIA_PROJECT: ['Projeto multimídia', 'Multimedia project'],
    PICTURE_BOOK: ['Livro ilustrado', 'Picture book'], COMIC: ['Quadrinhos', 'Comic'], GAME: ['Jogo', 'Game'], LIVE_ACTION: ['Live-action', 'Live action'],
    WEB_MANGA: ['Mangá web', 'Web manga'], MANHWA: ['Manhwa', 'Manhwa'], MANHUA: ['Manhua', 'Manhua'],
}
const SEASONS: Record<string, [string, string]> = { WINTER: ['Inverno (janeiro)', 'Winter'], SPRING: ['Primavera (abril)', 'Spring'], SUMMER: ['Verão (julho)', 'Summer'], FALL: ['Outono (outubro)', 'Fall'] }
const STATUSES: Record<string, [string, string]> = {
    FINISHED: ['Finalizado', 'Finished'], RELEASING: ['Em exibição', 'Airing'], NOT_YET_RELEASED: ['Ainda não lançado', 'Not yet released'],
    CANCELLED: ['Cancelado', 'Cancelled'], HIATUS: ['Em hiato', 'On hiatus'],
}

const label = (map: Record<string, [string, string]>, value: string | null, language: Language) =>
    value ? (map[value] ? pick(map[value], language) : value) : '—'

export const formatLabel = (value: string | null, language: Language) => label(FORMATS, value, language)
export const sourceLabel = (value: string | null, language: Language) => label(SOURCES, value, language)
export const seasonLabel = (value: string | null, language: Language) => label(SEASONS, value, language)
export const statusLabel = (value: string | null, language: Language) => label(STATUSES, value, language)

export const SEASON_ORDER = ['WINTER', 'SPRING', 'SUMMER', 'FALL'] as const
export function currentSeason(date = new Date()) {
    return { season: SEASON_ORDER[Math.floor(date.getMonth() / 3)], year: date.getFullYear() }
}

export const normalizeAnime = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export function searchAnime(anime: AnimeSummary[], query: string) {
    const normalized = normalizeAnime(query)
    if (!normalized) return []
    const titles = (entry: AnimeSummary) => [entry.romaji, entry.english ?? ''].map(normalizeAnime)
    return anime
        .filter((entry) => titles(entry).some((title) => title.includes(normalized)))
        .sort((a, b) => Number(titles(b).some((title) => title.startsWith(normalized))) - Number(titles(a).some((title) => title.startsWith(normalized))) || b.popularity - a.popularity)
}
