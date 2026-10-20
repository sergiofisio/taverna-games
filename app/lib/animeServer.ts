import { anilist } from "./anilist";
import { ANIME_POOL, type AnimeSummary } from "./anime";

const DAY = 24 * 60 * 60 * 1000
const PAGE_SIZE = 50

const SUMMARY_FIELDS = `
  id title { romaji english } format episodes season seasonYear source averageScore popularity genres
  studios(isMain: true) { nodes { name } } coverImage { extraLarge color }
  characters(role: MAIN, perPage: 3, sort: FAVOURITES_DESC) { nodes { id name { full } image { large } } }
`

interface RawSummary {
    id: number
    title: { romaji: string; english: string | null }
    format: string | null
    episodes: number | null
    season: string | null
    seasonYear: number | null
    source: string | null
    averageScore: number | null
    popularity: number
    genres: string[]
    studios: { nodes: { name: string }[] }
    coverImage: { extraLarge: string; color: string | null }
    characters: { nodes: { id: number; name: { full: string }; image: { large: string } }[] }
}

const toSummary = (media: RawSummary): AnimeSummary => ({
    id: media.id,
    romaji: media.title.romaji,
    english: media.title.english,
    img: media.coverImage.extraLarge,
    color: media.coverImage.color,
    format: media.format,
    episodes: media.episodes,
    year: media.seasonYear,
    season: media.season,
    genres: media.genres.filter((genre) => genre !== 'Hentai'),
    studio: media.studios.nodes[0]?.name ?? null,
    score: media.averageScore,
    popularity: media.popularity,
    source: media.source,
    chars: media.characters.nodes.map(({ id, name, image }) => ({ id, n: name.full, img: image.large })),
})

type PageResult = { Page: { media: RawSummary[] } }

export async function getAnimePool(): Promise<AnimeSummary[]> {
    const chunks = Array.from({ length: Math.ceil(ANIME_POOL.length / PAGE_SIZE) }, (_, index) => ANIME_POOL.slice(index * PAGE_SIZE, (index + 1) * PAGE_SIZE))
    const results: AnimeSummary[] = []
    for (const ids of chunks) {
        const data = await anilist<PageResult>(`query ($ids: [Int]) { Page(perPage: ${PAGE_SIZE}) { media(id_in: $ids, type: ANIME) { ${SUMMARY_FIELDS} } } }`, { ids })
        results.push(...data.Page.media.map(toSummary))
    }
    return results.sort((a, b) => a.id - b.id)
}

const listQuery = (filters: string, variables: string) => `query ($page: Int${variables}) {
  Page(page: $page, perPage: ${PAGE_SIZE}) { media(type: ANIME, isAdult: false${filters}) { ${SUMMARY_FIELDS} } }
}`

export async function getPopularAnime(page = 1) {
    const data = await anilist<PageResult>(listQuery(', sort: POPULARITY_DESC', ''), { page })
    return data.Page.media.map(toSummary)
}

export async function getTrendingAnime() {
    const data = await anilist<PageResult>(listQuery(', sort: TRENDING_DESC', ''), { page: 1 }, DAY)
    return data.Page.media.map(toSummary)
}

export async function getSeasonAnime(season: string, year: number) {
    const data = await anilist<PageResult>(listQuery(', season: $season, seasonYear: $year, sort: POPULARITY_DESC', ', $season: MediaSeason, $year: Int'), { page: 1, season, year }, DAY)
    return data.Page.media.map(toSummary)
}

export async function getGenreAnime(genre: string) {
    const data = await anilist<PageResult>(listQuery(', genre: $genre, sort: POPULARITY_DESC', ', $genre: String'), { page: 1, genre })
    return data.Page.media.map(toSummary)
}

export interface AnimeFull extends AnimeSummary {
    native: string | null
    status: string | null
    duration: number | null
    banner: string | null
    description: string
    trailer: string | null
    start: { year: number | null; month: number | null; day: number | null }
    country: string | null
    tags: string[]
    studios: string[]
    characters: { id: number; n: string; img: string; role: string }[]
    relations: { id: number; romaji: string; type: string; relation: string; img: string }[]
    recommendations: AnimeSummary[]
}

interface RawFull extends RawSummary {
    title: { romaji: string; english: string | null; native: string | null }
    status: string | null
    duration: number | null
    bannerImage: string | null
    description: string | null
    trailer: { id: string; site: string } | null
    startDate: { year: number | null; month: number | null; day: number | null }
    countryOfOrigin: string | null
    isAdult: boolean
    tags: { name: string; rank: number; isMediaSpoiler: boolean }[]
    allStudios: { nodes: { name: string }[] }
    cast: { edges: { role: string; node: { id: number; name: { full: string }; image: { large: string } } }[] }
    relations: { edges: { relationType: string; node: { id: number; type: string; title: { romaji: string }; coverImage: { large: string } } }[] }
    recommendations: { nodes: { mediaRecommendation: RawSummary | null }[] }
}

export async function getAnime(id: number): Promise<AnimeFull | null> {
    if (!Number.isInteger(id) || id <= 0) return null
    try {
        const data = await anilist<{ Media: RawFull | null }>(`query ($id: Int) {
          Media(id: $id, type: ANIME) {
            ${SUMMARY_FIELDS}
            title { romaji english native } status duration bannerImage description(asHtml: false) trailer { id site }
            startDate { year month day } countryOfOrigin isAdult tags { name rank isMediaSpoiler }
            allStudios: studios { nodes { name } }
            cast: characters(perPage: 12, sort: [ROLE, FAVOURITES_DESC]) { edges { role node { id name { full } image { large } } } }
            relations { edges { relationType node { id type title { romaji } coverImage { large } } } }
            recommendations(perPage: 6, sort: RATING_DESC) { nodes { mediaRecommendation { ${SUMMARY_FIELDS} } } }
          }
        }`, { id })
        const media = data.Media
        if (!media || media.isAdult) return null
        return {
            ...toSummary(media),
            native: media.title.native,
            status: media.status,
            duration: media.duration,
            banner: media.bannerImage,
            description: (media.description ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim(),
            trailer: media.trailer?.site === 'youtube' ? media.trailer.id.trim() : null,
            start: media.startDate,
            country: media.countryOfOrigin,
            tags: media.tags.filter((tag) => !tag.isMediaSpoiler && tag.rank >= 60).slice(0, 10).map((tag) => tag.name),
            studios: media.allStudios.nodes.map(({ name }) => name),
            characters: media.cast.edges.map(({ role, node }) => ({ id: node.id, n: node.name.full, img: node.image.large, role })),
            relations: media.relations.edges
                .filter(({ node }) => node.type === 'ANIME')
                .map(({ relationType, node }) => ({ id: node.id, romaji: node.title.romaji, type: node.type, relation: relationType, img: node.coverImage.large })),
            recommendations: media.recommendations.nodes.flatMap(({ mediaRecommendation }) => (mediaRecommendation ? [toSummary(mediaRecommendation)] : [])),
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('404')) return null
        throw error
    }
}
