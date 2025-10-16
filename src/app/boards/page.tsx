"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Loader2, PlusCircle, Trello } from "lucide-react";
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
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Boards</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card p-4 rounded-lg space-y-2">
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Boards</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Board
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new board</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBoard}>
              <div className="p-4 space-y-2">
                <Label htmlFor="board-title">Board Title</Label>
                <Input
                  id="board-title"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="e.g. Project Phoenix"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isCreating || !newBoardTitle.trim()}
                >
                  {isCreating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {boards.map((board, index) => {
            const image = boardImages[index % boardImages.length];
            return (
          <Link href={`/board/${board.id}`} key={board.id}>
            <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="p-0">
                <div className="relative h-32 w-full">
                {image && 
                    <Image
                        src={image.imageUrl}
                        alt={board.title}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
                    />
                }
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                 <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                  {board.title}
                </CardTitle>
              </CardContent>
            </Card>
          </Link>
            )
        })}
      </div>
    </div>
  );
}
