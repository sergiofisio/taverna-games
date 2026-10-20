'use client'

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../../context/authContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useLanguage } from "../../context/languageContext";
import { getSupabase } from "../../lib/supabase";
import type { AdminOverview, AdminUser } from "../../lib/adminServer";
import type { ChallengeMode } from "../../lib/challenge";
import { MODE_META } from "../challenge/modes";

type Result =
    | { status: 'hidden' }
    | { status: 'ready'; data: AdminOverview }

type SortKey = 'lastActivityAt' | 'createdAt' | 'level' | 'wins' | 'decks' | 'duelsPlayed' | 'username'

const COLUMNS: { key: SortKey; label: string }[] = [
    { key: 'username', label: 'Usuário' },
    { key: 'level', label: 'Nível' },
    { key: 'wins', label: 'Vitórias' },
    { key: 'decks', label: 'Decks' },
    { key: 'duelsPlayed', label: 'Duelos' },
    { key: 'createdAt', label: 'Cadastro' },
    { key: 'lastActivityAt', label: 'Última atividade' },
]

const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const DATE = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const RELATIVE = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

function relative(date: string | null) {
    if (!date) return 'nunca'
    const minutes = Math.round((new Date(date).getTime() - Date.now()) / 60000)
    if (Math.abs(minutes) < 60) return RELATIVE.format(minutes, 'minute')
    const hours = Math.round(minutes / 60)
    if (Math.abs(hours) < 24) return RELATIVE.format(hours, 'hour')
    const days = Math.round(hours / 24)
    if (Math.abs(days) < 30) return RELATIVE.format(days, 'day')
    return RELATIVE.format(Math.round(days / 30), 'month')
}

function Hidden() {
    return (
        <div className="flex flex-1 items-center justify-center p-10 text-center">
            <p className="text-lg"><span className="mr-3 border-r border-current pr-3 font-black">404</span>Página não encontrada.</p>
        </div>
    )
}

function Kpi({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
    return (
        <div className="rounded-2xl bg-white p-4 shadow dark:bg-zinc-900">
            <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
            <p className="text-3xl font-black">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</p>
            {hint && <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
        </div>
    )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow dark:bg-zinc-900">
            <h2 className="text-lg font-black">{title}</h2>
            {children}
        </section>
    )
}

async function loadOverview(): Promise<Result> {
    const { data } = await getSupabase().auth.getSession()
    const token = data.session?.access_token
    if (!token) return { status: 'hidden' }
    const response = await fetch('/api/admin/overview', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
    if (response.status === 404) return { status: 'hidden' }
    if (!response.ok) throw new Error(`admin ${response.status}`)
    return { status: 'ready', data: await response.json() as AdminOverview }
}

export default function AdminDashboard() {
    const { user, loading } = useAuth()
    const [version, setVersion] = useState(0)
    const result = useAsyncData(user ? `${user.id}:${version}` : 'anonymous', loadOverview)
    const refresh = () => setVersion((value) => value + 1)

    if (!loading && !user) return <Hidden />
    if (loading || !result) return <div className="flex-1 p-10 text-center text-zinc-500">…</div>
    if (result.status === 'error') {
        return (
            <div className="mx-auto flex max-w-xl flex-col items-center gap-3 p-10 text-center">
                <p>Não foi possível carregar os dados.</p>
                <button type="button" onClick={refresh} className="rounded-full bg-red-600 px-4 py-2 font-bold text-white">Tentar de novo</button>
            </div>
        )
    }
    const state = result.data
    if (state.status === 'hidden') return <Hidden />
    return <Dashboard data={state.data} onRefresh={refresh} />
}

function Dashboard({ data, onRefresh }: { data: AdminOverview; onRefresh: () => void }) {
    const { t } = useLanguage()
    const [query, setQuery] = useState('')
    const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'lastActivityAt', desc: true })
    const [selected, setSelected] = useState<AdminUser | null>(null)
    const { totals } = data
    const peak = Math.max(1, ...data.signupsByDay.map(({ count }) => count))
    const modes = Object.entries(data.modeWins).sort((a, b) => b[1] - a[1])
    const modePeak = Math.max(1, ...modes.map(([, wins]) => wins))

    const users = useMemo(() => {
        const normalized = normalizeSearch(query)
        const filtered = normalized
            ? data.users.filter((user) => [user.username, user.displayName, user.email].some((value) => value && normalizeSearch(value).includes(normalized)))
            : data.users
        const value = (user: AdminUser) => user[sort.key] ?? ''
        return [...filtered].sort((a, b) => {
            const left = value(a)
            const right = value(b)
            const order = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))
            return sort.desc ? -order : order
        })
    }, [data.users, query, sort])

    const toggleSort = (key: SortKey) => setSort((current) => ({ key, desc: current.key === key ? !current.desc : key !== 'username' }))

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-black">Painel</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Atualizado em {DATE.format(new Date(data.generatedAt))}</p>
                </div>
                <button type="button" onClick={onRefresh} className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Atualizar</button>
            </header>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
                <Kpi label="Usuários" value={totals.users} hint={`${totals.confirmed} com e-mail confirmado`} />
                <Kpi label="Novos (7 dias)" value={totals.newLast7} hint={`${totals.newLast30} em 30 dias`} />
                <Kpi label="Ativos (7 dias)" value={totals.activeLast7} hint={`${totals.activeLast30} em 30 dias`} />
                <Kpi label="Com nome de usuário" value={totals.withUsername} hint={`${totals.publicProfiles} perfis públicos`} />
                <Kpi label="Vitórias em desafios" value={totals.totalWins} />
                <Kpi label="Duelos" value={totals.duels} hint={`${totals.duelResults} partidas jogadas`} />
                <Kpi label="Decks salvos" value={totals.decks} />
                <Kpi label="Usam a coleção" value={totals.collectors} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Cadastros nos últimos 30 dias">
                    <div className="flex h-36 items-end gap-1">
                        {data.signupsByDay.map(({ date, count }) => (
                            <div key={date} title={`${date.split('-').reverse().join('/')}: ${count}`} className="flex flex-1 flex-col items-center justify-end">
                                <div className="w-full rounded-t bg-red-500" style={{ height: `${(count / peak) * 100}%`, minHeight: count ? 4 : 1 }} />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Passe o mouse sobre as barras para ver o dia.</p>
                </Panel>
                <Panel title="Vitórias por modo">
                    <ul className="flex flex-col gap-1.5 text-sm">
                        {modes.map(([mode, wins]) => (
                            <li key={mode} className="grid grid-cols-[9rem_1fr_3rem] items-center gap-2">
                                <span className="truncate font-bold">{t(MODE_META[mode as ChallengeMode].title)}</span>
                                <span className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                                    <span className="block h-full rounded-full bg-red-500" style={{ width: `${(wins / modePeak) * 100}%` }} />
                                </span>
                                <span className="text-right font-mono">{wins}</span>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>

            <Panel title={`Usuários (${users.length})`}>
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por nome, usuário ou e-mail"
                    className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
                />
                <div className="overflow-x-auto">
                    <table className="w-full min-w-4xl text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                {COLUMNS.map((column) => (
                                    <th key={column.key} scope="col" className="p-2">
                                        <button type="button" onClick={() => toggleSort(column.key)} className="font-black hover:underline">
                                            {column.label}{sort.key === column.key ? (sort.desc ? ' ↓' : ' ↑') : ''}
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} onClick={() => setSelected(user)} className="cursor-pointer border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60">
                                    <td className="p-2">
                                        <div className="flex items-center gap-2">
                                            {user.avatarUrl
                                                ? <Image src={user.avatarUrl} alt="" width={32} height={32} unoptimized className="size-8 rounded-full object-cover" />
                                                : <span className="flex size-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-black dark:bg-zinc-700">{(user.username ?? user.email ?? '?').slice(0, 1).toUpperCase()}</span>}
                                            <div className="min-w-0">
                                                <p className="truncate font-bold">{user.username ?? user.displayName ?? '—'}</p>
                                                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-2 font-mono">{user.level} <span className="text-xs text-zinc-500">({user.xp.toLocaleString('pt-BR')} XP)</span></td>
                                    <td className="p-2 font-mono">{user.wins}</td>
                                    <td className="p-2 font-mono">{user.decks}</td>
                                    <td className="p-2 font-mono">{user.duelsPlayed}</td>
                                    <td className="p-2" title={DATE.format(new Date(user.createdAt))}>{relative(user.createdAt)}</td>
                                    <td className="p-2" title={user.lastActivityAt ? DATE.format(new Date(user.lastActivityAt)) : ''}>{relative(user.lastActivityAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>

            {selected && <UserDetail user={selected} onClose={() => setSelected(null)} />}
        </div>
    )
}

function UserDetail({ user, onClose }: { user: AdminUser; onClose: () => void }) {
    const format = (date: string | null) => (date ? `${DATE.format(new Date(date))} (${relative(date)})` : 'nunca')
    const rows: [string, ReactNode][] = [
        ['E-mail', `${user.email ?? '—'}${user.confirmed ? '' : ' (não confirmado)'}`],
        ['Nome de exibição', user.displayName ?? '—'],
        ['Login por', user.providers.join(', ')],
        ['Perfil', user.username ? (user.isPublic ? 'público' : 'privado') : 'sem nome de usuário'],
        ['Cadastro', format(user.createdAt)],
        ['Último login', format(user.lastSignInAt)],
        ['Última atividade', format(user.lastActivityAt)],
        ['Nível', `${user.level} (${user.xp.toLocaleString('pt-BR')} XP)`],
        ['Vitórias', `${user.wins} em ${user.modesPlayed} modos · melhor sequência ${user.bestStreak}`],
        ['Hearthstone', `${user.decks} decks · ${user.collectionCards} cartas na coleção`],
        ['Duelos', `${user.duelsCreated} criados · ${user.duelsPlayed} jogados`],
        ['ID', <code key="id" className="text-xs">{user.id}</code>],
    ]
    return (
        <div role="dialog" aria-modal="true" aria-label={user.username ?? user.email ?? 'Usuário'} onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <h2 className="text-xl font-black">{user.username ?? user.displayName ?? user.email}</h2>
                    <button type="button" onClick={onClose} aria-label="Fechar" className="text-2xl leading-none">×</button>
                </div>
                <dl className="flex flex-col gap-1.5 text-sm">
                    {rows.map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[9rem_1fr] gap-2">
                            <dt className="font-bold text-zinc-500 dark:text-zinc-400">{label}</dt>
                            <dd className="wrap-break-words">{value}</dd>
                        </div>
                    ))}
                </dl>
                {user.username && user.isPublic && (
                    <Link href={`/u/${user.username}`} className="mt-4 inline-block font-bold text-red-600 hover:underline dark:text-red-400">Ver perfil público →</Link>
                )}
            </div>
        </div>
    )
}
