import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import { CompareView } from "../../../../components/pokemonCompare";
import { comparePath, describeComparison, parseComparePair } from "../../../../lib/pokemonCompare";
import { getPokemonList, getPokemonProfile } from "../../../../lib/pokemonServer";
import { pageMetadata } from "../../../../lib/seo";

type Props = { params: Promise<{ par: string }> };

export const revalidate = 2592000;

export function generateStaticParams() {
  return [];
}

async function load(pair: string) {
  const slugs = parseComparePair(pair);
  if (!slugs) return null;
  const [a, b] = await Promise.all(slugs.map(getPokemonProfile));
  return a && b ? { a, b } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).par);
  if (!data) return {};
  const metadata = pageMetadata({
    title: `${data.a.name} vs ${data.b.name}: comparação de atributos e tipos`,
    description: describeComparison(data.a, data.b, 'pt').slice(0, 2).join(' ').slice(0, 300),
    path: comparePath(data.a.slug, data.b.slug),
  });
  return { ...metadata, robots: { index: false, follow: true } };
}

export default async function CompareResultPage({ params }: Props) {
  const data = await load((await params).par);
  if (!data) notFound();
  const list = await getPokemonList();
  return (
    <div className="flex w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <AdScript />
      <CompareView a={data.a} b={data.b} list={list} />
    </div>
  );
}
