import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import ProfileEditor from "../components/profile/profileEditor";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Meu perfil", "My profile"],
  description: ["Edite o seu perfil na Taverna dos Jogos.", "Edit your profile at Taverna dos Jogos."],
  path: "/perfil",
  noIndex: true,
});

export default function ProfilePage() {
  return <ProfileEditor />;
}
