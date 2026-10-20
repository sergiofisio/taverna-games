import type { MetadataRoute } from "next";
import TIER_LIST from "./data/hs-tier-list.json";
import { CHALLENGE_MODES } from "./lib/challenge";
import { GUIDES } from "./lib/guides";
import { getSetSummaries } from "./lib/hsServer";
import { championPath } from "./lib/lol";
import { getLolData } from "./lib/lolServer";
import { getTypedPokemon } from "./lib/pokemonServer";
import { allCombos, comboPath, hasSameTypes } from "./lib/typeCombos";
import { localePath } from "./lib/localePath";
import { absoluteUrl } from "./lib/seo";

type Entry = [path: string, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], priority: number]

const PAGES: Entry[] = [
  ['/', 'weekly', 1],
  ['/pokemon', 'monthly', 0.9],
  ['/hearthstone', 'weekly', 0.9],
  ['/hearthstone/cartas', 'weekly', 0.9],
  ['/hearthstone/colecoes', 'monthly', 0.8],
  ['/hearthstone/decks', 'weekly', 0.8],
  ['/hearthstone/pacotes', 'monthly', 0.7],
  ['/hearthstone/campos-de-batalha', 'weekly', 0.8],
  ['/hearthstone/colecao', 'monthly', 0.5],
  ['/desafios', 'daily', 0.9],
  ...CHALLENGE_MODES.map((mode): Entry => [`/desafios/${mode}`, 'daily', 0.8]),
  ['/lol', 'weekly', 0.9],
  ['/lol/campeoes', 'weekly', 0.9],
  ['/lol/itens', 'monthly', 0.7],
  ['/lol/runas', 'monthly', 0.7],
  ['/guias', 'monthly', 0.8],
  ...GUIDES.map(({ slug }): Entry => [`/guias/${slug}`, 'monthly', 0.8]),
  ['/sobre', 'yearly', 0.5],
  ['/duelo', 'monthly', 0.6],
  ['/apoiar', 'yearly', 0.3],
  ['/privacidade', 'yearly', 0.2],
  ['/termos', 'yearly', 0.2],
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const [pokemon, sets, lol] = await Promise.all([
    getTypedPokemon().catch(() => []),
    getSetSummaries().catch(() => []),
    getLolData().then(({ champions }) => champions).catch(() => []),
  ])
  const combos = allCombos().filter((types) => pokemon.some((entry) => hasSameTypes(entry.types, types)))
  const entries: Entry[] = [
    ...PAGES,
    ...(TIER_LIST.updated ? [['/hearthstone/tier-list', 'weekly', 0.8] as Entry] : []),
    ['/pokemon/tipos', 'monthly', 0.8],
    ['/pokemon/time', 'monthly', 0.8],
    ['/pokemon/comparar', 'monthly', 0.7],
    ['/pokemon/golpes', 'monthly', 0.7],
    ['/pokemon/habilidades', 'monthly', 0.7],
    ...combos.map((types): Entry => [comboPath(types), 'monthly', 0.6]),
    ...pokemon.map(({ slug }): Entry => [`/pokemon/${slug}`, 'monthly', 0.7]),
    ...sets.map(({ slug }): Entry => [`/hearthstone/colecoes/${slug}`, 'monthly', 0.6]),
    ...lol.map((champion): Entry => [championPath(champion), 'monthly', 0.7]),
  ]
  return entries.map(([path, changeFrequency, priority]) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: { 'pt-BR': absoluteUrl(localePath(path, 'pt')), en: absoluteUrl(localePath(path, 'en')) } },
  }))
}
