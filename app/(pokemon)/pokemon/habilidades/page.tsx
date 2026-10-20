import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { AbilityIndex } from "../../../components/moveViews";
import { getAbilityList } from "../../../lib/movesServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Habilidades Pokémon de A a Z", "Pokémon abilities from A to Z"],
  description: ["Todas as habilidades Pokémon com o efeito de cada uma e a lista de Pokémon que podem ter a habilidade, inclusive como habilidade oculta.", "Every Pokémon ability with its effect and the list of Pokémon that can have it, including as a hidden ability."],
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
