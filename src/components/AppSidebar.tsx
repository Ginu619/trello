
"use client";

import {
  Calendar,
  ChevronDown,
  LayoutDashboard,
  Plus,
  Projector,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/boards",
  },
  {
    label: "Projects",
    icon: Projector,
    href: "/projects",
  },
  {
    label: "Meetings",
    icon: Users,
    href: "/meetings",
  },
  {
    label: "Calendar",
    icon: Calendar,
    href: "/calendar",
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <aside className={cn(
        "flex flex-col text-sidebar-text p-4 bg-gradient-to-b from-[hsl(var(--sidebar-bg-start))] to-[hsl(var(--sidebar-bg-end))] transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20 items-center" : "w-64"
    )}>
      <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
        {!isCollapsed && user && (
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        )}
        <div className={cn(isCollapsed && "hidden")}>
          <p className="font-semibold text-sm">{user?.name}</p>
          <p className="text-xs text-sidebar-muted-text">Product Designer</p>
        </div>
      </div>
      
      <nav className="mt-8 flex-grow">
        <p className={cn("text-xs text-sidebar-muted-text mb-2", isCollapsed ? "text-center" : "pl-3")}>MAIN</p>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 hover:bg-sidebar-hover-bg hover:text-sidebar-text",
                    isCollapsed ? "px-2" : "px-3",
                    pathname.startsWith(item.href) && "bg-sidebar-active-bg"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn(isCollapsed && "sr-only")}>{item.label}</span>
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-4">
        {!isCollapsed && (
          <div className="p-4 rounded-lg bg-sidebar-active-bg/80 text-center space-y-2">
            <p className="text-sm font-semibold">Let&apos;s start!</p>
            <p className="text-xs text-sidebar-muted-text">
              Creating or adding new tasks couldn&apos;t be easier
            </p>
            <Button size="sm" className="w-full bg-sidebar-cta-bg text-sidebar-cta-text hover:bg-sidebar-cta-bg/90">
              <Plus className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </div>
        )}
        {isCollapsed && (
            <Button size="icon" className="rounded-full h-12 w-12 bg-sidebar-cta-bg text-sidebar-cta-text hover:bg-sidebar-cta-bg/90">
                <Plus className="h-6 w-6"/>
            </Button>
        )}
        
        <div className="border-t border-sidebar-border/50 my-2" />

        <Link href="/settings">
          <Button
            variant="ghost"
            className={cn(
                "w-full justify-start gap-3 hover:bg-sidebar-hover-bg hover:text-sidebar-text",
                isCollapsed ? "px-2" : "px-3"
            )}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-5 w-5" />
            <span className={cn(isCollapsed && "sr-only")}>Settings</span>
          </Button>
        </Link>
      </div>

       <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-[-12px] h-6 w-6 rounded-full bg-background text-foreground hover:bg-muted"
            onClick={() => setIsCollapsed(!isCollapsed)}
        >
            <ChevronDown className={cn("h-4 w-4 transition-transform", isCollapsed ? "rotate-[-90deg]" : "rotate-90")} />
      </Button>
    </aside>
  );
}
