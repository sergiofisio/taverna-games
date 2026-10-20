import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { AbilityIndex } from "../../../components/moveViews";
import { getAbilityList } from "../../../lib/movesServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const revalidate = 2592000;

export const metadata: Metadata = pageMetadata({
  title: "Habilidades Pokémon de A a Z",
  description: "Todas as habilidades Pokémon com o efeito de cada uma e a lista de Pokémon que podem ter a habilidade, inclusive como habilidade oculta.",
  path: "/pokemon/habilidades",
});

export default async function AbilitiesPage() {
  const abilities = await getAbilityList();
  return (
    <div className="flex w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <AdScript />
      <AbilityIndex abilities={abilities} />
      <JsonLd data={breadcrumbJsonLd([['Pokédex', '/pokemon'], ['Habilidades', '/pokemon/habilidades']])} />
    </div>
  );
}
