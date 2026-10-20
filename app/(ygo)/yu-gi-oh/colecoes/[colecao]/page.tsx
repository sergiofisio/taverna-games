import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import JsonLd from "../../../../components/jsonLd";
import { YgoSetView } from "../../../../components/ygo/views";
import { breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";
import { ygoSetPath } from "../../../../lib/ygo";
import { describeYgoSet, getYgoSetPage } from "../../../../lib/ygoServer";

type Props = { params: Promise<{ colecao: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getYgoSetPage((await params).colecao);
  if (!page) return {};
  return pageMetadata({
    title: [`${page.set.n} (${page.set.c}): lista de cartas de Yu-Gi-Oh!`, `${page.set.n} (${page.set.c}): Yu-Gi-Oh! card list`],
    description: [describeYgoSet(page.set, page.cards, page.rarities, 'pt').slice(0, 2).join(' '), describeYgoSet(page.set, page.cards, page.rarities, 'en').slice(0, 2).join(' ')],
    path: ygoSetPath(page.set),
    noIndex: !page.booster,
  });
}

export default async function YgoSetPage({ params }: Props) {
  const page = await getYgoSetPage((await params).colecao);
  if (!page) notFound();
  return (
    <>
      <AdScript />
      <YgoSetView set={page.set} cards={page.cards} booster={page.booster} rarities={page.rarities} about={[describeYgoSet(page.set, page.cards, page.rarities, 'pt'), describeYgoSet(page.set, page.cards, page.rarities, 'en')]} />
      <JsonLd data={breadcrumbJsonLd([['Yu-Gi-Oh!', '/yu-gi-oh'], ['Coleções', '/yu-gi-oh/colecoes'], [page.set.n, ygoSetPath(page.set)]])} />
    </>
  );
}
