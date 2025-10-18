import type { ReactNode } from "react";

export default function BoardsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {children}
    </main>
  );
}
