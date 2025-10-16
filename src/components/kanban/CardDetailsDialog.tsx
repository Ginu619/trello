
"use client";

import type { Card } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateCard } from "@/lib/data";
import {
  Activity,
  Bold,
  Check,
  CheckSquare,
  Clock,
  Code,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Paperclip,
  Plus,
  Tag,
  Type,
  UserPlus,
  Users,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";

interface CardDetailsDialogProps {
  card: Card;
  listTitle: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCardUpdate: (updatedCard: Card) => void;
}

export function CardDetailsDialog({
  card,
  listTitle,
  isOpen,
  onOpenChange,
  onCardUpdate,
}: CardDetailsDialogProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle(card.title);
      setDescription(card.description || "");
    }
  }, [isOpen, card]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedCard = await updateCard("board-1", card.id, {
        title,
        description,
      });
      onCardUpdate(updatedCard);
      toast({ title: "Card updated successfully!" });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update card.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    title !== card.title || description !== (card.description || "");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="sr-only">Card Details</DialogTitle>
          <div className="flex items-start gap-3">
            <CheckSquare className="h-6 w-6 mt-1 text-muted-foreground" />
            <div className="w-full">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                aria-label="Card title"
              />
              <p className="text-sm text-muted-foreground">
                in list <span className="underline">{listTitle}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-8 p-4 overflow-y-auto">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Action Buttons */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Add to card
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm">
                  <Users className="mr-2" /> Members
                </Button>
                <Button variant="secondary" size="sm">
                  <Tag className="mr-2" /> Labels
                </Button>
                <Button variant="secondary" size="sm">
                  <CheckSquare className="mr-2" /> Checklist
                </Button>
                <Button variant="secondary" size="sm">
                  <Clock className="mr-2" /> Dates
                </Button>
                <Button variant="secondary" size="sm">
                  <Paperclip className="mr-2" /> Attachment
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <List className="h-6 w-6 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Description</h3>
                </div>
              <div className="pl-9">
                <div className="bg-input/50 rounded-md">
                   <div className="flex items-center gap-1 p-2 border-b border-border">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Type className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Bold className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Italic className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><List className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><ListOrdered className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Link2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Code className="h-4 w-4" /></Button>
                   </div>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                    className="min-h-[150px] bg-transparent border-0 focus-visible:ring-0 shadow-none"
                  />
                </div>
                {hasChanges && (
                    <div className="flex items-center gap-2 mt-2">
                        <Button onClick={handleSubmit} disabled={isSaving} size="sm">
                            {isSaving && <Loader2 className="mr-2 animate-spin" />}
                            Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                            setTitle(card.title);
                            setDescription(card.description || '');
                        }}>
                            Cancel
                        </Button>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Comments and Activity */}
            <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Comments and activity</h3>
                </div>
                <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <Textarea placeholder="Write a comment..." className="flex-1" rows={1}/>
                </div>
            </div>

            <div className="space-y-4 pl-9">
                 <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm">
                           <span className="font-semibold">Bony</span> added this card to {listTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">12 hours ago</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
