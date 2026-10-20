import type { Metadata } from "next";
import AdScript from "../../components/ads/adScript";
import JsonLd from "../../components/jsonLd";
import { TcgpHome } from "../../components/tcgp/views";
import { getTcgpData } from "../../lib/tcgpServer";
import { breadcrumbJsonLd, pageMetadata } from "../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Pokémon TCG Pocket: cartas, coleções, pacotes e decks", "Pokémon TCG Pocket: cards, sets, packs and decks"],
  description: [
    "Todas as cartas do Pokémon TCG Pocket em português, com coleções, raridades, simulador de pacotes, montador de decks de 20 cartas e o Pocketdle diário.",
    "Every Pokémon TCG Pocket card, with sets, rarities, a pack simulator, a 20-card deck builder and the daily Pocketdle.",
  ],
  path: "/tcg-pocket",
});

export default async function TcgpHomePage() {
  const data = await getTcgpData();
  return (
    <>
      <AdScript />
      <TcgpHome sets={data.sets} />
      <JsonLd data={breadcrumbJsonLd([['Pokémon TCG Pocket', '/tcg-pocket']])} />
    </>
  );
}
