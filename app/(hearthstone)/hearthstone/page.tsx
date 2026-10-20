import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import HsHome from "../../components/hearthstone/home";
import AdScript from "../../components/ads/adScript";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: "Hearthstone",
  description: ["Taverna Hearthstone: biblioteca com todas as cartas, Hearthdle diário e deckbuilder que calcula o pó que falta com base na sua coleção.", "Hearthstone tavern: a library of every card, a daily Hearthdle and a deck builder that calculates the dust you are missing based on your collection."],
  path: "/hearthstone",
});

export default function HearthstonePage() {
  return (
    <>
      <AdScript />
      <HsHome />
    </>
  );
}
