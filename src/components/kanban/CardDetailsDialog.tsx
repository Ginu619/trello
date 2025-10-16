"use client";

import type { Card } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useEffect, useState, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateCard } from "@/lib/data";
import { Loader2 } from "lucide-react";

interface CardDetailsDialogProps {
  card: Card;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function CardDetailsDialog({
  card,
  isOpen,
  onOpenChange,
}: CardDetailsDialogProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle(card.title);
      setDescription(card.description || "");
    }
  }, [isOpen, card]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        // In a real app, you would also pass the boardId
      await updateCard("board-1", card.id, { title, description });
      toast({ title: "Card updated successfully!" });
      onOpenChange(false);
       // Here you would typically trigger a re-fetch or state update in the parent
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update card.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a more detailed description..."
                className="col-span-3 min-h-[120px]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
