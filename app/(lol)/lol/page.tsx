import type { Metadata } from "next";
import AdScript from "../../components/ads/adScript";
import JsonLd from "../../components/jsonLd";
import { LolHome } from "../../components/lol/views";
import { getDateKey, seededFraction } from "../../lib/challenge";
import { getLolData } from "../../lib/lolServer";
import { breadcrumbJsonLd, pageMetadata } from "../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["League of Legends: campeões, itens, runas e LoLdle", "League of Legends: champions, items, runes and LoLdle"],
  description: [
    "Campeões de League of Legends com habilidades, atributos, história e skins, itens de Summoner's Rift, runas e desafios diários no estilo LoLdle.",
    "League of Legends champions with abilities, stats, lore and skins, Summoner's Rift items, runes and LoLdle-style daily challenges.",
  ],
  path: "/lol",
});

export default async function LolPage() {
  const data = await getLolData();
  const start = Math.floor(seededFraction(`lol:${getDateKey()}`) * data.champions.length);
  const featured = Array.from({ length: 16 }, (_, index) => data.champions[(start + index * 11) % data.champions.length]);
  return (
    <>
      <AdScript />
      <LolHome version={data.version} featured={featured} />
      <JsonLd data={breadcrumbJsonLd([['League of Legends', '/lol']])} />
    </>
  );
}
