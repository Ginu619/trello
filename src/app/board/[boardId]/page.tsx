import { Header } from "@/components/Header";
import { BoardView } from "@/components/kanban/BoardView";
import { getBoard, getBoards } from "@/lib/data";
import { notFound } from "next/navigation";

interface BoardPageProps {
  params: {
    boardId: string;
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const board = await getBoard(params.boardId);
  const boards = await getBoards();

  if (!board) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header boards={boards} currentBoardId={params.boardId} />
      <main className="flex-grow">
        <BoardView initialBoard={board} />
      </main>
    </div>
  );
}
