
"use client";

import type { Card, List } from "@/lib/types";
import { KanbanCard } from "./KanbanCard";
import { Plus, MoreHorizontal, ArrowRightLeft, Trash2, Edit } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface KanbanListProps {
  list: List;
  boardId: string;
  onCardDragStart: (cardId: string, listId: string) => void;
  onDragEnd: () => void;
  onCardDragEnter: (listId: string, cardId: string | null) => void;
  onListDragStart: (listId: string) => void;
  onListDragEnter: (listId: string) => void;
  onAddNewCard: (listId: string, title: string) => Promise<void>;
  onCardUpdate: (updatedCard: Card) => void;
  onListUpdate: (listId: string, updates: Partial<List>) => void;
  onListDelete: (listId: string) => void;
  onCardDelete: (listId: string, cardId: string) => void;
  draggedCardId?: string | null;
  isListDragged: boolean;
}

export function KanbanList({
  list,
  boardId,
  onCardDragStart,
  onCardDragEnter,
  onListDragStart,
  onListDragEnter,
  onDragEnd,
  onAddNewCard,
  onCardUpdate,
  onListUpdate,
  onListDelete,
  onCardDelete,
  draggedCardId,
  isListDragged,
}: KanbanListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(list.title);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleListDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onListDragStart(list.id);
  }

  const handleListDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onListDragEnter(list.id);
  }

  const handleCardDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (list.cards.length === 0) {
      onCardDragEnter(list.id, null);
    }
  };

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    await onAddNewCard(list.id, newCardTitle);
    setNewCardTitle("");
    setIsAdding(false);
  };
  
  const handleTitleBlur = () => {
    if (currentTitle.trim() && currentTitle !== list.title) {
      onListUpdate(list.id, { title: currentTitle });
    } else {
        setCurrentTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setCurrentTitle(list.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <>
      <div
        draggable
        onDragStart={handleListDragStart}
        onDragEnter={handleListDragEnter}
        onDragOver={handleDragOver}
        onDrop={handleCardDrop}
        className={cn(
          "w-72 flex-shrink-0 h-full flex flex-col bg-card/80 rounded-xl shadow-sm transition-opacity",
          isListDragged && "opacity-50"
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-border cursor-grab active:cursor-grabbing">
            {isEditingTitle ? (
                 <Input
                    ref={titleInputRef}
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    className="h-8 text-base font-semibold"
                />
            ) : (
                <h2 className="font-semibold text-foreground" onClick={() => setIsEditingTitle(true)}>
                    {list.title}
                </h2>
            )}
          <div className="flex items-center gap-1">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename list
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete list
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex-grow p-2 overflow-y-auto space-y-2">
          {list.cards
            .sort((a, b) => a.order - b.order)
            .map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                boardId={boardId}
                listId={list.id}
                listTitle={list.title}
                isDragged={card.id === draggedCardId}
                onDragStart={onCardDragStart}
                onDragEnd={onDragEnd}
                onDragEnter={onCardDragEnter}
                onCardUpdate={onCardUpdate}
                onCardDelete={onCardDelete}
              />
            ))}

          {isAdding ? (
            <div className="space-y-2 p-1">
              <Textarea
                placeholder="Enter a title for this card..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                autoFocus
                className="min-h-[60px] bg-input/80"
              />
              <div className="flex items-center gap-2">
                <Button onClick={handleAddCard} size="sm">
                  Add card
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start mt-1"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add a card
            </Button>
          )}
        </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this list?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the "{list.title}" list and all of its cards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onListDelete(list.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
