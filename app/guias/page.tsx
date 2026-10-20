import type { Metadata } from "next";
import { GuideIndex } from "../components/guideArticle";
import JsonLd from "../components/jsonLd";
import AdScript from "../components/ads/adScript";
import { GUIDES } from "../lib/guides";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Guias", "Guides"],
  description: ["Guias de Pokémon e Hearthstone: tabela de tipos, atributos base, evoluções, gerações, classes, formatos, glossário, Pó Arcano e como montar um deck.", "Pokémon and Hearthstone guides: type chart, base stats, evolutions, generations, classes, formats, glossary, Arcane Dust and deck building."],
  path: "/guias",
});

export default function GuidesPage() {
  return (
    <>
      <AdScript />
      <GuideIndex guides={GUIDES} />
      <JsonLd data={breadcrumbJsonLd([['Guias', '/guias']])} />
    </>
  );
}
