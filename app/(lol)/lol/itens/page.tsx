import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { ItemIndex } from "../../../components/lol/views";
import { getItems, lolItemSlug } from "../../../lib/lolServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Itens de League of Legends", "League of Legends items"],
  description: [
    "Todos os itens de Summoner's Rift com custo em ouro, atributos, efeitos e receitas.",
    "Every Summoner's Rift item with gold cost, stats, effects and recipes.",
  ],
  path: "/lol/itens",
});

export default async function ItemsPage() {
  const { version, items } = await getItems();
  const slugs = Object.fromEntries(items.map((item) => [item.id, lolItemSlug(item)]));
  return (
    <>
      <AdScript />
      <ItemIndex version={version} items={items} slugs={slugs} />
      <JsonLd data={breadcrumbJsonLd([['League of Legends', '/lol'], ['Itens', '/lol/itens']])} />
    </>
  );
}
