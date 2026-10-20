const LAUNCH_DAY = Date.UTC(2026, 9, 1)
const MAX_SQUARES = 10

export function challengeNumber(dateKey: string) {
    const [year, month, day] = dateKey.split('-').map(Number)
    return Math.round((Date.UTC(year, month - 1, day) - LAUNCH_DAY) / 86_400_000) + 1
}

export function attemptSquares(won: boolean, attempts: number) {
    const misses = Math.min(won ? attempts - 1 : attempts, MAX_SQUARES - 1)
    return '🟥'.repeat(Math.max(0, misses)) + (won ? '🟩' : '🏳️')
}

export async function shareText(text: string, url: string) {
    if (navigator.share) {
        try {
            await navigator.share({ text, url })
            return 'shared'
        } catch (error) {
            if ((error as Error).name === 'AbortError') return 'cancelled'
        }
    }
    await navigator.clipboard.writeText(`${text}\n${url}`)
    return 'copied'
}
