
"use client";

import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "./ui/sidebar";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </AuthProvider>
  );
}
