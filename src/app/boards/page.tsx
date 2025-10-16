"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { createBoard, getBoards } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Board } from "@/lib/types";
import { Loader2, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

export default function BoardsPage() {
  const { user, loading: userLoading } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && user) {
      const fetchBoards = async () => {
        setLoadingBoards(true);
        const userBoards = await getBoards();
        setBoards(userBoards);
        setLoadingBoards(false);
      };
      fetchBoards();
    }
  }, [user, userLoading]);

  const handleCreateBoard = async (e: FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    setIsCreating(true);
    try {
      const newBoard = await createBoard(newBoardTitle);
      router.push(`/board/${newBoard.id}`);
    } catch (error) {
      console.error("Failed to create board", error);
    } finally {
      setIsCreating(false);
      setNewBoardTitle("");
      setIsDialogOpen(false);
    }
  };

  if (userLoading || loadingBoards) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-40 bg-muted/50 animate-pulse rounded-md" />
          <div className="h-10 w-36 bg-muted/50 animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card p-4 rounded-lg space-y-3">
              <div className="w-full h-32 bg-muted/50 animate-pulse rounded-md" />
              <div className="w-3/4 h-6 bg-muted/50 animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const boardImages = PlaceHolderImages.filter(p => p.id.startsWith('board-thumb'));

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Your Boards</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <PlusCircle className="mr-2" />
              Create Board
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a new board</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBoard}>
              <div className="p-4 space-y-4">
                <Label htmlFor="board-title" className="sr-only">Board Title</Label>
                <Input
                  id="board-title"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="e.g. Project Phoenix"
                  required
                  className="text-base"
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isCreating || !newBoardTitle.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isCreating && (
                    <Loader2 className="mr-2 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {boards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boards.map((board, index) => {
              const image = boardImages[index % boardImages.length];
              return (
            <Link href={`/board/${board.id}`} key={board.id} className="group">
              <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1.5 border-transparent bg-card/80">
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full">
                  {image && 
                      <Image
                          src={image.imageUrl}
                          alt={board.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint={image.imageHint}
                      />
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                   <h2 className="text-lg font-bold text-primary-foreground truncate transition-colors">
                    {board.title}
                  </h2>
                </CardContent>
              </Card>
            </Link>
              )
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <h2 className="text-xl font-semibold text-muted-foreground">No boards yet</h2>
          <p className="mt-2 text-muted-foreground">Get started by creating your first board.</p>
        </div>
      )}
    </div>
  );
}
