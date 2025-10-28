

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { createBoard, getBoards, updateBoard, deleteBoard } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Board } from "@/lib/types";
import { Loader2, Plus, Star, MoreVertical, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditBoardDialog } from "@/components/kanban/EditBoardDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


export default function BoardsPage() {
  const { user, loading: userLoading } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchBoards = async () => {
    setLoadingBoards(true);
    const userBoards = await getBoards();
    setBoards(userBoards);
    setLoadingBoards(false);
  };

  useEffect(() => {
    if (!userLoading && user) {
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
      setIsCreateDialogOpen(false);
    }
  };

  const handleBoardUpdate = (updatedBoard: Board) => {
    setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b));
  };
  
  const handleDeleteBoard = async () => {
    if (!deletingBoard) return;
    
    try {
      await deleteBoard(deletingBoard.id);
      setBoards(boards.filter(b => b.id !== deletingBoard.id));
      toast({ title: 'Board deleted' });
    } catch(e) {
      toast({ variant: 'destructive', title: 'Failed to delete board' });
    } finally {
      setDeletingBoard(null);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, boardId: string, isFavorite: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedBoard = await updateBoard(boardId, { isFavorite: !isFavorite });
    handleBoardUpdate(updatedBoard);
  };

  if (userLoading || loadingBoards) {
    return <LoadingSkeleton />
  }

  const boardImages = PlaceHolderImages.filter(p => p.id.startsWith('board-thumb'));

  const sortedBoards = [...boards].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });

  return (
    <>
    <Header />
    <div className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Your Boards</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedBoards.map((board, index) => {
            const image = boardImages[index % boardImages.length];
            return (
          <div key={board.id} className="group relative">
            <Link href={`/board/${board.id}`} className="block">
                <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 bg-card/80 border-transparent rounded-lg">
                    <div className="relative h-28 w-full">
                    {image && 
                        <Image
                            src={image.imageUrl}
                            alt={board.title}
                            fill
                            className="object-cover"
                            data-ai-hint={image.imageHint}
                        />
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                <CardContent className="p-4 flex justify-between items-start">
                    <h2 className="text-base font-bold text-primary-foreground truncate transition-colors">
                    {board.title}
                    </h2>
                </CardContent>
                </Card>
            </Link>
             <div className="absolute top-2 right-2 flex items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={(e) => toggleFavorite(e, board.id, !!board.isFavorite)}>
                  <Star className={cn("h-5 w-5", board.isFavorite && "fill-yellow-400 text-yellow-400")} />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditingBoard(board)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeletingBoard(board)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
            )
        })}
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:bg-muted/30 hover:border-primary/50 transition-colors">
              <Plus className="h-8 w-8 mb-2" />
              <span className="font-semibold">Create new board</span>
            </button>
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

      {boards.length === 0 && (
        <div className="text-center py-16 col-span-full">
          <h2 className="text-xl font-semibold text-muted-foreground">No boards yet</h2>
          <p className="mt-2 text-muted-foreground">Get started by creating your first board.</p>
        </div>
      )}
    </div>

    {editingBoard && (
      <EditBoardDialog
        board={editingBoard}
        onBoardUpdate={handleBoardUpdate}
        isOpen={!!editingBoard}
        onOpenChange={(isOpen) => !isOpen && setEditingBoard(null)}
      >
        <></>
      </EditBoardDialog>
    )}

    {deletingBoard && (
        <AlertDialog open={!!deletingBoard} onOpenChange={(isOpen) => !isOpen && setDeletingBoard(null)}>
             <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{deletingBoard.title}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the board and all its contents.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteBoard}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}

    </>
  );
}


function LoadingSkeleton() {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-40 bg-muted/50 animate-pulse rounded-md mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card p-4 rounded-lg space-y-3">
              <div className="w-full h-28 bg-muted/50 animate-pulse rounded-md" />
              <div className="w-3/4 h-6 bg-muted/50 animate-pulse rounded-md" />
            </div>
          ))}
            <div className="h-40 bg-muted/30 border-2 border-dashed border-border rounded-lg animate-pulse" />
        </div>
      </div>
    );
}
