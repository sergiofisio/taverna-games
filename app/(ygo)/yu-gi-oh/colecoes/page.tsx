import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import { YgoSetIndex } from "../../../components/ygo/views";
import { pageMetadata } from "../../../lib/seo";
import { isBoosterSet } from "../../../lib/ygo";
import { getYgoSets } from "../../../lib/ygoServer";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Coleções de Yu-Gi-Oh!: boosters e decks", "Yu-Gi-Oh! sets: boosters and decks"],
  description: [
    "Todas as coleções de Yu-Gi-Oh! do TCG, de Legend of Blue Eyes White Dragon aos boosters mais recentes, com as cartas e raridades de cada uma.",
    "Every Yu-Gi-Oh! TCG set, from Legend of Blue Eyes White Dragon to the newest boosters, with each one's cards and rarities.",
  ],
  path: "/yu-gi-oh/colecoes",
});

export default async function YgoSetsPage() {
  const { sets } = await getYgoSets();
  return (
    <>
      <AdScript />
      <YgoSetIndex sets={[...sets].reverse().map((set) => ({ c: set.c, s: set.s, n: set.n, d: set.d, t: set.t, booster: isBoosterSet(set) }))} />
    </>
  );
}
