import type { NextRequest } from "next/server";
import { checkAdmin, getAdminOverview } from "../../../lib/adminServer";

const HEADERS = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null
  const check = await checkAdmin(token)
  if (check.status === 'not_configured') console.warn('admin: SUPABASE_SECRET_KEY ou ADMIN_EMAILS ausente')
  if (check.status !== 'ok') return Response.json({ error: 'not_found' }, { status: 404, headers: HEADERS })

  try {
    return Response.json(await getAdminOverview(), { headers: HEADERS })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'failed' }, { status: 500, headers: HEADERS })
  }
}
