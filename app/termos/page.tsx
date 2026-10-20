import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import LegalPage from "../components/legalPage";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Termos de uso", "Terms of use"],
  description: ["Termos de uso da Taverna dos Jogos, projeto de fã sobre Pokémon e Hearthstone.", "Terms of use of Taverna dos Jogos, a fan project about Pokémon and Hearthstone."],
  path: "/termos",
});

export default function TermsPage() {
  return <LegalPage doc="terms" />;
}
