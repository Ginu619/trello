
"use client";

import type { Card, User, Label as LabelType, ChecklistItem, Comment, Activity as ActivityType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState, type FormEvent, useRef, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateCard, getTeamMembers, getAvailableLabels } from "@/lib/data";
import {
  Activity, Bold, Check, CheckSquare, Clock, Code, Italic, Link2, List, ListOrdered, Loader2,
  Paperclip, Plus, Tag, Type, UserPlus, Users, MessageSquare, X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Calendar } from "../ui/calendar";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Progress } from "../ui/progress";
import { useAuth } from "@/hooks/useAuth";

interface CardDetailsDialogProps {
  card: Card;
  listTitle: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCardUpdate: (updatedCard: Card) => void;
}

export function CardDetailsDialog({
  card: initialCard,
  listTitle,
  isOpen,
  onOpenChange,
  onCardUpdate,
}: CardDetailsDialogProps) {
  const { user: currentUser } = useAuth();
  const [card, setCard] = useState(initialCard);
  const [title, setTitle] = useState(initialCard.title);
  const [description, setDescription] = useState(initialCard.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [team, setTeam] = useState<User[]>([]);
  const [availableLabels, setAvailableLabels] = useState<LabelType[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);
  
  const { toast } = useToast();
  const descriptionEditorRef = useRef<HTMLDivElement>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCard(initialCard);
      setTitle(initialCard.title);
      setDescription(initialCard.description || "");
      setIsEditingDescription(false);
      setNewComment("");
      
      getTeamMembers().then(setTeam);
      getAvailableLabels().then(setAvailableLabels);
    }
  }, [isOpen, initialCard]);
  
  const handleUpdateCard = async (updates: Partial<Card>) => {
    try {
        const updatedCard = await updateCard("board-1", card.id, updates);
        setCard(updatedCard);
        onCardUpdate(updatedCard);
        return updatedCard;
    } catch (error) {
        toast({ title: "Error", description: "Failed to update card.", variant: "destructive" });
    }
  }

  const handleDescriptionSave = async () => {
    setIsSaving(true);
    const newDescription = descriptionEditorRef.current?.innerHTML || '';
    await handleUpdateCard({ description: newDescription });
    setDescription(newDescription);
    setIsEditingDescription(false);
    setIsSaving(false);
    toast({ title: "Description updated." });
  };

  const handleTitleBlur = async () => {
    if (title === card.title) return;
    await handleUpdateCard({ title });
    toast({ title: "Card title updated." });
  };

  const handleMemberToggle = (memberId: string) => {
    const members = card.members || [];
    const newMembers = members.includes(memberId)
      ? members.filter(id => id !== memberId)
      : [...members, memberId];
    handleUpdateCard({ members: newMembers });
  };

  const handleLabelToggle = (labelId: string) => {
    const labels = card.labels || [];
    const newLabels = labels.some(l => l.id === labelId)
      ? labels.filter(l => l.id !== labelId)
      : [...labels, availableLabels.find(l => l.id === labelId)!];
    handleUpdateCard({ labels: newLabels });
  };
  
  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
      id: `check-${Date.now()}`,
      text: newChecklistItem,
      completed: false,
    };
    const newChecklist = [...(card.checklist || []), newItem];
    handleUpdateCard({ checklist: newChecklist });
    setNewChecklistItem("");
  };

  const handleChecklistItemToggle = (itemId: string) => {
    const newChecklist = card.checklist?.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ) || [];
    handleUpdateCard({ checklist: newChecklist });
  };

  const handleChecklistItemDelete = (itemId: string) => {
    const newChecklist = card.checklist?.filter(item => item.id !== itemId) || [];
    handleUpdateCard({ checklist: newChecklist });
  };

  const handleDueDateSelect = (date: Date | undefined) => {
    handleUpdateCard({ dueDate: date?.toISOString() });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    setIsSavingComment(true);
    const newCommentObject: Comment = {
        id: `comment-${Date.now()}`,
        userId: currentUser.id,
        text: newComment,
        createdAt: new Date().toISOString()
    };
    const newComments = [...(card.comments || []), newCommentObject];
    const updatedCard = await handleUpdateCard({ comments: newComments });
    if(updatedCard) {
      setCard(prevCard => ({
        ...prevCard,
        comments: updatedCard.comments,
        activities: updatedCard.activities
      }));
    }
    setNewComment("");
    setIsSavingComment(false);
  }

  const applyFormat = (command: string) => {
    document.execCommand(command, false);
  };
  
  const checklistProgress = (card.checklist?.length ?? 0) > 0 ? ((card.checklist?.filter(i => i.completed).length ?? 0) / card.checklist!.length) * 100 : 0;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const allActivities = useMemo(() => [
    ...(card.comments?.map(c => ({...c, type: 'comment'} as const)) || []),
    ...(card.activities?.map(a => ({...a, type: 'activity'} as const)) || [])
  ].sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()), [card.comments, card.activities]);

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
            <div className="flex items-start gap-6 flex-wrap">
              {card.members && card.members.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2">Members</h3>
                  <div className="flex -space-x-2">
                    {card.members.map(memberId => {
                        const member = team.find(m => m.id === memberId);
                        if (!member) return null;
                        return (
                            <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                                <AvatarImage src={member.avatarUrl} />
                                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                        )
                    })}
                  </div>
                </div>
              )}
               {card.labels && card.labels.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2">Labels</h3>
                  <div className="flex flex-wrap gap-1">
                    {card.labels.map(label => (
                        <div key={label.id} className="px-3 py-1 text-sm font-semibold rounded-md" style={{backgroundColor: `${label.color}33`, color: label.color}}>
                            {label.text}
                        </div>
                    ))}
                </div>
                </div>
              )}
              {card.dueDate && (
                 <div>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2">Due date</h3>
                  <p className="text-sm">{format(parseISO(card.dueDate), "MMM d, yyyy")}</p>
                </div>
              )}
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => { e.preventDefault(); applyFormat('bold')}}><Bold className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => { e.preventDefault(); applyFormat('italic')}}><Italic className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => { e.preventDefault(); applyFormat('insertUnorderedList')}}><List className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => { e.preventDefault(); applyFormat('insertOrderedList')}}><ListOrdered className="h-4 w-4" /></Button>
                   </div>
                    <div
                        ref={descriptionEditorRef}
                        contentEditable
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{ __html: description }}
                        onInput={(e) => setDescription(e.currentTarget.innerHTML)}
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
                      "min-h-[100px] w-full rounded-md bg-input/40 p-3 text-sm hover:bg-input/60 cursor-pointer prose prose-sm prose-invert max-w-none",
                      !description && "text-muted-foreground"
                    )}
                    dangerouslySetInnerHTML={{ __html: description || "Add a more detailed description..."}}
                   />
                )}
              </div>
            </div>

            {/* Checklist */}
            {card.checklist && card.checklist.length > 0 && (
                 <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="h-6 w-6 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Checklist</h3>
                    </div>
                    <div className="pl-9 space-y-2">
                        <Progress value={checklistProgress} className="h-2" />
                        {card.checklist.map(item => (
                            <div key={item.id} className="flex items-center gap-2 group">
                                <Checkbox id={`check-${item.id}`} checked={item.completed} onCheckedChange={() => handleChecklistItemToggle(item.id)} />
                                <label htmlFor={`check-${item.id}`} className={cn("flex-grow text-sm", item.completed && "line-through text-muted-foreground")}>{item.text}</label>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleChecklistItemDelete(item.id)}><X className="h-4 w-4" /></Button>
                            </div>
                        ))}
                    </div>
                 </div>
            )}
             {/* Comments and Activity */}
            <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Comments and Activity</h3>
                </div>
                <div className="pl-9 space-y-4">
                    <div className="flex gap-3">
                        {currentUser && (
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser.avatarUrl} />
                                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className="flex-1 space-y-2">
                            <Textarea 
                                placeholder="Write a comment..." 
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                className="w-full"
                            />
                            {newComment && (
                                <Button onClick={handleAddComment} disabled={isSavingComment} size="sm">
                                    {isSavingComment && <Loader2 className="mr-2 animate-spin" />}
                                    Save
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {allActivities.map(activity => {
                             const member = team.find(m => m.id === activity.userId);
                             if (!member) return null;
                            
                             if (activity.type === 'comment') {
                                return (
                                    <div key={activity.id} className="flex items-start gap-3">
                                         <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.avatarUrl} />
                                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm">
                                               <span className="font-semibold">{member.name}</span>
                                               <span className="text-xs text-muted-foreground ml-2">{formatDistanceToNow(parseISO(activity.createdAt), { addSuffix: true })}</span>
                                            </p>
                                            <div className="p-2 mt-1 bg-muted/50 rounded-md text-sm">{activity.text}</div>
                                        </div>
                                    </div>
                                )
                             }
                             return (
                                <div key={activity.id} className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.avatarUrl} />
                                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm">
                                            <span className="font-semibold">{member.name}</span> {activity.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(parseISO(activity.createdAt), { addSuffix: true })}</p>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Add to card
              </h3>
              <div className="flex flex-col gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="secondary" size="sm" className="justify-start"><Users className="mr-2" /> Members</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <h4 className="text-sm font-semibold mb-2">Team Members</h4>
                        <div className="space-y-2">
                            {team.map(member => (
                                <div key={member.id} className="flex items-center gap-2">
                                    <Checkbox id={`member-${member.id}`} checked={card.members?.includes(member.id)} onCheckedChange={() => handleMemberToggle(member.id)} />
                                    <Avatar className="h-8 w-8"><AvatarImage src={member.avatarUrl} /><AvatarFallback>{member.name.charAt(0)}</AvatarFallback></Avatar>
                                    <Label htmlFor={`member-${member.id}`}>{member.name}</Label>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="secondary" size="sm" className="justify-start"><Tag className="mr-2" /> Labels</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <h4 className="text-sm font-semibold mb-2">Labels</h4>
                        <div className="space-y-2">
                            {availableLabels.map(label => (
                                <div key={label.id} className="flex items-center gap-2">
                                    <Checkbox id={`label-${label.id}`} checked={card.labels?.some(l => l.id === label.id)} onCheckedChange={() => handleLabelToggle(label.id)} />
                                    <div className="px-2 py-1 text-xs font-semibold text-white" style={{backgroundColor: label.color}}>{label.text}</div>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
                
                <Popover>
                    <PopoverTrigger asChild>
                       <Button variant="secondary" size="sm" className="justify-start"><CheckSquare className="mr-2" /> Checklist</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <h4 className="text-sm font-semibold mb-2">Add Checklist Item</h4>
                        <div className="flex gap-2">
                        <Input value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} placeholder="Add an item" />
                        <Button onClick={handleAddChecklistItem}>Add</Button>
                        </div>
                    </PopoverContent>
                </Popover>
                
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="secondary" size="sm" className="justify-start"><Clock className="mr-2" /> Dates</Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                       <Calendar
                        mode="single"
                        selected={card.dueDate ? parseISO(card.dueDate) : undefined}
                        onSelect={handleDueDateSelect}
                       />
                    </PopoverContent>
                </Popover>

                <Button variant="secondary" size="sm" className="justify-start"><Paperclip className="mr-2" /> Attachment</Button>
              </div>

            <Separator />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
