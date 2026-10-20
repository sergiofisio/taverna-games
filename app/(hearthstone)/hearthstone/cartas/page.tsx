import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import HsLibrary from "../../../components/hearthstone/library";
import HsPageHeader from "../../../components/hearthstone/pageHeader";
import PageGuide from "../../../components/pageGuide";
import { SetsLink } from "../../../components/hearthstone/setPages";
import JsonLd from "../../../components/jsonLd";
import AdScript from "../../../components/ads/adScript";
import { breadcrumbJsonLd } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Cartas de Hearthstone", "Hearthstone cards"],
  description: ["Pesquise todas as cartas colecionáveis de Hearthstone por classe, custo, raridade, tipo, coleção e formato Padrão ou Livre, em português e inglês.", "Search every collectible Hearthstone card by class, cost, rarity, type, set and Standard or Wild format, in Portuguese and English."],
  path: "/hearthstone/cartas",
});

export default async function HearthstoneCardsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { classe } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <AdScript />
      <HsPageHeader title="hsLibrary" text="hsLibraryDesc" />
      <SetsLink />
      <HsLibrary initialClass={typeof classe === 'string' ? classe : ''} />
      <PageGuide tone="tavern" title="guideCardsTitle" paragraphs={['guideCardsP1', 'guideCardsP2']} />
      <JsonLd data={breadcrumbJsonLd([['Hearthstone', '/hearthstone'], ['Cartas', '/hearthstone/cartas']])} />
    </div>
  );
}
