import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import JsonLd from "../../../../components/jsonLd";
import { ChampionView } from "../../../../components/lol/views";
import { championPath } from "../../../../lib/lol";
import { getChampionPage } from "../../../../lib/lolServer";
import { championMetaDescription } from "../../../../lib/lolText";
import { breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";

type Props = { params: Promise<{ campeao: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getChampionPage((await params).campeao);
  if (!page) return {};
  const { champion } = page;
  return pageMetadata({
    title: [`${champion.n[0]}: habilidades, atributos, história e skins`, `${champion.n[1]}: abilities, stats, lore and skins`],
    description: [championMetaDescription(champion, 'pt'), championMetaDescription(champion, 'en')],
    path: championPath(champion),
    ownImage: true,
  });
}

export default async function ChampionPage({ params }: Props) {
  const page = await getChampionPage((await params).campeao);
  if (!page) notFound();
  return (
    <>
      <AdScript />
      <ChampionView page={page} />
      <JsonLd data={breadcrumbJsonLd([['League of Legends', '/lol'], ['Campeões', '/lol/campeoes'], [page.champion.n[0], championPath(page.champion)]])} />
    </>
  );
}
