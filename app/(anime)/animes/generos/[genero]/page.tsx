import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import JsonLd from "../../../../components/jsonLd";
import { AnimeListView } from "../../../../components/anime/views";
import { genreFromSlug, genreLabel } from "../../../../lib/anime";
import { getGenreAnime } from "../../../../lib/animeServer";
import { GENRE_INTROS } from "../../../../lib/animeText";
import { breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";

type Props = { params: Promise<{ genero: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const genre = genreFromSlug((await params).genero);
  if (!genre) return {};
  return pageMetadata({
    title: [`Animes de ${genreLabel(genre, 'pt').toLowerCase()}: os mais populares`, `Most popular ${genreLabel(genre, 'en').toLowerCase()} anime`],
    description: GENRE_INTROS[genre] ?? [`Os animes mais populares de ${genreLabel(genre, 'pt').toLowerCase()}.`, `The most popular ${genre} anime.`],
    path: `/animes/generos/${(await params).genero}`,
  });
}

export default async function GenreAnimePage({ params }: Props) {
  const { genero } = await params;
  const genre = genreFromSlug(genero);
  if (!genre) notFound();
  const anime = await getGenreAnime(genre);
  return (
    <>
      <AdScript />
      <AnimeListView kind="genre" anime={anime} genre={genre} intro={GENRE_INTROS[genre]} />
      <JsonLd data={breadcrumbJsonLd([['Animes', '/animes'], [genreLabel(genre, 'pt'), `/animes/generos/${genero}`]])} />
    </>
  );
}
