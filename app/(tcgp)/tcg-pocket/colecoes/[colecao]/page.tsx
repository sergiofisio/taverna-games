import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdScript from "../../../../components/ads/adScript";
import JsonLd from "../../../../components/jsonLd";
import { TcgpSetView } from "../../../../components/tcgp/views";
import type { Language } from "../../../../i18n/translations";
import { breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";
import { pickPair, rarityLabel, TCGP_RARITIES, tcgpSetPath, type TcgpSet } from "../../../../lib/tcgp";
import { getTcgpSetPage, type CardSummary } from "../../../../lib/tcgpServer";

type Props = { params: Promise<{ colecao: string }> };

function describeSet(set: TcgpSet, cards: CardSummary[], language: Language) {
  const pt = language === 'pt';
  const name = pickPair(set.n, language);
  const date = new Date(`${set.date}T12:00:00`).toLocaleDateString(pt ? 'pt-BR' : 'en-US', { dateStyle: 'long' });
  const pokemon = cards.filter((card) => card.c === 'Pokemon').length;
  const ex = cards.filter((card) => card.n[1].endsWith(' ex')).length;
  const counts = TCGP_RARITIES.map((rarity) => [rarity, cards.filter((card) => card.r === rarity).length] as const).filter(([, n]) => n > 0);
  const boosters = set.boosters.map((booster) => pickPair(booster.n, language));
  return [
    pt
      ? `${name} foi lançada em ${date} e tem ${set.total} cartas, sendo ${set.official} na numeração principal e ${set.total - set.official} secretas ou de arte especial.`
      : `${name} was released on ${date} and has ${set.total} cards: ${set.official} in the main numbering and ${set.total - set.official} secret or special-art cards.`,
    pt
      ? `São ${pokemon} cartas de Pokémon, ${ex} delas Pokémon ex, e ${cards.length - pokemon} cartas de Treinador.${boosters.length ? ` Os pacotes da coleção são: ${boosters.join(', ')}.` : ''}`
      : `There are ${pokemon} Pokémon cards, ${ex} of them Pokémon ex, and ${cards.length - pokemon} Trainer cards.${boosters.length ? ` The set's packs are: ${boosters.join(', ')}.` : ''}`,
    `${pt ? 'Distribuição por raridade' : 'Rarity breakdown'}: ${counts.map(([rarity, n]) => `${rarityLabel(rarity, language)} ${n}`).join(' · ')}.`,
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getTcgpSetPage((await params).colecao);
  if (!page) return {};
  return pageMetadata({
    title: [`${page.set.n[0]}: cartas da coleção do TCG Pocket`, `${page.set.n[1]}: TCG Pocket set cards`],
    description: [describeSet(page.set, page.cards, 'pt').slice(0, 2).join(' '), describeSet(page.set, page.cards, 'en').slice(0, 2).join(' ')],
    path: tcgpSetPath(page.set),
  });
}

export default async function TcgpSetPage({ params }: Props) {
  const page = await getTcgpSetPage((await params).colecao);
  if (!page) notFound();
  return (
    <>
      <AdScript />
      <TcgpSetView set={page.set} cards={page.cards} about={[describeSet(page.set, page.cards, 'pt'), describeSet(page.set, page.cards, 'en')]} />
      <JsonLd data={breadcrumbJsonLd([['Pokémon TCG Pocket', '/tcg-pocket'], ['Coleções', '/tcg-pocket/colecoes'], [page.set.n[0], tcgpSetPath(page.set)]])} />
    </>
  );
}
