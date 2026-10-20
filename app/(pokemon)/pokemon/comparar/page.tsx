import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { CompareHome } from "../../../components/pokemonCompare";
import { getPokemonList } from "../../../lib/pokemonServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const revalidate = 2592000;

export const metadata: Metadata = pageMetadata({
  title: "Comparador de Pokémon",
  description: "Compare dois Pokémon lado a lado: atributos base, tipos, velocidade e vantagem de tipo em batalha.",
  path: "/pokemon/comparar",
});

export default async function ComparePage() {
  const list = await getPokemonList();
  return (
    <div className="flex w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <AdScript />
      <CompareHome list={list} />
      <JsonLd data={breadcrumbJsonLd([['Pokédex', '/pokemon'], ['Comparador', '/pokemon/comparar']])} />
    </div>
  );
}
