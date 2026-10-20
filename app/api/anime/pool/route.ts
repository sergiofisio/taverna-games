import { getAnimePool } from "../../../lib/animeServer";

export async function GET() {
  try {
    return Response.json(await getAnimePool(), { headers: { 'Cache-Control': 'public, max-age=86400' } })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'unavailable' }, { status: 503 })
  }
}
