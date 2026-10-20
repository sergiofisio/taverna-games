import type { Metadata } from "next";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { YgoBanlist } from "../../../components/ygo/views";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";
import { getYgoBanlist } from "../../../lib/ygoServer";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Banlist de Yu-Gi-Oh!: cartas proibidas e limitadas", "Yu-Gi-Oh! banlist: Forbidden & Limited cards"],
  description: [
    "A lista atual de cartas proibidas, limitadas e semilimitadas de Yu-Gi-Oh! no TCG e no OCG, com o texto de cada carta em português.",
    "The current Yu-Gi-Oh! Forbidden, Limited and Semi-Limited lists for the TCG and OCG, with every card's text.",
  ],
  path: "/yu-gi-oh/banlist",
});

export default async function YgoBanlistPage() {
  const cards = await getYgoBanlist();
  return (
    <>
      <AdScript />
      <YgoBanlist cards={cards} />
      <JsonLd data={breadcrumbJsonLd([['Yu-Gi-Oh!', '/yu-gi-oh'], ['Banlist', '/yu-gi-oh/banlist']])} />
    </>
  );
}
