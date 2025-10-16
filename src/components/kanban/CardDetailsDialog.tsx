
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
import { useEffect, useState, type FormEvent, useRef } from "react";
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
import { cn } from "@/lib/utils";

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
  const descriptionEditorRef = useRef<HTMLDivElement>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(card.title);
      setDescription(card.description || "");
      setIsEditingDescription(false);
    }
  }, [isOpen, card]);

  const handleDescriptionSave = async () => {
    setIsSaving(true);
    try {
      const newDescription = descriptionEditorRef.current?.innerHTML || '';
      const updatedCard = await updateCard("board-1", card.id, {
        description: newDescription,
      });
      onCardUpdate(updatedCard);
      setDescription(newDescription);
      toast({ title: "Description updated successfully!" });
      setIsEditingDescription(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update description.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleBlur = async () => {
    if (title === card.title) return;
    try {
      const updatedCard = await updateCard("board-1", card.id, { title });
      onCardUpdate(updatedCard);
      toast({ title: "Card title updated." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update card title.",
        variant: "destructive",
      });
      setTitle(card.title); // Revert on error
    }
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    descriptionEditorRef.current?.focus();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-start gap-3">
            <CheckSquare className="h-6 w-6 mt-1 text-muted-foreground" />
            <div className="w-full">
              <DialogTitle>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                  aria-label="Card title"
                />
              </DialogTitle>
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
                {isEditingDescription ? (
                  <div className="bg-input/50 rounded-md">
                    <div className="flex items-center gap-1 p-2 border-b border-border">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('formatBlock', 'p')}><Type className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('bold')}><Bold className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('italic')}><Italic className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('insertUnorderedList')}><List className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('insertOrderedList')}><ListOrdered className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('createLink', window.prompt("Enter URL:") || undefined)}><Link2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('formatBlock', 'pre')}><Code className="h-4 w-4" /></Button>
                   </div>
                    <div
                        ref={descriptionEditorRef}
                        contentEditable
                        dangerouslySetInnerHTML={{ __html: description }}
                        className="min-h-[150px] p-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                    <div className="flex items-center gap-2 p-2">
                        <Button onClick={handleDescriptionSave} disabled={isSaving} size="sm">
                            {isSaving && <Loader2 className="mr-2 animate-spin" />}
                            Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingDescription(false)}>
                            Cancel
                        </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingDescription(true)}
                    className={cn(
                      "min-h-[100px] w-full rounded-md bg-input/40 p-3 text-sm hover:bg-input/60 cursor-pointer",
                      !description && "text-muted-foreground"
                    )}
                    dangerouslySetInnerHTML={{ __html: description || "Add a more detailed description..."}}
                   />
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
