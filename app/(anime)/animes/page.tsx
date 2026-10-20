import type { Metadata } from "next";
import AdScript from "../../components/ads/adScript";
import JsonLd from "../../components/jsonLd";
import { AnimeHome } from "../../components/anime/views";
import { currentSeason } from "../../lib/anime";
import { getPopularAnime, getSeasonAnime, getTrendingAnime } from "../../lib/animeServer";
import { breadcrumbJsonLd, pageMetadata } from "../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Animes: populares, temporada atual e gêneros", "Anime: popular, current season and genres"],
  description: [
    "Os animes mais populares e em alta, a temporada atual e todos os gêneros, com fichas, personagens e recomendações, além do Animedle diário.",
    "The most popular and trending anime, the current season and every genre, with detailed pages, characters and recommendations, plus the daily Animedle.",
  ],
  path: "/animes",
});

export default async function AnimeHomePage() {
  const { season, year } = currentSeason();
  const [trending, seasonal, popular] = await Promise.all([getTrendingAnime(), getSeasonAnime(season, year), getPopularAnime()]);
  return (
    <>
      <AdScript />
      <AnimeHome trending={trending} season={seasonal} seasonName={season} year={year} popular={popular} />
      <JsonLd data={breadcrumbJsonLd([['Animes', '/animes']])} />
    </>
  );
}
