import type { MetadataRoute } from "next";
import { CHALLENGE_MODES } from "./lib/challenge";
import { GUIDES } from "./lib/guides";
import { getSetSummaries } from "./lib/hsServer";
import { getTypedPokemon } from "./lib/pokemonServer";
import { allCombos, comboPath, hasSameTypes } from "./lib/typeCombos";
import { absoluteUrl } from "./lib/seo";

type Entry = [path: string, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], priority: number]

const PAGES: Entry[] = [
  ['/', 'weekly', 1],
  ['/pokemon', 'monthly', 0.9],
  ['/hearthstone', 'weekly', 0.9],
  ['/hearthstone/cartas', 'weekly', 0.9],
  ['/hearthstone/colecoes', 'monthly', 0.8],
  ['/hearthstone/decks', 'weekly', 0.8],
  ['/hearthstone/colecao', 'monthly', 0.5],
  ['/desafios', 'daily', 0.9],
  ...CHALLENGE_MODES.map((mode): Entry => [`/desafios/${mode}`, 'daily', 0.8]),
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
  const [pokemon, sets] = await Promise.all([
    getTypedPokemon().catch(() => []),
    getSetSummaries().catch(() => []),
  ])
  const combos = allCombos().filter((types) => pokemon.some((entry) => hasSameTypes(entry.types, types)))
  const entries: Entry[] = [
    ...PAGES,
    ['/pokemon/tipos', 'monthly', 0.8],
    ...combos.map((types): Entry => [comboPath(types), 'monthly', 0.6]),
    ...pokemon.map(({ slug }): Entry => [`/pokemon/${slug}`, 'monthly', 0.7]),
    ...sets.map(({ slug }): Entry => [`/hearthstone/colecoes/${slug}`, 'monthly', 0.6]),
  ]
  return entries.map(([path, changeFrequency, priority]) => ({ url: absoluteUrl(path), lastModified, changeFrequency, priority }))
}
