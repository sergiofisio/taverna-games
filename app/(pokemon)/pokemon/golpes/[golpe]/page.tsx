import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import JsonLd from "../../../../components/jsonLd";
import { MoveView } from "../../../../components/moveViews";
import { prettify } from "../../../../i18n/translations";
import { moveMetaDescription } from "../../../../lib/moveText";
import { getMove } from "../../../../lib/movesServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";

type Props = { params: Promise<{ golpe: string }> };

export const revalidate = 2592000;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const move = await getMove((await params).golpe);
  if (!move) return {};
  return pageMetadata({
    title: `${prettify(move.slug)}: poder, precisão, efeito e Pokémon que aprendem`,
    description: moveMetaDescription(move),
    path: `/pokemon/golpes/${move.slug}`,
  });
}

export default async function MovePage({ params }: Props) {
  const move = await getMove((await params).golpe);
  if (!move) notFound();
  return (
    <div className="flex w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <AdScript />
      <MoveView move={move} />
      <JsonLd data={breadcrumbJsonLd([['Pokédex', '/pokemon'], ['Golpes', '/pokemon/golpes'], [prettify(move.slug), `/pokemon/golpes/${move.slug}`]])} />
    </div>
  );
}
