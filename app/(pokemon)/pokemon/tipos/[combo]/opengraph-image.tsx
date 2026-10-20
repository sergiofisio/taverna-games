import { OG_SIZE, TYPE_HEX, ogCard } from "../../../../lib/ogImage";
import { joinList, typeLabel } from "../../../../lib/pokemonText";
import { allCombos, comboLabel, comboSlug, parseCombo } from "../../../../lib/typeCombos";
import { getDefensiveMatchups } from "../../../../lib/typeChart";

export const alt = 'Fraquezas e resistências por tipo';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return allCombos().map((types) => ({ combo: comboSlug(types) }));
}

export default async function Image({ params }: { params: Promise<{ combo: string }> }) {
  const types = parseCombo((await params).combo) ?? ['normal'];
  const matchups = getDefensiveMatchups(types);
  const weak = [...matchups.quadruple, ...matchups.double].map((type) => typeLabel(type, 'pt'));
  return ogCard({
    eyebrow: 'Calculadora de fraquezas',
    title: `${types.length > 1 ? 'Tipos' : 'Tipo'} ${comboLabel(types, 'pt')}`,
    badges: types.map((type) => ({ label: typeLabel(type, 'pt'), color: TYPE_HEX[type] })),
    subtitle: weak.length ? `Fraquezas: ${joinList(weak, 'pt')}` : 'Sem fraquezas de tipo',
    accent: TYPE_HEX[types[0]],
  });
}
