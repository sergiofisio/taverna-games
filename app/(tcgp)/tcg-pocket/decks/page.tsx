import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import { TcgpDeckBuilder } from "../../../components/tcgp/views";
import { pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Montador de decks do Pokémon TCG Pocket", "Pokémon TCG Pocket deck builder"],
  description: [
    "Monte decks de 20 cartas do Pokémon TCG Pocket, confira as regras de cópias e de Pokémon Básico e compartilhe pelo link.",
    "Build 20-card Pokémon TCG Pocket decks, check the copy and Basic Pokémon rules and share them by link.",
  ],
  path: "/tcg-pocket/decks",
});

export default async function TcgpDecksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { deck } = await searchParams;
  return (
    <>
      <AdScript />
      <TcgpDeckBuilder initial={typeof deck === 'string' ? deck : null} />
    </>
  );
}
