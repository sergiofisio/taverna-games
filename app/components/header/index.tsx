'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../themeToggle";
import LanguageToggle from "../languageToggle";
import MainNav from "../mainNav";
import SiteEmblem from "../siteEmblem";
import UserMenu from "../userMenu";
import { SITE_NAME, getWorld, type World } from "../../lib/site";

const WORLD_STYLES: Record<World, string> = {
  pokemon: 'border-red-900 bg-red-600 dark:bg-red-800',
  hearthstone: 'border-amber-950 bg-linear-to-r from-amber-900 via-amber-800 to-amber-900',
  lol: 'border-[#785a28] bg-linear-to-r from-[#010a13] via-[#0a3a4a] to-[#010a13]',
  anime: 'border-pink-900 bg-linear-to-r from-fuchsia-800 via-purple-800 to-pink-700',
  tcg: 'border-sky-900 bg-linear-to-r from-sky-700 via-indigo-700 to-sky-600',
  ygo: 'border-amber-900 bg-linear-to-r from-violet-950 via-purple-900 to-amber-700',
  neutral: 'border-zinc-950 bg-linear-to-r from-red-700 via-zinc-900 to-amber-800',
}

export default function Header() {
  const world = getWorld(usePathname())

  return (
    <header className={`w-full border-b-4 px-4 text-white shadow-md transition-colors ${WORLD_STYLES[world]}`}>
      <div className="container mx-auto flex h-16 items-center justify-between gap-3">
        <h1 className="shrink-0 text-2xl font-black tracking-tight">
          <Link href="/" className="flex items-center gap-2">
            <SiteEmblem className="size-10 drop-shadow-md" />
            <span className="whitespace-nowrap max-lg:sr-only">{SITE_NAME}</span>
          </Link>
        </h1>
        <div className="flex items-center gap-2">
          <MainNav />
          <LanguageToggle />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
