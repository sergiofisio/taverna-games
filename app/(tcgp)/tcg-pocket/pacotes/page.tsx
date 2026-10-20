import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import { TcgpPackSimulator } from "../../../components/tcgp/views";
import { pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Simulador de pacotes do Pokémon TCG Pocket", "Pokémon TCG Pocket pack simulator"],
  description: [
    "Abra pacotes do Pokémon TCG Pocket de graça, escolha a coleção e o pacote e veja as chances de cartas de arte, brilhantes e coroa.",
    "Open Pokémon TCG Pocket packs for free, pick the set and booster and see the odds of art, shiny and crown cards.",
  ],
  path: "/tcg-pocket/pacotes",
});

export default function TcgpPacksPage() {
  return (
    <>
      <AdScript />
      <TcgpPackSimulator />
    </>
  );
}
