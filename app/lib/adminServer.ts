import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { CHALLENGE_MODES, isChallengeMode, type ChallengeStats } from "./challenge";
import { emptyStatsMap, getLevelInfo, totalXp, type StatsMap } from "./progression";

const PAGE = 1000
const MAX_ROWS = 200_000
const DAY = 24 * 60 * 60 * 1000

let admin: SupabaseClient | null = null

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SECRET_KEY
    if (!url || !key) return null
    admin ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    return admin
}

const adminEmails = () =>
    (process.env.ADMIN_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)

export type AdminCheck = { status: 'ok' } | { status: 'denied' } | { status: 'not_configured' }

export async function checkAdmin(token: string | null): Promise<AdminCheck> {
    const client = getAdminClient()
    if (!client || adminEmails().length === 0) return { status: 'not_configured' }
    if (!token) return { status: 'denied' }
    const { data, error } = await client.auth.getUser(token)
    const email = data.user?.email?.toLowerCase()
    if (error || !email || !data.user?.email_confirmed_at || !adminEmails().includes(email)) return { status: 'denied' }
    return { status: 'ok' }
}

async function fetchAll<T>(client: SupabaseClient, table: string, columns: string) {
    const rows: T[] = []
    for (let from = 0; from < MAX_ROWS; from += PAGE) {
        const { data, error } = await client.from(table).select(columns).range(from, from + PAGE - 1)
        if (error) throw error
        rows.push(...(data as T[]))
        if (!data || data.length < PAGE) break
    }
    return rows
}

async function fetchUsers(client: SupabaseClient) {
    const users: User[] = []
    for (let page = 1; ; page++) {
        const { data, error } = await client.auth.admin.listUsers({ page, perPage: PAGE })
        if (error) throw error
        users.push(...data.users)
        if (data.users.length < PAGE) break
    }
    return users
}

export interface AdminUser {
    id: string
    email: string | null
    username: string | null
    displayName: string | null
    avatarUrl: string | null
    providers: string[]
    isPublic: boolean
    confirmed: boolean
    createdAt: string
    lastSignInAt: string | null
    lastActivityAt: string | null
    level: number
    xp: number
    wins: number
    bestStreak: number
    modesPlayed: number
    decks: number
    collectionCards: number
    duelsCreated: number
    duelsPlayed: number
}

export interface AdminOverview {
    generatedAt: string
    totals: {
        users: number
        confirmed: number
        withUsername: number
        publicProfiles: number
        newLast7: number
        newLast30: number
        activeLast7: number
        activeLast30: number
        duels: number
        duelResults: number
        decks: number
        collectors: number
        totalWins: number
    }
    modeWins: Record<string, number>
    signupsByDay: { date: string; count: number }[]
    users: AdminUser[]
}

type ProgressRow = { user_id: string; key: string; value: unknown; updated_at: string }
type ProfileRow = { id: string; username: string | null; display_name: string | null; avatar_url: string | null; is_public: boolean }
type UserDated = { user_id: string; updated_at: string }

const latest = (...dates: (string | null | undefined)[]) =>
    dates.reduce<string | null>((max, date) => (date && (!max || date > max) ? date : max), null)

export async function getAdminOverview(): Promise<AdminOverview> {
    const client = getAdminClient()
    if (!client) throw new Error('not_configured')

    const [users, profiles, progress, decks, collection, duels, results] = await Promise.all([
        fetchUsers(client),
        fetchAll<ProfileRow>(client, 'profiles', 'id, username, display_name, avatar_url, is_public'),
        fetchAll<ProgressRow>(client, 'challenge_progress', 'user_id, key, value, updated_at'),
        fetchAll<UserDated>(client, 'hs_decks', 'user_id, updated_at'),
        fetchAll<UserDated>(client, 'hs_collection', 'user_id, updated_at'),
        fetchAll<{ created_by: string; created_at: string }>(client, 'duels', 'created_by, created_at'),
        fetchAll<{ user_id: string; finished_at: string }>(client, 'duel_results', 'user_id, finished_at'),
    ])

    const profileById = new Map(profiles.map((profile) => [profile.id, profile]))
    const statsByUser = new Map<string, StatsMap>()
    const lastActivity = new Map<string, string>()
    const touch = (userId: string, date: string) => lastActivity.set(userId, latest(lastActivity.get(userId), date)!)
    const countBy = <T,>(rows: T[], key: (row: T) => string) => {
        const counts = new Map<string, number>()
        for (const row of rows) counts.set(key(row), (counts.get(key(row)) ?? 0) + 1)
        return counts
    }

    for (const row of progress) {
        touch(row.user_id, row.updated_at)
        const [prefix, mode, variant] = row.key.split(':')
        if (prefix !== 'challenge-stats' || !isChallengeMode(mode) || (variant !== 'daily' && variant !== 'random')) continue
        const map = statsByUser.get(row.user_id) ?? emptyStatsMap()
        map[mode][variant] = row.value as ChallengeStats
        statsByUser.set(row.user_id, map)
    }
    for (const row of decks) touch(row.user_id, row.updated_at)
    for (const row of collection) touch(row.user_id, row.updated_at)
    for (const row of duels) touch(row.created_by, row.created_at)
    for (const row of results) touch(row.user_id, row.finished_at)

    const decksByUser = countBy(decks, (row) => row.user_id)
    const cardsByUser = countBy(collection, (row) => row.user_id)
    const duelsByUser = countBy(duels, (row) => row.created_by)
    const resultsByUser = countBy(results, (row) => row.user_id)
    const modeWins: Record<string, number> = Object.fromEntries(CHALLENGE_MODES.map((mode) => [mode, 0]))

    const adminUsers: AdminUser[] = users.map((user) => {
        const profile = profileById.get(user.id)
        const stats = statsByUser.get(user.id) ?? emptyStatsMap()
        const xp = totalXp(stats)
        let wins = 0
        let bestStreak = 0
        let modesPlayed = 0
        for (const mode of CHALLENGE_MODES) {
            const modeWinsForUser = Object.values(stats[mode]).reduce((sum, entry) => sum + (entry?.wins ?? 0), 0)
            wins += modeWinsForUser
            modeWins[mode] += modeWinsForUser
            if (modeWinsForUser > 0) modesPlayed++
            bestStreak = Math.max(bestStreak, ...Object.values(stats[mode]).map((entry) => entry?.bestStreak ?? 0))
        }
        return {
            id: user.id,
            email: user.email ?? null,
            username: profile?.username ?? null,
            displayName: profile?.display_name ?? null,
            avatarUrl: profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined) ?? null,
            providers: (user.app_metadata?.providers as string[] | undefined) ?? [user.app_metadata?.provider ?? 'email'],
            isPublic: profile?.is_public ?? false,
            confirmed: Boolean(user.email_confirmed_at),
            createdAt: user.created_at,
            lastSignInAt: user.last_sign_in_at ?? null,
            lastActivityAt: latest(lastActivity.get(user.id), user.last_sign_in_at),
            level: getLevelInfo(xp).level,
            xp,
            wins,
            bestStreak,
            modesPlayed,
            decks: decksByUser.get(user.id) ?? 0,
            collectionCards: cardsByUser.get(user.id) ?? 0,
            duelsCreated: duelsByUser.get(user.id) ?? 0,
            duelsPlayed: resultsByUser.get(user.id) ?? 0,
        }
    })

    const now = Date.now()
    const since = (days: number) => new Date(now - days * DAY).toISOString()
    const signups = countBy(adminUsers.filter((user) => user.createdAt >= since(30)), (user) => user.createdAt.slice(0, 10))
    const signupsByDay = Array.from({ length: 30 }, (_, index) => {
        const date = new Date(now - (29 - index) * DAY).toISOString().slice(0, 10)
        return { date, count: signups.get(date) ?? 0 }
    })

    return {
        generatedAt: new Date(now).toISOString(),
        totals: {
            users: adminUsers.length,
            confirmed: adminUsers.filter((user) => user.confirmed).length,
            withUsername: adminUsers.filter((user) => user.username).length,
            publicProfiles: adminUsers.filter((user) => user.username && user.isPublic).length,
            newLast7: adminUsers.filter((user) => user.createdAt >= since(7)).length,
            newLast30: adminUsers.filter((user) => user.createdAt >= since(30)).length,
            activeLast7: adminUsers.filter((user) => (user.lastActivityAt ?? '') >= since(7)).length,
            activeLast30: adminUsers.filter((user) => (user.lastActivityAt ?? '') >= since(30)).length,
            duels: duels.length,
            duelResults: results.length,
            decks: decks.length,
            collectors: cardsByUser.size,
            totalWins: adminUsers.reduce((sum, user) => sum + user.wins, 0),
        },
        modeWins,
        signupsByDay,
        users: adminUsers.sort((a, b) => (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? '')),
    }
}
