import { OG_SIZE, TYPE_HEX, ogCard } from "../../../../lib/ogImage";
import { parseComparePair } from "../../../../lib/pokemonCompare";
import { getPokemonProfile } from "../../../../lib/pokemonServer";
import { statTotal } from "../../../../lib/pokemonText";
import { getOfficialArtwork } from "../../../../lib/sprites";

export const alt = 'Comparação de Pokémon';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 2592000;

export default async function Image({ params }: { params: Promise<{ par: string }> }) {
  const slugs = parseComparePair((await params).par);
  const [a, b] = slugs ? await Promise.all(slugs.map(getPokemonProfile)) : [null, null];
  if (!a || !b) return ogCard({ title: 'Comparador de Pokémon' });
  return ogCard({
    eyebrow: 'Comparador de Pokémon',
    title: `${a.name} vs ${b.name}`,
    subtitle: `Atributos base: ${statTotal(a)} contra ${statTotal(b)}`,
    images: [getOfficialArtwork(a.id), getOfficialArtwork(b.id)],
    accent: TYPE_HEX[a.types[0]],
  });
}
