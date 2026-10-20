import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ENDPOINT = 'https://graphql.anilist.co'
const CACHE_DIR = process.env.ANILIST_CACHE_DIR ?? path.join(process.cwd(), '.cache', 'anilist')
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000
const MIN_INTERVAL = 2100
const MAX_WAIT = 8000
const DEFAULT_COOLDOWN = 60_000

const inflight = new Map<string, Promise<unknown>>()

let nextSlot = 0
let cooldownUntil = 0

export class AnilistBusyError extends Error {
    constructor() {
        super('AniList busy')
    }
}

async function readCache<T>(file: string, ttl: number): Promise<{ data: T; fresh: boolean } | null> {
    try {
        const [content, info] = await Promise.all([readFile(file, 'utf8'), stat(file)])
        return { data: JSON.parse(content) as T, fresh: Date.now() - info.mtimeMs < ttl }
    } catch {
        return null
    }
}

async function waitForSlot() {
    const now = Date.now()
    if (now < cooldownUntil) throw new AnilistBusyError()
    const slot = Math.max(now, nextSlot)
    if (slot - now > MAX_WAIT) throw new AnilistBusyError()
    nextSlot = slot + MIN_INTERVAL
    if (slot > now) await new Promise((resolve) => setTimeout(resolve, slot - now))
}

async function request<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    await waitForSlot()
    const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables }),
        cache: 'no-store',
    })
    if (response.status === 429) {
        const retryAfter = Number(response.headers.get('retry-after'))
        cooldownUntil = Date.now() + (retryAfter > 0 ? retryAfter * 1000 : DEFAULT_COOLDOWN)
        throw new AnilistBusyError()
    }
    if (!response.ok) throw new Error(`AniList ${response.status}`)
    const body = await response.json() as { data?: T; errors?: { message: string }[] }
    if (body.errors?.length || !body.data) throw new Error(`AniList: ${body.errors?.[0]?.message ?? 'sem dados'}`)
    return body.data
}

export async function anilist<T>(query: string, variables: Record<string, unknown> = {}, ttl = DEFAULT_TTL): Promise<T> {
    const key = createHash('sha1').update(query + JSON.stringify(variables)).digest('hex')
    const file = path.join(CACHE_DIR, `${key}.json`)
    const cached = await readCache<T>(file, ttl)
    if (cached?.fresh) return cached.data

    const pending = inflight.get(key) as Promise<T> | undefined
    if (pending) return pending

    const task = request<T>(query, variables)
        .then(async (data) => {
            await mkdir(CACHE_DIR, { recursive: true })
            await writeFile(file, JSON.stringify(data))
            return data
        })
        .catch((error) => {
            if (cached) return cached.data
            throw error
        })
        .finally(() => inflight.delete(key))
    inflight.set(key, task)
    return task
}
