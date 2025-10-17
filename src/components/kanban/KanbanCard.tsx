
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

  const openDialog = () => setIsDialogOpen(true);

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
            "p-3 cursor-pointer transition-colors bg-card/90",
            isDragged && "opacity-50 ring-2 ring-primary",
            isDraggingOver && !isDragged && "ring-2 ring-accent"
          )}
        >
          <CardContent className="p-0 space-y-2">
            {card.labels && card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {card.labels.map(label => (
                   <div 
                     key={label.id} 
                     className="px-2 py-1 text-xs font-semibold text-white rounded-full"
                     style={{ backgroundColor: label.color }}
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
             <Button variant="ghost" size="icon" className="h-7 w-7">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>
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
