import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import PackSimulator from "../../../components/hearthstone/packSimulator";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Simulador de pacotes de Hearthstone",
  description: "Abra pacotes de qualquer coleção de Hearthstone de graça: veja as cartas, lendárias, douradas e quanto pó as repetidas renderiam, com as garantias do jogo.",
  path: "/hearthstone/pacotes",
});

export default function PackSimulatorPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <AdScript />
      <PackSimulator />
      <JsonLd data={breadcrumbJsonLd([['Hearthstone', '/hearthstone'], ['Simulador de pacotes', '/hearthstone/pacotes']])} />
    </div>
  );
}
