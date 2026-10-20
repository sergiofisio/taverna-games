import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import BattlegroundsView from "../../../components/hearthstone/battlegrounds";
import { getBattlegroundsData } from "../../../lib/hsServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Campos de Batalha: lacaios por tier, heróis e feitiços",
  description: "Lista completa dos Campos de Batalha do Hearthstone: todos os lacaios por tier e tribo, os heróis com seus Poderes Heroicos e os feitiços da taverna.",
  path: "/hearthstone/campos-de-batalha",
});

export default async function BattlegroundsPage() {
  const data = await getBattlegroundsData();
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <AdScript />
      <BattlegroundsView data={data} />
      <JsonLd data={breadcrumbJsonLd([['Hearthstone', '/hearthstone'], ['Campos de Batalha', '/hearthstone/campos-de-batalha']])} />
    </div>
  );
}
