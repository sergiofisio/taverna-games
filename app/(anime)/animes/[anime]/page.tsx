import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { AnimeView } from "../../../components/anime/views";
import { animeIdFromSlug, animePath, animeSlug } from "../../../lib/anime";
import { getAnime } from "../../../lib/animeServer";
import { animeMetaDescription } from "../../../lib/animeText";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

type Props = { params: Promise<{ anime: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const anime = await getAnime(animeIdFromSlug((await params).anime));
  if (!anime) return {};
  return pageMetadata({
    title: [`${anime.romaji}: episódios, personagens e onde começar`, `${anime.english ?? anime.romaji}: episodes, characters and details`],
    description: [animeMetaDescription(anime, 'pt'), animeMetaDescription(anime, 'en')],
    path: animePath(anime),
    ownImage: true,
  });
}

export default async function AnimePage({ params }: Props) {
  const { anime: slug } = await params;
  const anime = await getAnime(animeIdFromSlug(slug));
  if (!anime) notFound();
  if (animeSlug(anime) !== slug) permanentRedirect(animePath(anime));
  return (
    <>
      <AdScript />
      <AnimeView anime={anime} />
      <JsonLd data={breadcrumbJsonLd([['Animes', '/animes'], [anime.romaji, animePath(anime)]])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TVSeries',
          name: anime.romaji,
          alternateName: [anime.english, anime.native].filter(Boolean),
          genre: anime.genres,
          image: anime.img,
          numberOfEpisodes: anime.episodes ?? undefined,
          productionCompany: anime.studios.map((name) => ({ '@type': 'Organization', name })),
        }}
      />
    </>
  );
}
