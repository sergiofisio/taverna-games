import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { YGO_CACHE_DIR, limited } from "../../../../../lib/ygoRemote";
import { isKnownYgoImage } from "../../../../../lib/ygoServer";

const FOLDERS: Record<string, string> = { small: 'cards_small', full: 'cards', art: 'cards_cropped' }
const HEADERS = { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' }

const inflight = new Map<string, Promise<Buffer | null>>()

function download(folder: string, id: string, file: string) {
  const pending = inflight.get(file)
  if (pending) return pending
  const task = limited(() => fetch(`https://images.ygoprodeck.com/images/${folder}/${id}.jpg`, { cache: 'no-store' }))
    .then(async (response) => {
      if (!response.ok) return null
      const buffer = Buffer.from(await response.arrayBuffer())
      await mkdir(path.dirname(file), { recursive: true })
      await writeFile(file, buffer)
      return buffer
    })
    .finally(() => inflight.delete(file))
  inflight.set(file, task)
  return task
}

export async function GET(_request: Request, { params }: { params: Promise<{ size: string; file: string }> }) {
  const { size, file } = await params
  const folder = FOLDERS[size]
  const id = /^(\d{1,10})\.jpg$/.exec(file)?.[1]
  if (!folder || !id) return new Response(null, { status: 404 })

  const cached = path.join(YGO_CACHE_DIR, 'img', size, `${id}.jpg`)
  try {
    return new Response(new Uint8Array(await readFile(cached)), { headers: HEADERS })
  } catch {}

  try {
    if (!(await isKnownYgoImage(Number(id)))) return new Response(null, { status: 404 })
    const buffer = await download(folder, id, cached)
    if (!buffer) return new Response(null, { status: 404 })
    return new Response(new Uint8Array(buffer), { headers: HEADERS })
  } catch (error) {
    console.error(error)
    return new Response(null, { status: 502 })
  }
}
