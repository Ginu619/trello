export type Card = {
  id: string;
  title: string;
  description?: string;
  order: number;
  members?: string[];
  labels?: Label[];
  checklist?: ChecklistItem[];
  dueDate?: string;
};

export type Label = {
  id: string;
  text: string;
  color: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type List = {
  id: string;
  title: string;
  cards: Card[];
};

export type Board = {
  id: string;
  title: string;
  lists: List[];
};

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
}
