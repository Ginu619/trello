
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState, useEffect, type ReactNode, type FormEvent } from "react";
import type { Board } from "@/lib/types";

interface EditBoardDialogProps {
  board: Board;
  onBoardUpdate: (updatedBoard: Board) => void;
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditBoardDialog({
  board,
  onBoardUpdate,
  children,
  isOpen,
  onOpenChange,
}: EditBoardDialogProps) {
  const [title, setTitle] = useState(board.title);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(board.title);
    }
  }, [isOpen, board.title]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title === board.title) {
        onOpenChange(false);
        return;
    };
    setIsSaving(true);

    try {
      const { updateBoard } = await import("@/lib/data");
      const updatedBoard = await updateBoard(board.id, { title });
      onBoardUpdate(updatedBoard);
    } catch (error) {
      console.error("Failed to update board", error);
    } finally {
      setIsSaving(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <Label htmlFor="board-title-edit" className="sr-only">
              Board Title
            </Label>
            <Input
              id="board-title-edit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-base"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving || !title.trim()}>
              {isSaving && <Loader2 className="mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
