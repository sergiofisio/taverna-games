import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import LegalPage from "../components/legalPage";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Política de privacidade", "Privacy policy"],
  description: ["Quais dados a Taverna dos Jogos coleta, como usa cookies e anúncios e quais são os seus direitos pela LGPD.", "What data Taverna dos Jogos collects, how it uses cookies and ads, and your rights under the LGPD."],
  path: "/privacidade",
});

export default function PrivacyPage() {
  return <LegalPage doc="privacy" />;
}
