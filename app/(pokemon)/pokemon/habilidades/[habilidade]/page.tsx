import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import JsonLd from "../../../../components/jsonLd";
import { AbilityView } from "../../../../components/moveViews";
import { prettify } from "../../../../i18n/translations";
import { describeAbility } from "../../../../lib/moveText";
import { getAbility } from "../../../../lib/movesServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";

type Props = { params: Promise<{ habilidade: string }> };

export const revalidate = 2592000;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ability = await getAbility((await params).habilidade);
  if (!ability) return {};
  return pageMetadata({
    title: `Habilidade ${prettify(ability.slug)}: efeito e Pokémon que têm`,
    description: describeAbility(ability, 'pt').join(' ').slice(0, 300),
    path: `/pokemon/habilidades/${ability.slug}`,
  });
}

export default async function AbilityPage({ params }: Props) {
  const ability = await getAbility((await params).habilidade);
  if (!ability) notFound();
  return (
    <div className="flex w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <AdScript />
      <AbilityView ability={ability} />
      <JsonLd data={breadcrumbJsonLd([['Pokédex', '/pokemon'], ['Habilidades', '/pokemon/habilidades'], [prettify(ability.slug), `/pokemon/habilidades/${ability.slug}`]])} />
    </div>
  );
}
