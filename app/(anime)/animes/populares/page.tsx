import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { AnimeListView } from "../../../components/anime/views";
import { getPopularAnime } from "../../../lib/animeServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Animes mais populares", "Most popular anime"],
  description: ["Ranking dos 100 animes mais populares segundo o AniList, com nota, formato, ano e estúdio.", "Ranking of the 100 most popular anime according to AniList, with score, format, year and studio."],
  path: "/animes/populares",
});

export default async function PopularAnimePage() {
  const [first, second] = await Promise.all([getPopularAnime(1), getPopularAnime(2)]);
  return (
    <>
      <AdScript />
      <AnimeListView kind="popular" anime={[...first, ...second]} />
      <JsonLd data={breadcrumbJsonLd([['Animes', '/animes'], ['Mais populares', '/animes/populares']])} />
    </>
  );
}
