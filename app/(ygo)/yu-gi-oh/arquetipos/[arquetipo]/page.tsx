import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import JsonLd from "../../../../components/jsonLd";
import { YgoArchetypeView } from "../../../../components/ygo/views";
import { breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";
import { INDEXED_ARCHETYPE_SIZE, describeArchetype, getYgoArchetypePage } from "../../../../lib/ygoServer";

type Props = { params: Promise<{ arquetipo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const archetype = await getYgoArchetypePage((await params).arquetipo);
  if (!archetype) return {};
  return pageMetadata({
    title: [`Arquétipo ${archetype.name}: todas as cartas de Yu-Gi-Oh!`, `${archetype.name} archetype: every Yu-Gi-Oh! card`],
    description: [describeArchetype(archetype, 'pt').slice(0, 2).join(' ').slice(0, 300), describeArchetype(archetype, 'en').slice(0, 2).join(' ').slice(0, 300)],
    path: `/yu-gi-oh/arquetipos/${archetype.slug}`,
    noIndex: archetype.cards.length < INDEXED_ARCHETYPE_SIZE,
  });
}

export default async function YgoArchetypePage({ params }: Props) {
  const archetype = await getYgoArchetypePage((await params).arquetipo);
  if (!archetype) notFound();
  return (
    <>
      <AdScript />
      <YgoArchetypeView name={archetype.name} cards={archetype.cards} about={[describeArchetype(archetype, 'pt'), describeArchetype(archetype, 'en')]} />
      <JsonLd data={breadcrumbJsonLd([['Yu-Gi-Oh!', '/yu-gi-oh'], ['Arquétipos', '/yu-gi-oh/arquetipos'], [archetype.name, `/yu-gi-oh/arquetipos/${archetype.slug}`]])} />
    </>
  );
}
