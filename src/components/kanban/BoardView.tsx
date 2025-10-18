
"use client";

import { addList, updateBoard, addCard, updateList, deleteList as deleteListFromDB } from "@/lib/data";
import type { Board, Card, List } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { KanbanList } from "./KanbanList";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type CardDragState = {
  cardId: string;
  sourceListId: string;
} | null;

export function BoardView({ initialBoard }: { initialBoard: Board }) {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [cardDragState, setCardDragState] = useState<CardDragState>(null);
  const [draggedListId, setDraggedListId] = useState<string | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  const handleCardDragStart = (cardId: string, sourceListId: string) => {
    setCardDragState({ cardId, sourceListId });
  };
  
  const handleListDragStart = (listId: string) => {
    setDraggedListId(listId);
  };

  const persistBoardUpdate = useCallback(async () => {
    try {
        await updateBoard(board.id, { lists: board.lists });
    } catch (error) {
        console.error("Failed to update board", error);
        // Optionally, revert to `initialBoard` state on error
        setBoard(initialBoard);
    }
  }, [board.id, board.lists, initialBoard]);

  const handleDragEnd = useCallback(() => {
    if (cardDragState || draggedListId) {
        persistBoardUpdate();
    }
    setCardDragState(null);
    setDraggedListId(null);
  }, [cardDragState, draggedListId, persistBoardUpdate]);

  const handleCardDragEnter = (targetListId: string, targetCardId: string | null) => {
    if (!cardDragState) return;

    const { cardId, sourceListId } = cardDragState;
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
      
      targetList.cards.forEach((c: Card, i: number) => c.order = i);
      if (sourceListId !== targetListId) {
        sourceList.cards.forEach((c: Card, i: number) => c.order = i);
      }

      return newBoard;
    });

    setCardDragState({ cardId, sourceListId: targetListId });
  };
  
  const handleListDragEnter = (targetListId: string) => {
    if (!draggedListId || draggedListId === targetListId) return;

    setBoard(prevBoard => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        const draggedListIndex = newBoard.lists.findIndex((l: List) => l.id === draggedListId);
        const targetListIndex = newBoard.lists.findIndex((l: List) => l.id === targetListId);

        if (draggedListIndex === -1 || targetListIndex === -1) return prevBoard;
        
        const [draggedList] = newBoard.lists.splice(draggedListIndex, 1);
        newBoard.lists.splice(targetListIndex, 0, draggedList);
        
        return newBoard;
    });
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
        id: `temp-card-${Date.now()}-${Math.random()}`,
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

  const handleCardUpdate = (updatedCard: Card) => {
    setBoard(b => {
        const newBoard = JSON.parse(JSON.stringify(b));
        for (const list of newBoard.lists) {
            const cardIndex = list.cards.findIndex((c: Card) => c.id === updatedCard.id);
            if (cardIndex !== -1) {
                list.cards[cardIndex] = updatedCard;
                break;
            }
        }
        return newBoard;
    });
  }

  const handleListUpdate = async (listId: string, updates: Partial<List>) => {
    const originalLists = board.lists;
    setBoard(b => ({
      ...b,
      lists: b.lists.map(l => l.id === listId ? {...l, ...updates} : l)
    }));

    try {
      await updateList(board.id, listId, updates);
    } catch (error) {
      console.error("Failed to update list", error);
      setBoard(b => ({ ...b, lists: originalLists }));
    }
  };

  const handleListDelete = async (listId: string) => {
    const originalLists = board.lists;
    setBoard(b => ({
      ...b,
      lists: b.lists.filter(l => l.id !== listId)
    }));

    try {
      await deleteListFromDB(board.id, listId);
    } catch (error) {
      console.error("Failed to delete list", error);
      setBoard(b => ({ ...b, lists: originalLists }));
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]" onDragEnd={handleDragEnd}>
      <div className="flex-grow px-4 sm:px-6 lg:px-8 py-4 overflow-x-auto">
        <div className="inline-flex items-start gap-4 h-full">
          {board.lists.map((list) => (
            <KanbanList
              key={list.id}
              list={list}
              boardId={board.id}
              onCardDragStart={handleCardDragStart}
              onCardDragEnter={handleCardDragEnter}
              onListDragStart={handleListDragStart}
              onListDragEnter={handleListDragEnter}
              onDragEnd={handleDragEnd}
              onAddNewCard={handleAddNewCard}
              onCardUpdate={handleCardUpdate}
              onListUpdate={handleListUpdate}
              onListDelete={handleListDelete}
              draggedCardId={cardDragState?.cardId}
              isListDragged={draggedListId === list.id}
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
