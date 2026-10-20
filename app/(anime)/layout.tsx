import type { ReactNode } from "react";
import Sakura from "../components/anime/sakura";

export default function AnimeLayout({ children }: { children: ReactNode }) {
  return <Sakura>{children}</Sakura>;
}
