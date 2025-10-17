export type Attachment = {
  id: string;
  name: string;
  url: string;
  type: "image" | "file";
  createdAt: string;
};

export type Card = {
  id: string;
  title: string;
  description?: string;
  order: number;
  members?: string[];
  labels?: Label[];
  checklist?: ChecklistItem[];
  dueDate?: string;
  attachments?: Attachment[];
  comments?: Comment[];
  activities?: Activity[];
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

export type Comment = {
    id: string;
    userId: string;
    text: string;
    createdAt: string;
}

export type Activity = {
    id: string;
    userId: string;
    description: string;
    createdAt: string;
}
