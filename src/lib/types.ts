
export type Attachment = {
  id: string;
  name: string;
  url: string;
  type: "image" | "file";
  createdAt: string;
};

export type CardCover = {
    type: 'color' | 'image';
    value: string;
    size: 'normal' | 'full';
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
  cover?: CardCover;
};

export type Label = {
  id:string;
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
  email: string;
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

export type Meeting = {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    participants: string[];
    meetingLink: string;
    project?: string;
    status: 'upcoming' | 'ongoing' | 'past';
}
