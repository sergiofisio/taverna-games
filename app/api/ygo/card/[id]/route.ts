import { getYgoData, getYgoText } from "../../../../lib/ygoServer";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || !(await getYgoData()).byId.has(id)) return Response.json({ error: 'not_found' }, { status: 404 })
  const text = await getYgoText(id)
  if (!text) return Response.json({ error: 'unavailable' }, { status: 503 })
  return Response.json({ text }, { headers: { 'Cache-Control': 'public, max-age=86400' } })
}
