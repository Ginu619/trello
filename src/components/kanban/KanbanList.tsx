
"use client";

import type { Card, List } from "@/lib/types";
import { KanbanCard } from "./KanbanCard";
import { Plus, MoreHorizontal, ArrowRightLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { Textarea } from "../ui/textarea";

interface KanbanListProps {
  list: List;
  boardId: string;
  onDragStart: (cardId: string, listId: string) => void;
  onDragEnd: () => void;
  onDragEnter: (listId: string, cardId: string | null) => void;
  onAddNewCard: (listId: string, title: string) => Promise<void>;
  onCardUpdate: (updatedCard: Card) => void;
  draggedCardId?: string | null;
}

export function KanbanList({
  list,
  boardId,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onAddNewCard,
  onCardUpdate,
  draggedCardId,
}: KanbanListProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState("");

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (list.cards.length === 0) {
        onDragEnter(list.id, null);
    }
  };

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    await onAddNewCard(list.id, newCardTitle);
    setNewCardTitle("");
    setIsAdding(false);
  }

  return (
    <div
      className="w-72 flex-shrink-0 h-full flex flex-col bg-card/80 rounded-xl shadow-sm"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="font-semibold text-foreground">{list.title}</h2>
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
        </div>
      </div>
      <div className="flex-grow p-2 overflow-y-auto space-y-2">
        {list.cards.sort((a,b) => a.order - b.order).map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            listId={list.id}
            listTitle={list.title}
            isDragged={card.id === draggedCardId}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragEnter={onDragEnter}
            onCardUpdate={onCardUpdate}
          />
        ))}

        {isAdding ? (
            <div className="space-y-2 p-1">
                <Textarea 
                    placeholder="Enter a title for this card..."
                    value={newCardTitle}
                    onChange={e => setNewCardTitle(e.target.value)}
                    autoFocus
                    className="min-h-[60px] bg-input/80"
                />
                <div className="flex items-center gap-2">
                    <Button onClick={handleAddCard} size="sm">Add card</Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                </div>
            </div>
        ) : (
             <Button variant="ghost" className="w-full justify-start mt-1" onClick={() => setIsAdding(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add a card
            </Button>
        )}
      </div>
    </div>
  );
}
