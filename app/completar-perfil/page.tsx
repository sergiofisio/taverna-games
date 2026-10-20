import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import CompleteProfile from "../components/auth/completeProfile";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Completar perfil", "Complete profile"],
  description: ["Complete o seu perfil na Taverna dos Jogos.", "Complete your profile at Taverna dos Jogos."],
  path: "/completar-perfil",
  noIndex: true,
});

export default function CompleteProfilePage() {
  return <CompleteProfile />;
}
