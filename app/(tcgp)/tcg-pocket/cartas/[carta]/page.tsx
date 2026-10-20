import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import JsonLd from "../../../../components/jsonLd";
import { TcgpCardView } from "../../../../components/tcgp/views";
import { getPokemonList } from "../../../../lib/pokemonServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";
import { tcgpCardPath, tcgpImage } from "../../../../lib/tcgp";
import { describeTcgpCard, getTcgpCardPage } from "../../../../lib/tcgpServer";

type Props = { params: Promise<{ carta: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getTcgpCardPage((await params).carta);
  if (!page) return {};
  const { card, set } = page;
  const metadata = await pageMetadata({
    title: [`${card.n[0]} (${set.n[0]} ${card.no}): carta do TCG Pocket`, `${card.n[1]} (${set.n[1]} ${card.no}): TCG Pocket card`],
    description: [
      describeTcgpCard(card, set.n, page.boosters.map(({ n }) => n), 'pt').slice(0, 2).join(' ').slice(0, 300),
      describeTcgpCard(card, set.n, page.boosters.map(({ n }) => n), 'en').slice(0, 2).join(' ').slice(0, 300),
    ],
    path: tcgpCardPath(card),
  });
  const image = tcgpImage(card, 'pt');
  return {
    ...metadata,
    robots: { index: false, follow: true },
    ...(image && { openGraph: { ...metadata.openGraph, images: [{ url: image, width: 367, height: 512 }] } }),
  };
}

export default async function TcgpCardPage({ params }: Props) {
  const page = await getTcgpCardPage((await params).carta);
  if (!page) notFound();
  const { card, set, sameName, boosters } = page;
  const species = card.dex[0] ? (await getPokemonList().catch(() => [])).find(({ id }) => id === card.dex[0]) : undefined;
  const about: [string[], string[]] = [
    describeTcgpCard(card, set.n, boosters.map(({ n }) => n), 'pt'),
    describeTcgpCard(card, set.n, boosters.map(({ n }) => n), 'en'),
  ];
  return (
    <>
      <AdScript />
      <TcgpCardView cardId={card.id} about={about} sameName={sameName} pokedexSlug={species?.slug ?? null} />
      <JsonLd data={breadcrumbJsonLd([['Pokémon TCG Pocket', '/tcg-pocket'], ['Cartas', '/tcg-pocket/cartas'], [card.n[0], tcgpCardPath(card)]])} />
    </>
  );
}
