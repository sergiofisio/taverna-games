import { getGuide, GUIDES } from "../../lib/guides";
import { OG_SIZE, ogCard } from "../../lib/ogImage";

export const alt = 'Guia da Taverna dos Jogos';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return GUIDES.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide) return ogCard({ title: 'Guias' });
  const { title, description } = guide.content.pt;
  return ogCard({
    eyebrow: guide.world === 'pokemon' ? 'Guia · Pokémon' : guide.world === 'lol' ? 'Guia · League of Legends' : guide.world === 'anime' ? 'Guia · Animes' : guide.world === 'tcg' ? 'Guia · TCG Pocket' : guide.world === 'ygo' ? 'Guia · Yu-Gi-Oh!' : 'Guia · Hearthstone',
    title,
    subtitle: description.length > 140 ? `${description.slice(0, 137)}…` : description,
    accent: guide.world === 'pokemon' ? '#dc2626' : guide.world === 'lol' ? '#0a3a4a' : guide.world === 'anime' ? '#a21caf' : guide.world === 'tcg' ? '#0369a1' : guide.world === 'ygo' ? '#6d28d9' : '#b45309',
  });
}
