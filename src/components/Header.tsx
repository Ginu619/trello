
"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LayoutGrid, LogOut, User as UserIcon, Search, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import type { Board } from "@/lib/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function Header({ boards, currentBoardId }: { boards?: Board[], currentBoardId?: string }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [selectedBoard, setSelectedBoard] = useState(currentBoardId);

  useEffect(() => {
    setSelectedBoard(currentBoardId);
  }, [currentBoardId]);

  const handleBoardChange = (boardId: string) => {
    setSelectedBoard(boardId);
    router.push(`/board/${boardId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const currentBoard = boards?.find(b => b.id === selectedBoard);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between space-x-4">
            <div className="flex items-center gap-4">
            {boards && currentBoardId && (
                <Select value={selectedBoard} onValueChange={handleBoardChange}>
                    <SelectTrigger className="w-[180px] font-semibold text-lg h-9 border-0 bg-transparent shadow-none focus:ring-0">
                        <SelectValue placeholder="Select a board" />
                    </SelectTrigger>
                    <SelectContent>
                        {boards.map(board => (
                            <SelectItem key={board.id} value={board.id}>{board.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tasks, projects..." className="pl-9 bg-transparent" />
            </div>
            </div>
          <nav className="flex items-center space-x-2">
            <Link href="/boards">
                <Button variant="ghost" size="icon" title="Dashboard">
                    <LayoutGrid />
                </Button>
            </Link>
            {loading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => (window.location.href = "/profile")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
