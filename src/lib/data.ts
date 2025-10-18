
import type { Board, List, Card, User, Label, ChecklistItem, Comment, Activity, Attachment, Meeting } from './types';

const users: User[] = [
  { id: 'user-1', name: 'Alex', email: 'alex@example.com', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex' },
  { id: 'user-2', name: 'Beth', email: 'beth@example.com', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Beth' },
  { id: 'user-3', name: 'Chris', email: 'chris@example.com', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Chris' },
];

const labels: Label[] = [
    { id: 'label-1', text: 'Feature', color: '#10B981' }, // green-500
    { id: 'label-2', text: 'Bug', color: '#EF4444' }, // red-500
    { id: 'label-3', text: 'Design', color: '#3B82F6' }, // blue-500
    { id: 'label-4', text: 'Docs', color: '#F59E0B' }, // yellow-500
    { id: 'label-5', text: 'Urgent', color: '#8B5CF6' }, // purple-500
];


let boards: Board[] = [
  {
    id: 'board-1',
    title: 'Project Phoenix',
    lists: [
      {
        id: 'list-1',
        title: 'To Do',
        cards: [
          { id: 'card-1', title: 'Design the new login page', order: 0, members: ['user-1'], labels: [labels[2]], comments: [], activities: [{id: 'activity-1', userId: 'user-1', description: 'added this card to To Do', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }] },
          { id: 'card-2', title: 'Develop API for user authentication', order: 1, members: ['user-2'], labels: [labels[0]], dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), comments: [], activities: [], cover: { type: 'image', value: 'https://picsum.photos/seed/auth/600/400', size: 'normal' } },
          { id: 'card-3', title: 'Fix bug in the reporting dashboard', order: 2, members: ['user-1', 'user-2'], labels: [labels[1], labels[4]], checklist: [{id: 'check-1', text: 'Identify bug', completed: true}, {id: 'check-2', text: 'Fix bug', completed: false}], comments: [], activities: []},
        ],
      },
      {
        id: 'list-2',
        title: 'In Progress',
        cards: [
          { id: 'card-4', title: 'Implement new search functionality', order: 0, members: ['user-3'], comments: [], activities: [], cover: { type: 'color', value: '#3B82F6', size: 'full'} },
        ],
      },
      {
        id: 'list-3',
        title: 'Done',
        cards: [
          { id: 'card-5', title: 'Update documentation for v2.0', order: 0, labels: [labels[3]], comments: [], activities: [] },
          { id: 'card-6', title: 'Release performance improvements', order: 1, comments: [], activities: [] },
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
          { id: 'card-7', title: 'Social media outreach strategy', order: 0, comments: [], activities: [] },
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

let meetings: Meeting[] = [
    {
        id: 'meeting-1',
        title: 'Project Phoenix - Sprint Planning',
        description: 'Plan the upcoming sprint for Project Phoenix. Review backlog and assign tasks.',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        participants: ['user-1', 'user-2', 'user-3'],
        meetingLink: 'https://meet.google.com/xyz-abc-def',
        project: 'Project Phoenix',
        status: 'upcoming'
    },
    {
        id: 'meeting-2',
        title: 'Marketing Weekly Sync',
        description: 'Weekly sync for the marketing team to discuss campaign progress.',
        startDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        participants: ['user-1', 'user-2'],
        meetingLink: 'https://meet.google.com/xyz-abc-def',
        project: 'Marketing Campaign',
        status: 'ongoing'
    },
    {
        id: 'meeting-3',
        title: 'Q3 Product Roadmap Review',
        description: 'Review the product roadmap for the third quarter.',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
        participants: ['user-1', 'user-3'],
        meetingLink: 'https://meet.google.com/xyz-abc-def',
        project: 'Project Phoenix',
        status: 'past'
    }
];


// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getMeetings(): Promise<Meeting[]> {
    await delay(100);
    const sortedMeetings = JSON.parse(JSON.stringify(meetings)).sort((a: Meeting, b: Meeting) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    return sortedMeetings;
}

export async function createMeeting(meetingData: Omit<Meeting, 'id' | 'status'>): Promise<Meeting> {
    await delay(100);
    const newMeeting: Meeting = {
        ...meetingData,
        id: `meeting-${Date.now()}`,
        status: new Date(meetingData.startDate) > new Date() ? 'upcoming' : 'ongoing',
    };
    meetings.unshift(newMeeting);
    return newMeeting;
}

export async function updateMeeting(meetingId: string, updates: Partial<Omit<Meeting, 'id' | 'status'>>): Promise<Meeting> {
    await delay(100);
    const meetingIndex = meetings.findIndex(m => m.id === meetingId);
    if (meetingIndex === -1) throw new Error("Meeting not found");
    
    const originalMeeting = meetings[meetingIndex];
    const updatedMeeting = { ...originalMeeting, ...updates };

    if(updates.startDate) {
        updatedMeeting.status = new Date(updates.startDate) > new Date() ? 'upcoming' : 'ongoing';
    }

    meetings[meetingIndex] = updatedMeeting;
    return updatedMeeting;
}

export async function deleteMeeting(meetingId: string): Promise<void> {
    await delay(100);
    meetings = meetings.filter(m => m.id !== meetingId);
}


export async function getTeamMembers(): Promise<User[]> {
    await delay(50);
    return users;
}

export async function getAvailableLabels(): Promise<Label[]> {
    await delay(50);
    return labels;
}

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

export async function updateList(boardId: string, listId: string, updates: Partial<List>): Promise<List> {
    await delay(50);
    const board = boards.find(b => b.id === boardId);
    if (!board) throw new Error("Board not found");
    const list = board.lists.find(l => l.id === listId);
    if (!list) throw new Error("List not found");
    
    Object.assign(list, updates);
    return JSON.parse(JSON.stringify(list));
}

export async function deleteList(boardId: string, listId: string): Promise<void> {
    await delay(50);
    const board = boards.find(b => b.id === boardId);
    if (!board) throw new Error("Board not found");
    board.lists = board.lists.filter(l => l.id !== listId);
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
            // Handle cover property separately to allow removal
            if ('cover' in updates && updates.cover === null) {
                delete list.cards[cardIndex].cover;
            } else {
                list.cards[cardIndex] = { ...list.cards[cardIndex], ...updates };
            }
            return JSON.parse(JSON.stringify(list.cards[cardIndex]));
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
