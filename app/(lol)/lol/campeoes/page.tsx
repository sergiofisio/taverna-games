import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { ChampionIndex } from "../../../components/lol/views";
import { getLolData } from "../../../lib/lolServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Campeões de League of Legends", "League of Legends champions"],
  description: [
    "Todos os campeões de League of Legends por classe, com habilidades, atributos base, história, dicas e skins.",
    "Every League of Legends champion by class, with abilities, base stats, lore, tips and skins.",
  ],
  path: "/lol/campeoes",
});

export default async function ChampionsPage() {
  const data = await getLolData();
  return (
    <>
      <AdScript />
      <ChampionIndex version={data.version} champions={data.champions} />
      <JsonLd data={breadcrumbJsonLd([['League of Legends', '/lol'], ['Campeões', '/lol/campeoes']])} />
    </>
  );
}
