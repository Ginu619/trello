
"use client";

import type { Card } from "@/lib/types";
import { useState } from "react";
import { Card as UICard, CardContent } from "../ui/card";
import { CardDetailsDialog } from "./CardDetailsDialog";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Clock, CheckSquare } from "lucide-react";
import { format } from 'date-fns';

interface KanbanCardProps {
  card: Card;
  listId: string;
  listTitle: string;
  isDragged: boolean;
  onDragStart: (cardId: string, listId: string) => void;
  onDragEnd: () => void;
  onDragEnter: (listId: string, cardId: string) => void;
  onCardUpdate: (updatedCard: Card) => void;
}

export function KanbanCard({
  card,
  listId,
  listTitle,
  isDragged,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onCardUpdate,
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
  
  const completedChecklistItems = card.checklist?.filter(item => item.completed).length || 0;
  const totalChecklistItems = card.checklist?.length || 0;


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
        <CardContent className="p-0 space-y-2">
            {card.labels && card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {card.labels.map(label => (
                        <span key={label.id} className={cn("px-2 py-1 rounded text-xs font-semibold text-white", label.color)}>
                            {label.text}
                        </span>
                    ))}
                </div>
            )}
          <p className="text-sm">{card.title}</p>
          <div className="flex justify-between items-center text-muted-foreground">
             <div className="flex items-center gap-2">
                {card.dueDate && (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {format(new Date(card.dueDate), "MMM d")}
                    </Badge>
                )}
                {totalChecklistItems > 0 && (
                     <Badge variant="outline" className={cn("flex items-center gap-1 text-xs", completedChecklistItems === totalChecklistItems && "bg-green-500/20 text-green-300 border-green-500/30")}>
                        <CheckSquare className="h-3 w-3" />
                        {completedChecklistItems}/{totalChecklistItems}
                    </Badge>
                )}
             </div>
              {card.members && card.members.length > 0 && (
                <div className="flex -space-x-2">
                    {card.members.map(memberId => (
                        <Avatar key={memberId} className="h-6 w-6 border-2 border-background">
                           <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${memberId.replace('user-','')}`} />
                           <AvatarFallback>{memberId.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
              )}
          </div>
        </CardContent>
      </UICard>
      <CardDetailsDialog
        card={card}
        listTitle={listTitle}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCardUpdate={onCardUpdate}
      />
    </>
  );
}
