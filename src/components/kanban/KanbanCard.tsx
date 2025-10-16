"use client";

import type { Card } from "@/lib/types";
import { useState } from "react";
import { Card as UICard, CardContent } from "../ui/card";
import { CardDetailsDialog } from "./CardDetailsDialog";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  card: Card;
  listId: string;
  isDragged: boolean;
  onDragStart: (cardId: string, listId: string) => void;
  onDragEnd: () => void;
  onDragEnter: (listId: string, cardId: string) => void;
}

export function KanbanCard({
  card,
  listId,
  isDragged,
  onDragStart,
  onDragEnd,
  onDragEnter,
}: KanbanCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.id);
    setTimeout(() => onDragStart(card.id, listId), 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    onDragEnd();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDragEnter(listId, card.id);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  }

  return (
    <>
      <UICard
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => setIsDialogOpen(true)}
        className={cn(
          "p-3 cursor-pointer hover:bg-muted/80 transition-colors bg-muted/40",
          isDragged && "opacity-50 ring-2 ring-primary",
          isDraggingOver && !isDragged && "ring-2 ring-accent"
        )}
      >
        <CardContent className="p-0">
          <p className="text-sm">{card.title}</p>
        </CardContent>
      </UICard>
      <CardDetailsDialog
        card={card}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
