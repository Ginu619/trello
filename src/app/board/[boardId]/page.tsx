import { Header } from "@/components/Header";
import { BoardView } from "@/components/kanban/BoardView";
import { getBoard } from "@/lib/data";
import { notFound } from "next/navigation";

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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <BoardView initialBoard={board} />
      </main>
    </div>
  );
}
