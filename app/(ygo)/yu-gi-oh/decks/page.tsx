import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import { YgoDeckBuilder } from "../../../components/ygo/views";
import { pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Montador de decks de Yu-Gi-Oh!", "Yu-Gi-Oh! deck builder"],
  description: [
    "Monte decks de Yu-Gi-Oh! com Deck Principal e Adicional, confira a banlist do TCG, compartilhe pelo link e exporte em .ydk para o EDOPro ou o YGO Omega.",
    "Build Yu-Gi-Oh! decks with Main and Extra Deck, check the TCG banlist, share them by link and export them as .ydk for EDOPro or YGO Omega.",
  ],
  path: "/yu-gi-oh/decks",
});

export default async function YgoDecksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { deck } = await searchParams;
  return (
    <>
      <AdScript />
      <YgoDeckBuilder initial={typeof deck === 'string' ? deck : null} />
    </>
  );
}
