import type { Board, List, Card } from './types';

let boards: Board[] = [
  {
    id: 'board-1',
    title: 'Project Phoenix',
    lists: [
      {
        id: 'list-1',
        title: 'To Do',
        cards: [
          { id: 'card-1', title: 'Design the new login page', order: 0 },
          { id: 'card-2', title: 'Develop API for user authentication', order: 1 },
          { id: 'card-3', title: 'Fix bug in the reporting dashboard', order: 2 },
        ],
      },
      {
        id: 'list-2',
        title: 'In Progress',
        cards: [
          { id: 'card-4', title: 'Implement new search functionality', order: 0 },
        ],
      },
      {
        id: 'list-3',
        title: 'Done',
        cards: [
          { id: 'card-5', title: 'Update documentation for v2.0', order: 0 },
          { id: 'card-6', title: 'Release performance improvements', order: 1 },
        ],
      },
    ],
  },
    {
    id: 'board-2',
    title: 'Marketing Campaign',
    lists: [
      {
        id: 'list-4',
        title: 'Ideas',
        cards: [
          { id: 'card-7', title: 'Social media outreach strategy', order: 0 },
        ],
      },
      {
        id: 'list-5',
        title: 'Content Creation',
        cards: [],
      },
       {
        id: 'list-6',
        title: 'Published',
        cards: [],
      },
    ],
  },
];

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getBoards(): Promise<Board[]> {
  await delay(100);
  return boards.map(({ id, title }) => ({ id, title, lists: [] }));
}

export async function getBoard(boardId: string): Promise<Board | undefined> {
  await delay(100);
  return JSON.parse(JSON.stringify(boards.find(b => b.id === boardId)));
}

export async function updateBoard(boardId: string, updatedData: Partial<Board>): Promise<Board> {
    await delay(50);
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex === -1) {
        throw new Error("Board not found");
    }
    const updatedBoard = { ...boards[boardIndex], ...updatedData };
    boards[boardIndex] = updatedBoard;
    return JSON.parse(JSON.stringify(updatedBoard));
}

export async function createBoard(title: string): Promise<Board> {
  await delay(100);
  const newBoard: Board = {
    id: `board-${Date.now()}`,
    title,
    lists: [
      { id: `list-${Date.now()}-1`, title: 'To Do', cards: [] },
      { id: `list-${Date.now()}-2`, title: 'In Progress', cards: [] },
      { id: `list-${Date.now()}-3`, title: 'Done', cards: [] },
    ],
  };
  boards.push(newBoard);
  return newBoard;
}

export async function addList(boardId: string, title: string): Promise<List> {
    await delay(100);
    const board = boards.find(b => b.id === boardId);
    if (!board) throw new Error("Board not found");
    
    const newList: List = {
        id: `list-${Date.now()}`,
        title,
        cards: []
    };
    board.lists.push(newList);
    return newList;
}

export async function addCard(boardId: string, listId: string, title: string): Promise<Card> {
    await delay(50);
    const board = boards.find(b => b.id === boardId);
    if (!board) throw new Error("Board not found");

    const list = board.lists.find(l => l.id === listId);
    if (!list) throw new Error("List not found");

    const newCard: Card = {
        id: `card-${Date.now()}`,
        title,
        order: list.cards.length
    };
    list.cards.push(newCard);
    return newCard;
}

export async function updateCard(boardId: string, cardId: string, updates: Partial<Card>): Promise<Card> {
    await delay(50);
    const board = boards.find(b => b.id === boardId);
    if (!board) throw new Error("Board not found");

    for (const list of board.lists) {
        const cardIndex = list.cards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            list.cards[cardIndex] = { ...list.cards[cardIndex], ...updates };
            return list.cards[cardIndex];
        }
    }
    throw new Error("Card not found");
}

export async function deleteCard(boardId: string, listId: string, cardId: string): Promise<void> {
    await delay(50);
    const board = boards.find(b => b.id === boardId);
    if (!board) throw new Error("Board not found");

    const list = board.lists.find(l => l.id === listId);
    if (!list) throw new Error("List not found");
    
    list.cards = list.cards.filter(c => c.id !== cardId);
}
