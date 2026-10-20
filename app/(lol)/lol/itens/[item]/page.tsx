import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import JsonLd from "../../../../components/jsonLd";
import { ItemView } from "../../../../components/lol/views";
import { getItemPage, getItems, lolItemSlug } from "../../../../lib/lolServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";

type Props = { params: Promise<{ item: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getItemPage((await params).item);
  if (!page) return {};
  const { item } = page;
  return pageMetadata({
    title: [`${item.n[0]}: item de League of Legends`, `${item.n[1]}: League of Legends item`],
    description: [
      `${item.n[0]} custa ${item.gold} de ouro. ${item.d[0].replace(/\n/g, ' ')}`.slice(0, 300),
      `${item.n[1]} costs ${item.gold} gold. ${item.d[1].replace(/\n/g, ' ')}`.slice(0, 300),
    ],
    path: `/lol/itens/${page.slug}`,
  });
}

export default async function ItemPage({ params }: Props) {
  const { item: slug } = await params;
  const page = await getItemPage(slug);
  if (!page) notFound();
  if (page.slug !== slug) permanentRedirect(`/lol/itens/${page.slug}`);
  const { items } = await getItems();
  const slugs = Object.fromEntries(items.map((item) => [item.id, lolItemSlug(item)]));
  return (
    <>
      <AdScript />
      <ItemView version={page.version} item={page.item} from={page.from} into={page.into} slugs={slugs} />
      <JsonLd data={breadcrumbJsonLd([['League of Legends', '/lol'], ['Itens', '/lol/itens'], [page.item.n[0], `/lol/itens/${page.slug}`]])} />
    </>
  );
}
