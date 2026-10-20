import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { AnimeListView } from "../../../components/anime/views";
import { currentSeason, seasonLabel } from "../../../lib/anime";
import { getSeasonAnime } from "../../../lib/animeServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { season, year } = currentSeason();
  return pageMetadata({
    title: [`Animes da temporada de ${seasonLabel(season, 'pt').toLowerCase()} ${year}`, `${seasonLabel(season, 'en')} ${year} anime season`],
    description: [
      `Todos os animes da temporada de ${seasonLabel(season, 'pt').toLowerCase()} de ${year}: estreias e continuações ordenadas por popularidade.`,
      `Every anime of the ${seasonLabel(season, 'en').toLowerCase()} ${year} season: premieres and sequels sorted by popularity.`,
    ],
    path: "/animes/temporada",
  });
}

export default async function SeasonAnimePage() {
  const { season, year } = currentSeason();
  const anime = await getSeasonAnime(season, year);
  return (
    <>
      <AdScript />
      <AnimeListView kind="season" anime={anime} seasonName={season} year={year} />
      <JsonLd data={breadcrumbJsonLd([['Animes', '/animes'], ['Temporada', '/animes/temporada']])} />
    </>
  );
}
