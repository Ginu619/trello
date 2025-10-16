"use client";

import { addList, updateBoard, addCard } from "@/lib/data";
import type { Board, Card, List } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { KanbanList } from "./KanbanList";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type DragState = {
  cardId: string;
  sourceListId: string;
} | null;

export function BoardView({ initialBoard }: { initialBoard: Board }) {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [dragState, setDragState] = useState<DragState>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  const handleDragStart = (cardId: string, sourceListId: string) => {
    setDragState({ cardId, sourceListId });
  };

  const handleDragEnd = useCallback(async () => {
    if (!dragState) return;

    // Persist changes
    try {
      await updateBoard(board.id, { lists: board.lists });
    } catch (error) {
      console.error("Failed to update board", error);
      // Optionally, revert to `initialBoard` state on error
    }

    setDragState(null);
  }, [dragState, board]);

  const handleDragEnter = (targetListId: string, targetCardId: string | null) => {
    if (!dragState) return;

    const { cardId, sourceListId } = dragState;

    // Avoid unnecessary state updates
    if (targetListId === sourceListId && targetCardId === cardId) return;

    setBoard((prevBoard) => {
      const newBoard = JSON.parse(JSON.stringify(prevBoard));
      const sourceList = newBoard.lists.find((l: List) => l.id === sourceListId);
      if (!sourceList) return prevBoard;

      const cardIndex = sourceList.cards.findIndex((c: Card) => c.id === cardId);
      if (cardIndex === -1) return prevBoard;

      const [card] = sourceList.cards.splice(cardIndex, 1);
      
      const targetList = newBoard.lists.find((l: List) => l.id === targetListId);
      if (!targetList) return prevBoard;

      if (targetCardId) {
        const targetCardIndex = targetList.cards.findIndex((c: Card) => c.id === targetCardId);
        targetList.cards.splice(targetCardIndex, 0, card);
      } else {
        targetList.cards.push(card);
      }
      
      // Update order property (optional but good practice)
      targetList.cards.forEach((c: Card, i: number) => c.order = i);
      if (sourceListId !== targetListId) {
        sourceList.cards.forEach((c: Card, i: number) => c.order = i);
      }

      return newBoard;
    });

    // Update dragState to reflect the card's new list
    setDragState({ cardId, sourceListId: targetListId });
  };
  
  const handleAddNewList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    const optimisticList: List = {
      id: `temp-${Date.now()}`,
      title: newListTitle,
      cards: [],
    };

    setBoard(b => ({ ...b, lists: [...b.lists, optimisticList] }));
    setIsAddingList(false);
    setNewListTitle("");

    try {
      const newList = await addList(board.id, newListTitle);
      setBoard(b => ({
        ...b,
        lists: b.lists.map(l => l.id === optimisticList.id ? newList : l)
      }));
    } catch (error) {
      console.error("Failed to add list", error);
      setBoard(b => ({
        ...b,
        lists: b.lists.filter(l => l.id !== optimisticList.id)
      }));
    }
  };

  const handleAddNewCard = async (listId: string, title: string) => {
    const optimisticCard: Card = {
        id: `temp-card-${Date.now()}`,
        title,
        order: board.lists.find(l => l.id === listId)?.cards.length || 0,
    };

    setBoard(b => {
        const newBoard = { ...b };
        const list = newBoard.lists.find(l => l.id === listId);
        if (list) {
            list.cards.push(optimisticCard);
        }
        return newBoard;
    });

    try {
        const newCard = await addCard(board.id, listId, title);
        setBoard(b => {
            const newBoard = JSON.parse(JSON.stringify(b));
            const list = newBoard.lists.find((l: List) => l.id === listId);
            if (list) {
                const cardIndex = list.cards.findIndex((c: Card) => c.id === optimisticCard.id);
                if (cardIndex !== -1) {
                    list.cards[cardIndex] = newCard;
                }
            }
            return newBoard;
        });
    } catch(error) {
        console.error("Failed to add card", error);
        setBoard(b => {
            const newBoard = JSON.parse(JSON.stringify(b));
            const list = newBoard.lists.find((l: List) => l.id === listId);
            if (list) {
                list.cards = list.cards.filter((c: Card) => c.id !== optimisticCard.id);
            }
            return newBoard;
        });
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        <div className="p-4 bg-background/80 backdrop-blur-sm border-b">
            <h1 className="text-2xl font-bold">{board.title}</h1>
        </div>
      <div className="flex-grow p-4 overflow-x-auto">
        <div className="inline-flex items-start gap-4 h-full">
          {board.lists.map((list) => (
            <KanbanList
              key={list.id}
              list={list}
              boardId={board.id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragEnter={handleDragEnter}
              onAddNewCard={handleAddNewCard}
              draggedCardId={dragState?.cardId}
            />
          ))}
          <div className="w-72 flex-shrink-0">
            {isAddingList ? (
              <form onSubmit={handleAddNewList} className="bg-muted p-2 rounded-lg">
                <Input
                  autoFocus
                  placeholder="Enter list title..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="mb-2"
                />
                <div className="flex items-center gap-2">
                  <Button type="submit" size="sm">Add List</Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingList(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setIsAddingList(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add another list
            </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
