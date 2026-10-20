import type { ReactNode } from "react";
import { PocketBackdrop } from "../components/tcgp/shared";

export default function TcgpLayout({ children }: { children: ReactNode }) {
  return <PocketBackdrop>{children}</PocketBackdrop>;
}
