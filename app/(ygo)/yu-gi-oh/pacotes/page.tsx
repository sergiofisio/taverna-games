import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import { YgoPackSimulator } from "../../../components/ygo/views";
import { pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Simulador de pacotes de Yu-Gi-Oh!", "Yu-Gi-Oh! pack opening simulator"],
  description: [
    "Abra boosters de Yu-Gi-Oh! de graça, das coleções clássicas às mais recentes, e veja quais Ultra Raras, Secretas e Starlight você tiraria.",
    "Open Yu-Gi-Oh! boosters for free, from classic sets to the newest ones, and see which Ultra, Secret and Starlight Rares you would pull.",
  ],
  path: "/yu-gi-oh/pacotes",
});

export default async function YgoPacksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { colecao } = await searchParams;
  return (
    <>
      <AdScript />
      <YgoPackSimulator initial={typeof colecao === 'string' ? colecao : null} />
    </>
  );
}
