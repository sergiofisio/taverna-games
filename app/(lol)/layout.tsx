import type { ReactNode } from "react";
import Rift from "../components/lol/rift";

export default function LolLayout({ children }: { children: ReactNode }) {
  return <Rift>{children}</Rift>;
}
