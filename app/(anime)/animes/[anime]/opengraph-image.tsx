import { animeIdFromSlug, genreLabel } from "../../../lib/anime";
import { getAnime } from "../../../lib/animeServer";
import { ogCard } from "../../../lib/ogImage";

export const alt = 'Anime na Taverna dos Jogos';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ anime: string }> }) {
  const anime = await getAnime(animeIdFromSlug((await params).anime));
  if (!anime) return ogCard({ title: 'Animes' });
  return ogCard({
    eyebrow: `Anime${anime.year ? ` · ${anime.year}` : ''}${anime.studio ? ` · ${anime.studio}` : ''}`,
    title: anime.romaji,
    subtitle: anime.english && anime.english !== anime.romaji ? anime.english : undefined,
    badges: anime.genres.slice(0, 3).map((genre) => ({ label: genreLabel(genre, 'pt'), color: '#f9a8d4' })),
    images: [anime.img],
    accent: anime.color ?? '#a21caf',
  });
}
