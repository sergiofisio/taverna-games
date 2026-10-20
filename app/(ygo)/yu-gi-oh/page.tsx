import type { Metadata } from "next";
import AdScript from "../../components/ads/adScript";
import JsonLd from "../../components/jsonLd";
import { YgoHome } from "../../components/ygo/views";
import { breadcrumbJsonLd, pageMetadata } from "../../lib/seo";
import { getYgoArchetypes, getYgoData, getYgoSets } from "../../lib/ygoServer";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Yu-Gi-Oh!: cartas em português, arquétipos, banlist e decks", "Yu-Gi-Oh!: cards, archetypes, banlist and decks"],
  description: [
    "Todas as cartas de Yu-Gi-Oh! com o texto oficial em português, arquétipos, lista de proibidas e limitadas, coleções, simulador de pacotes, montador de decks e o Ygodle diário.",
    "Every Yu-Gi-Oh! card with official texts, archetypes, the Forbidden & Limited List, sets, a pack simulator, deck builder and the daily Ygodle.",
  ],
  path: "/yu-gi-oh",
});

export default async function YgoHomePage() {
  const [data, archetypes, sets] = await Promise.all([getYgoData(), getYgoArchetypes(), getYgoSets()]);
  return (
    <>
      <AdScript />
      <YgoHome
        stats={{ cards: data.cards.length, archetypes: archetypes.length, sets: sets.sets.length }}
        popular={data.cards.slice(0, 12)}
        archetypes={archetypes.slice(0, 30).map(({ name, slug, cards }) => ({ name, slug, count: cards.length }))}
        latest={sets.sets.slice(-8).reverse().map(({ s, n, d, t }) => ({ s, n, d, t }))}
      />
      <JsonLd data={breadcrumbJsonLd([['Yu-Gi-Oh!', '/yu-gi-oh']])} />
    </>
  );
}
