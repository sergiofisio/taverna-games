import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { TypeCalculator } from "../../../components/typeTools";
import { getTypedPokemon } from "../../../lib/pokemonServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Calculadora de fraquezas Pokémon", "Pokémon weakness calculator"],
  description: ["Escolha um ou dois tipos e veja na hora as fraquezas, resistências e imunidades da combinação, além de todos os Pokémon com esses tipos.", "Pick one or two types and instantly see the combination’s weaknesses, resistances and immunities, plus every Pokémon with those types."],
  path: "/pokemon/tipos",
});

export default async function TypeCalculatorPage() {
  const pokemon = await getTypedPokemon();
  return (
    <div className="flex w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <AdScript />
      <TypeCalculator pokemon={pokemon} />
      <JsonLd data={breadcrumbJsonLd([['Pokédex', '/pokemon'], ['Calculadora de fraquezas', '/pokemon/tipos']])} />
    </div>
  );
}
