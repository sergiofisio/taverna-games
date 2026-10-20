import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import JsonLd from "../../../../components/jsonLd";
import { TypeComboView } from "../../../../components/typeTools";
import { getTypedPokemon } from "../../../../lib/pokemonServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";
import { comboLabel, comboPath, comboSlug, describeCombo, hasSameTypes, parseCombo } from "../../../../lib/typeCombos";
import { prettify } from "../../../../i18n/translations";

type Props = { params: Promise<{ combo: string }> };

async function load(slug: string) {
  const types = parseCombo(slug);
  if (!types || comboSlug(types) !== slug) return null;
  const all = await getTypedPokemon();
  return {
    types,
    pokemon: all.filter((entry) => hasSameTypes(entry.types, types)),
    partialCount: all.filter((entry) => types.every((type) => entry.types.includes(type))).length,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).combo);
  if (!data) return {};
  const examples = data.pokemon.slice(0, 4).map(({ slug }) => prettify(slug));
  const metadata = await pageMetadata({
    title: [
      `${data.types.length > 1 ? 'Tipos' : 'Tipo'} ${comboLabel(data.types, 'pt')}: fraquezas, resistências e Pokémon`,
      `${comboLabel(data.types, 'en')} type${data.types.length > 1 ? 's' : ''}: weaknesses, resistances and Pokémon`,
    ],
    description: [
      describeCombo(data.types, examples, data.pokemon.length, 'pt')[0].slice(0, 300),
      describeCombo(data.types, examples, data.pokemon.length, 'en')[0].slice(0, 300),
    ],
    path: comboPath(data.types),
    ownImage: true,
  });
  return data.pokemon.length ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

export default async function TypeComboPage({ params }: Props) {
  const data = await load((await params).combo);
  if (!data) notFound();
  const name = comboLabel(data.types, 'pt');
  return (
    <div className="flex w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <AdScript />
      <TypeComboView types={data.types} pokemon={data.pokemon} partialCount={data.partialCount} />
      <JsonLd data={breadcrumbJsonLd([['Pokédex', '/pokemon'], ['Tipos', '/pokemon/tipos'], [name, comboPath(data.types)]])} />
    </div>
  );
}
