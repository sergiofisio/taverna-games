'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "../../context/languageContext";
import type { MessageKey } from "../../i18n/translations";
import { stripLocale } from "../../lib/localePath";

const WORLDS: { href: string; label: MessageKey }[] = [
  { href: '/pokemon', label: 'navPokemon' },
  { href: '/hearthstone', label: 'navHearthstone' },
  { href: '/lol', label: 'navLol' },
  { href: '/animes', label: 'navAnime' },
  { href: '/tcg-pocket', label: 'navTcg' },
  { href: '/yu-gi-oh', label: 'navYgo' },
]

const LINKS: { href: string; label: MessageKey }[] = [
  { href: '/desafios', label: 'navChallenges' },
  { href: '/duelo', label: 'navDuel' },
  { href: '/guias', label: 'guidesTitle' },
]

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`)
const itemClass = (active: boolean) =>
  `relative shrink-0 rounded-md px-2.5 py-1 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${active ? 'text-zinc-900' : 'hover:bg-white/20'}`

export default function MainNav() {
  const pathname = stripLocale(usePathname())
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const world = WORLDS.find(({ href }) => isActive(pathname, href))

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) setOpen(false) }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <nav aria-label={t('mainNav')} className="flex items-center rounded-lg border border-white/40 p-0.5">
      <div ref={menuRef} className="relative shrink-0">
        <button type="button" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((value) => !value)} className={`${itemClass(Boolean(world))} flex items-center gap-1`}>
          {world && <motion.span layoutId="nav-indicator" className="absolute inset-0 rounded-md bg-white" />}
          <span className="relative">{world ? t(world.label) : t('navWorlds')}</span>
          <span aria-hidden="true" className={`relative text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {open && (
          <ul id={menuId} className="absolute top-full left-0 z-50 mt-2 flex min-w-48 flex-col gap-0.5 rounded-xl bg-white p-1.5 text-zinc-900 shadow-xl ring-1 ring-black/10 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10">
            {WORLDS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(pathname, href) ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2 text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isActive(pathname, href) ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
                >
                  {t(label)}
                </Link>
              </li>
            ))}
            {LINKS.map(({ href, label }, index) => (
              <li key={href} className={`sm:hidden ${index === 0 ? 'mt-1 border-t border-zinc-200 pt-1 dark:border-zinc-700' : ''}`}>
                <Link href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800">{t(label)}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex max-w-[34vw] overflow-x-auto [scrollbar-width:none] max-sm:hidden">
        {LINKS.map(({ href, label }) => {
          const active = isActive(pathname, href)
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={itemClass(active)}>
              {active && <motion.span layoutId="nav-indicator" className="absolute inset-0 rounded-md bg-white" />}
              <span className="relative">{t(label)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
