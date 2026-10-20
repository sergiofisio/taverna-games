import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import DecksPage from "../../../components/hearthstone/decksPage";
import HsPageHeader from "../../../components/hearthstone/pageHeader";
import PageGuide from "../../../components/pageGuide";
import JsonLd from "../../../components/jsonLd";
import AdScript from "../../../components/ads/adScript";
import { breadcrumbJsonLd } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Deckbuilder de Hearthstone", "Hearthstone deck builder"],
  description: ["Monte decks de Hearthstone, importe e compartilhe deck codes e veja quanto pó arcano falta para os decks de referência com base na sua coleção.", "Build Hearthstone decks, import and share deck codes and see how much arcane dust you need for reference decks based on your collection."],
  path: "/hearthstone/decks",
});

export default async function HearthstoneDecksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { deck } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <AdScript />
      <HsPageHeader title="hsDecks" text="hsDecksDesc" />
      <DecksPage initialCode={typeof deck === 'string' ? deck : undefined} />
      <PageGuide tone="tavern" title="guideDecksTitle" paragraphs={['guideDecksP1', 'guideDecksP2']} />
      <JsonLd data={breadcrumbJsonLd([['Hearthstone', '/hearthstone'], ['Deckbuilder', '/hearthstone/decks']])} />
    </div>
  );
}
