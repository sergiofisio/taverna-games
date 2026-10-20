import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { MoveIndex } from "../../../components/moveViews";
import { getMovesByType } from "../../../lib/movesServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Golpes Pokémon por tipo", "Pokémon moves by type"],
  description: ["Lista de todos os golpes Pokémon separados por tipo, com poder, precisão, PP, efeitos e os Pokémon que aprendem cada um.", "Every Pokémon move grouped by type, with power, accuracy, PP, effects and the Pokémon that learn each one."],
  path: "/pokemon/golpes",
});

export default async function MovesPage() {
  const groups = await getMovesByType();
  return (
    <div className="flex w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <AdScript />
      <MoveIndex groups={groups} />
      <JsonLd data={breadcrumbJsonLd([['Pokédex', '/pokemon'], ['Golpes', '/pokemon/golpes']])} />
    </div>
  );
}
