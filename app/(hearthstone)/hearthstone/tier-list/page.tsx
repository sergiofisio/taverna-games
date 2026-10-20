import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import TierListView, { type TierListData } from "../../../components/hearthstone/tierList";
import META_DECKS from "../../../data/hs-meta-decks.json";
import TIER_LIST from "../../../data/hs-tier-list.json";
import { craftCost } from "../../../lib/hearthstone";
import { getHsServerData } from "../../../lib/hsServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

type TierSource = { updated: string | null; format: string; note: [string, string]; tiers: { tier: string; decks: { name: string; note?: [string, string] }[] }[] };

const source = TIER_LIST as unknown as TierSource;

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Tier list de decks do Hearthstone", "Hearthstone deck tier list"],
  description: ["Os melhores decks de Hearthstone da semana separados por tier, com custo em pó e código para importar no jogo.", "This week’s best Hearthstone decks by tier, with dust cost and a code to import into the game."],
  path: "/hearthstone/tier-list",
});

async function load(): Promise<TierListData | null> {
  if (!source.updated || !source.tiers.length) return null;
  const data = await getHsServerData();
  const tiers = source.tiers.map(({ tier, decks }) => ({
    tier,
    decks: decks.flatMap(({ name, note }) => {
      const meta = META_DECKS.find((deck) => deck.name === name);
      if (!meta) return [];
      const dust = meta.cards.reduce((sum, [id, count]) => {
        const card = data.byDbf.get(id);
        return sum + (card ? craftCost(card) * count : 0);
      }, 0);
      return [{ name: meta.name, cls: meta.class, code: meta.code, dust, note: note ?? ['', ''] as [string, string] }];
    }),
  })).filter(({ decks }) => decks.length);
  return tiers.length ? { updated: source.updated, format: source.format, note: source.note, tiers } : null;
}

export default async function TierListPage() {
  const data = await load();
  if (!data) notFound();
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <AdScript />
      <TierListView data={data} />
      <JsonLd data={breadcrumbJsonLd([['Hearthstone', '/hearthstone'], ['Tier list', '/hearthstone/tier-list']])} />
    </div>
  );
}
