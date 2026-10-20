import type { ReactNode } from "react";
import { DuelBackdrop } from "../components/ygo/shared";

export default function YgoLayout({ children }: { children: ReactNode }) {
  return <DuelBackdrop>{children}</DuelBackdrop>;
}
