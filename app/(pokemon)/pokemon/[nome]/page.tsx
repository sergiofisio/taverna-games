import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PokemonProfileView from "../../../components/pokemonProfile";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { getPokemonProfile } from "../../../lib/pokemonServer";
import { pokemonMetaDescription } from "../../../lib/pokemonText";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";
import { getOfficialArtwork } from "../../../lib/sprites";

type Props = { params: Promise<{ nome: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nome } = await params;
  const profile = await getPokemonProfile(nome);
  if (!profile) return {};
  return pageMetadata({
    title: [`${profile.name} (#${profile.id}): tipos, fraquezas e evoluções`, `${profile.name} (#${profile.id}): types, weaknesses and evolutions`],
    description: [pokemonMetaDescription(profile, 'pt'), pokemonMetaDescription(profile, 'en')],
    path: `/pokemon/${profile.slug}`,
    ownImage: true,
  });
}

export default async function PokemonDetailPage({ params }: Props) {
  const { nome } = await params;
  const profile = await getPokemonProfile(nome);
  if (!profile) notFound();
  return (
    <div className="flex w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <AdScript />
      <PokemonProfileView profile={profile} />
      <JsonLd data={breadcrumbJsonLd([['Pokédex', '/pokemon'], [profile.name, `/pokemon/${profile.slug}`]])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${profile.name} na Pokédex`,
          url: absoluteUrl(`/pokemon/${profile.slug}`),
          description: pokemonMetaDescription(profile),
          primaryImageOfPage: getOfficialArtwork(profile.id),
          inLanguage: 'pt-BR',
        }}
      />
    </div>
  );
}
