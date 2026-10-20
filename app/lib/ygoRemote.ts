import path from "node:path";

export const YGO_CACHE_DIR = process.env.YGO_CACHE_DIR ?? path.join(process.cwd(), '.cache', 'ygo')
export const YGO_API = 'https://db.ygoprodeck.com/api/v7'

const MAX_ACTIVE = 4
let active = 0
const queue: (() => void)[] = []

export async function limited<T>(task: () => Promise<T>): Promise<T> {
    if (active >= MAX_ACTIVE) await new Promise<void>((resolve) => queue.push(resolve))
    active++
    try {
        return await task()
    } finally {
        active--
        queue.shift()?.()
    }
}
