
import { Dashboard } from "@/components/Dashboard";
import type { ReactNode } from "react";

export default function BoardsLayout({ children }: { children: ReactNode }) {
  return <Dashboard>{children}</Dashboard>;
}
