import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { TcgpSetIndex } from "../../../components/tcgp/views";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";
import { getTcgpData } from "../../../lib/tcgpServer";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Coleções do Pokémon TCG Pocket", "Pokémon TCG Pocket sets"],
  description: ["Todas as coleções e pacotes do Pokémon TCG Pocket, com data de lançamento e as cartas de cada uma.", "Every Pokémon TCG Pocket set and booster, with release dates and each one's cards."],
  path: "/tcg-pocket/colecoes",
});

export default async function TcgpSetsPage() {
  const data = await getTcgpData();
  return (
    <>
      <AdScript />
      <TcgpSetIndex sets={data.sets} />
      <JsonLd data={breadcrumbJsonLd([['Pokémon TCG Pocket', '/tcg-pocket'], ['Coleções', '/tcg-pocket/colecoes']])} />
    </>
  );
}
