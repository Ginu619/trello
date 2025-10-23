
"use client";

import { Header } from "@/components/Header";
import { BoardView } from "@/components/kanban/BoardView";
import { getBoard, getBoards } from "@/lib/data";
import { Board } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [boardData, boardsData] = await Promise.all([
        getBoard(boardId),
        getBoards(),
      ]);

      if (!boardData) {
        notFound();
        return;
      }
      setBoard(boardData);
      setBoards(boardsData);
      setLoading(false);
    };

    if (boardId) {
      fetchData();
    }
  }, [boardId]);


  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (!board) {
    // This case is handled by notFound() in useEffect, but as a fallback
    return <div>Board not found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header boards={boards} currentBoardId={boardId} />
      <main className="flex-grow">
        <BoardView initialBoard={board} />
      </main>
    </div>
  );
}
