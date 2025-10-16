import { Header } from "@/components/Header";
import type { ReactNode } from "react";

export default function BoardsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
