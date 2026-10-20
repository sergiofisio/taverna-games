import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import DuelLobby from "../components/duel/lobby";

export const generateMetadata = (): Promise<Metadata> => pageMetadata({
  title: ["Duelo", "Duel"],
  description: ["Desafie um amigo em duelos online de Pokémon e Hearthstone: a mesma série de rodadas para os dois, e quem fizer mais pontos vence.", "Challenge a friend to online Pokémon and Hearthstone duels: the same rounds for both players, and whoever scores more wins."],
  path: "/duelo",
});

export default function DuelPage() {
  return <DuelLobby />;
}
