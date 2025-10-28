
"use client";

import type { Card } from "@/lib/types";
import { useState } from "react";
import { Card as UICard, CardContent } from "../ui/card";
import { CardDetailsDialog } from "./CardDetailsDialog";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Clock, CheckSquare, Edit, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { Button } from "../ui/button";
import Image from 'next/image';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";

interface KanbanCardProps {
  card: Card;
  boardId: string;
  listId: string;
  listTitle: string;
  isDragged: boolean;
  onDragStart: (cardId: string, listId: string) => void;
  onDragEnd: () => void;
  onDragEnter: (listId: string, cardId: string) => void;
  onCardUpdate: (updatedCard: Card) => void;
  onCardDelete: (listId: string, cardId: string) => void;
}

export function KanbanCard({
  card,
  boardId,
  listId,
  listTitle,
  isDragged,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onCardUpdate,
  onCardDelete,
}: KanbanCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
  
  const completedChecklistItems = card.checklist?.filter(item => item.completed).length || 0;
  const totalChecklistItems = card.checklist?.length || 0;

  const openDialog = () => setIsDialogOpen(true);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const hasCover = !!card.cover;
  const isFullCover = hasCover && card.cover?.size === 'full';
  const coverIsImage = hasCover && card.cover?.type === 'image';

  return (
    <>
      <div className="relative group/card">
        <UICard
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onClick={openDialog}
          className={cn(
            "cursor-pointer transition-colors bg-card/90",
            isDragged && "opacity-50 ring-2 ring-primary",
            isDraggingOver && !isDragged && "ring-2 ring-accent",
            isFullCover && "p-0"
          )}
        >
          {hasCover && !isFullCover && (
            coverIsImage ? (
                 <div className="relative h-20 w-full">
                    <Image src={card.cover!.value} alt={card.title} fill className="object-cover rounded-t-lg" />
                 </div>
            ) : (
                <div className="h-8 rounded-t-lg" style={{backgroundColor: card.cover!.value}} />
            )
          )}
          {isFullCover && coverIsImage && (
             <div className="relative h-32 w-full text-white font-bold p-3 flex items-end rounded-lg overflow-hidden">
                <Image src={card.cover!.value} alt={card.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <span className="relative z-10">{card.title}</span>
             </div>
          )}
          <CardContent className={cn("p-3 space-y-2", isFullCover && "hidden")}>
            {card.labels && card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {card.labels.map(label => (
                  <div
                    key={label.id}
                    className="px-2 py-0.5 text-xs font-semibold rounded"
                    style={{ backgroundColor: `${label.color}33`, color: label.color }}
                  >
                    {label.text}
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm font-medium text-foreground">{card.title}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {totalChecklistItems > 0 && (
                   <Badge variant="outline" className={cn("flex items-center gap-1.5 text-xs px-2 py-1 leading-none rounded-md", 
                     completedChecklistItems === totalChecklistItems && totalChecklistItems > 0 
                       ? "bg-green-600/30 text-green-200 border-green-600/50" 
                       : "bg-muted text-muted-foreground border-border"
                   )}>
                      <CheckSquare className="h-3 w-3" />
                      {completedChecklistItems}/{totalChecklistItems}
                  </Badge>
              )}
              {card.dueDate && (
                  <Badge variant="outline" className="flex items-center gap-1.5 text-xs px-2 py-1 leading-none rounded-md bg-muted text-muted-foreground border-border">
                      <Clock className="h-3 w-3" />
                      {format(new Date(card.dueDate), "dd MMM")}
                  </Badge>
              )}
            </div>
          </CardContent>
        </UICard>
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openDialog}>
                <Edit className="h-4 w-4" />
            </Button>
             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDeleteClick}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>
      <CardDetailsDialog
        card={card}
        boardId={boardId}
        listTitle={listTitle}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCardUpdate={onCardUpdate}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the card "{card.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onCardDelete(listId, card.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
