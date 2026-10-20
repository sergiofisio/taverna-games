import { writeFile } from 'node:fs/promises'

const ENDPOINT = 'https://graphql.anilist.co'
const POOL_SIZE = 300
const PER_PAGE = 50
const DELAY = 2500

const query = `query ($page: Int) {
  Page(page: $page, perPage: ${PER_PAGE}) {
    pageInfo { hasNextPage }
    media(type: ANIME, sort: POPULARITY_DESC, isAdult: false, format_in: [TV, MOVIE, ONA]) {
      id
      relations { edges { relationType node { type } } }
    }
  }
}`

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const ids = []
for (let page = 1; ids.length < POOL_SIZE; page++) {
    const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables: { page } }),
    })
    if (response.status === 429) {
        await sleep(60_000)
        page--
        continue
    }
    if (!response.ok) throw new Error(`AniList ${response.status}`)
    const { data } = await response.json()
    for (const media of data.Page.media) {
        const sequel = media.relations.edges.some(({ relationType, node }) => relationType === 'PREQUEL' && node.type === 'ANIME')
        if (!sequel && ids.length < POOL_SIZE) ids.push(media.id)
    }
    if (!data.Page.pageInfo.hasNextPage) break
    await sleep(DELAY)
}

await writeFile('app/data/anime-pool.json', JSON.stringify(ids.sort((a, b) => a - b)))
console.log(`${ids.length} animes no sorteio`)
