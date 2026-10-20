import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import TeamBuilder from "../../../components/teamBuilder";
import { getTypedPokemon } from "../../../lib/pokemonServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Montador de time Pokémon", "Pokémon team builder"],
  description: ["Monte um time de até 6 Pokémon e veja as fraquezas em comum, a cobertura de ataque e sugestões de tipos para completar o time.", "Build a team of up to 6 Pokémon and see shared weaknesses, offensive coverage and type suggestions to complete the team."],
  path: "/pokemon/time",
});

export default async function TeamBuilderPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { time } = await searchParams;
  const initial = typeof time === 'string' ? time.split(',').map(Number).filter(Number.isInteger) : [];
  const pokemon = await getTypedPokemon();
  return (
    <div className="flex w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <AdScript />
      <TeamBuilder pokemon={pokemon} initial={initial} />
      <JsonLd data={breadcrumbJsonLd([['Pokédex', '/pokemon'], ['Montador de time', '/pokemon/time']])} />
    </div>
  );
}
