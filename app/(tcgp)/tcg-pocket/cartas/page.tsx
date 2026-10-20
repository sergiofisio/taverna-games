import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import { TcgpLibrary } from "../../../components/tcgp/views";
import { pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Cartas do Pokémon TCG Pocket", "Pokémon TCG Pocket cards"],
  description: [
    "Busque todas as cartas do Pokémon TCG Pocket por coleção, tipo, raridade e categoria, com ataques, habilidades e fraquezas.",
    "Search every Pokémon TCG Pocket card by set, type, rarity and category, with attacks, abilities and weaknesses.",
  ],
  path: "/tcg-pocket/cartas",
});

export default function TcgpCardsPage() {
  return (
    <>
      <AdScript />
      <TcgpLibrary />
    </>
  );
}
