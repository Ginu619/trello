
"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
  } from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    LayoutGrid,
    Calendar,
    Users,
    FileText,
  } from "lucide-react";
import { Header } from "./Header";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
  
export function Dashboard({ children }: { children?: ReactNode }) {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;
    
    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-7 h-7 text-primary" />
                        <span className="text-xl font-semibold">TaskHive</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/" isActive={isActive("/")} tooltip="Dashboard">
                            <LayoutDashboard />
                            <span>Dashboard</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                         <SidebarMenuButton href="/boards" isActive={isActive("/boards")} tooltip="Projects">
                            <LayoutGrid />
                            <span>Projects</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Meetings">
                            <Calendar />
                            <span>Meetings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Teams">
                            <Users />
                            <span>Teams</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Reports">
                            <FileText />
                            <span>Reports</span>
                        </SidebarMenuButton>_
                    </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>

            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-grow p-6 bg-muted/30">
                    {children ?? (
                        <>
                            <h1 className="text-3xl font-bold">Dashboard</h1>
                            <p className="text-muted-foreground mt-2">Welcome back! Here's a summary of your activities.</p>
                            {/* Placeholder for dashboard content */}
                            <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                <div className="bg-card p-6 rounded-lg shadow-sm">
                                    <h3 className="font-semibold text-lg">Active Projects</h3>
                                    <p className="text-4xl font-bold mt-2">2</p>
                                </div>
                                <div className="bg-card p-6 rounded-lg shadow-sm">
                                    <h3 className="font-semibold text-lg">Tasks Due Today</h3>
                                    <p className="text-4xl font-bold mt-2">1</p>
                                </div>
                                <div className="bg-card p-6 rounded-lg shadow-sm">
                                    <h3 className="font-semibold text-lg">Upcoming Meetings</h3>
                                    <p className="text-4xl font-bold mt-2">0</p>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
            </div>
        </SidebarProvider>
    );
}
