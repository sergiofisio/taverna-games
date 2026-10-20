import { OG_SIZE, TYPE_HEX, ogCard } from "../../../lib/ogImage";
import { getPokemonProfile } from "../../../lib/pokemonServer";
import { joinList, typeLabel } from "../../../lib/pokemonText";
import { getOfficialArtwork } from "../../../lib/sprites";
import { getDefensiveMatchups } from "../../../lib/typeChart";

export const alt = 'Pokémon na Taverna dos Jogos';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 2592000;

export default async function Image({ params }: { params: Promise<{ nome: string }> }) {
  const profile = await getPokemonProfile((await params).nome);
  if (!profile) return ogCard({ title: 'Pokédex' });
  const matchups = getDefensiveMatchups(profile.types);
  const weak = [...matchups.quadruple, ...matchups.double].map((type) => typeLabel(type, 'pt'));
  return ogCard({
    eyebrow: `Pokédex · #${String(profile.id).padStart(4, '0')}`,
    title: profile.name,
    badges: profile.types.map((type) => ({ label: typeLabel(type, 'pt'), color: TYPE_HEX[type] ?? '#a8a77a' })),
    subtitle: weak.length ? `Fraco contra ${joinList(weak, 'pt')}` : 'Sem fraquezas de tipo',
    images: [getOfficialArtwork(profile.id)],
    accent: TYPE_HEX[profile.types[0]],
  });
}
