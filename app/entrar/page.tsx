import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import AuthPage from "../components/auth/authPage";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Entrar", "Sign in"],
  description: ["Entre na Taverna dos Jogos para salvar o progresso e duelar com amigos.", "Sign in to Taverna dos Jogos to save your progress and duel friends."],
  path: "/entrar",
  noIndex: true,
});

export default function SignInPage() {
  return <AuthPage />;
}
