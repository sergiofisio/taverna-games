import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import DonatePage from "../components/donate";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Apoie o projeto", "Support the project"],
  description: ["Ajude a manter a Taverna dos Jogos no ar com uma doação via Pix ou Ko-fi.", "Help keep Taverna dos Jogos online with a donation via Pix or Ko-fi."],
  path: "/apoiar",
});

export default function SupportPage() {
  return <DonatePage />;
}
