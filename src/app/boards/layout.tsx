import { AppSidebar } from "@/components/AppSidebar";
import type { ReactNode } from "react";

export default function BoardsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
