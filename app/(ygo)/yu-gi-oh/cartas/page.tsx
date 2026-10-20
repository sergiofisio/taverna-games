import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import { YgoLibrary } from "../../../components/ygo/views";
import { pageMetadata } from "../../../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Cartas de Yu-Gi-Oh! em português", "Yu-Gi-Oh! card database"],
  description: [
    "Busque mais de 14 mil cartas de Yu-Gi-Oh! por categoria, atributo, tipo, nível e restrição na banlist, com o texto oficial em português.",
    "Search more than 14,000 Yu-Gi-Oh! cards by category, Attribute, Type, Level and banlist status, with their official texts.",
  ],
  path: "/yu-gi-oh/cartas",
});

export default function YgoCardsPage() {
  return (
    <>
      <AdScript />
      <YgoLibrary />
    </>
  );
}
