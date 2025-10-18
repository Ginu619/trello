
import { BoardView } from "@/components/kanban/BoardView";
import { getBoard } from "@/lib/data";
import { notFound } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";

interface BoardPageProps {
  params: {
    boardId: string;
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const board = await getBoard(params.boardId);

  if (!board) {
    notFound();
  }

  return (
    <Dashboard>
        <BoardView initialBoard={board} />
    </Dashboard>
  );
}
