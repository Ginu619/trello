
import { Dashboard } from "@/components/Dashboard";
import type { ReactNode } from "react";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <Dashboard>
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </Dashboard>
  );
}
