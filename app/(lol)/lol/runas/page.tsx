import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { RunesView } from "../../../components/lol/views";
import { getRunes } from "../../../lib/lolServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Runas de League of Legends", "League of Legends runes"],
  description: [
    "As cinco árvores de runas de League of Legends, com a runa principal e o efeito de cada runa.",
    "The five League of Legends rune trees, with keystones and the effect of every rune.",
  ],
  path: "/lol/runas",
});

export default async function RunesPage() {
  const trees = await getRunes();
  return (
    <>
      <AdScript />
      <RunesView trees={trees} />
      <JsonLd data={breadcrumbJsonLd([['League of Legends', '/lol'], ['Runas', '/lol/runas']])} />
    </>
  );
}
