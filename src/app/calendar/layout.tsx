
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import type { ReactNode } from "react";

export default function CalendarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-grow p-4 md:p-6 flex flex-col">
            {children}
        </div>
      </main>
    </div>
  );
}
