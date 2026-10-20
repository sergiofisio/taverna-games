import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import { YgoArchetypeIndex } from "../../../components/ygo/views";
import { pageMetadata } from "../../../lib/seo";
import { getYgoArchetypes } from "../../../lib/ygoServer";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Arquétipos de Yu-Gi-Oh!", "Yu-Gi-Oh! archetypes"],
  description: [
    "Todos os arquétipos de Yu-Gi-Oh!, de Mago Negro e Olhos Azuis aos mais recentes, com a lista de monstros, magias e armadilhas de cada um.",
    "Every Yu-Gi-Oh! archetype, from Dark Magician and Blue-Eyes to the newest ones, with each one's monsters, Spells and Traps.",
  ],
  path: "/yu-gi-oh/arquetipos",
});

export default async function YgoArchetypesPage() {
  const archetypes = await getYgoArchetypes();
  return (
    <>
      <AdScript />
      <YgoArchetypeIndex archetypes={archetypes.map(({ name, slug, cards }) => ({ name, slug, count: cards.length, cover: cards[0] }))} />
    </>
  );
}
