import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import JsonLd from "../../../../components/jsonLd";
import { YgoCardView } from "../../../../components/ygo/views";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";
import { ygoCardPath, ygoImage } from "../../../../lib/ygo";
import { describeYgoCard, getYgoCardPage } from "../../../../lib/ygoServer";

type Props = { params: Promise<{ carta: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getYgoCardPage((await params).carta);
  if (!page) return {};
  const { card, printings } = page;
  const metadata = await pageMetadata({
    title: [`${card.n[0]}: carta de Yu-Gi-Oh!`, `${card.n[1]}: Yu-Gi-Oh! card`],
    description: [
      describeYgoCard(card, printings, 'pt').slice(0, 2).join(' ').slice(0, 300),
      describeYgoCard(card, printings, 'en').slice(0, 2).join(' ').slice(0, 300),
    ],
    path: ygoCardPath(card),
    noIndex: true,
    ownImage: true,
  });
  return { ...metadata, openGraph: { ...metadata.openGraph, images: [{ url: absoluteUrl(ygoImage(card.id, 'full')), width: 421, height: 614 }] } };
}

export default async function YgoCardPage({ params }: Props) {
  const page = await getYgoCardPage((await params).carta);
  if (!page) notFound();
  const { card, text, printings, related, rarities } = page;
  return (
    <>
      <AdScript />
      <YgoCardView card={card} text={text} printings={printings} related={related} rarities={rarities} about={[describeYgoCard(card, printings, 'pt'), describeYgoCard(card, printings, 'en')]} />
      <JsonLd data={breadcrumbJsonLd([['Yu-Gi-Oh!', '/yu-gi-oh'], ['Cartas', '/yu-gi-oh/cartas'], [card.n[0], ygoCardPath(card)]])} />
    </>
  );
}
