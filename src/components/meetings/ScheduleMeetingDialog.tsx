
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ReactNode, useState, useEffect } from "react";
import { createMeeting, getBoards, getTeamMembers } from "@/lib/data";
import { Board, Meeting, User } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "../ui/checkbox";

interface ScheduleMeetingDialogProps {
    children: ReactNode;
    onMeetingCreated: (newMeeting: Meeting) => void;
}

export function ScheduleMeetingDialog({ children, onMeetingCreated }: ScheduleMeetingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [participants, setParticipants] = useState<string[]>([]);
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/");
  const [project, setProject] = useState<string | undefined>();

  const [team, setTeam] = useState<User[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      getTeamMembers().then(setTeam);
      getBoards().then(setBoards);
    }
  }, [isOpen]);

  const handleParticipantToggle = (participantId: string) => {
    setParticipants(prev => 
        prev.includes(participantId)
            ? prev.filter(id => id !== participantId)
            : [...prev, participantId]
    );
  };
  
  const handleScheduleMeeting = async () => {
    if (!title || !date) {
        toast({ variant: 'destructive', title: 'Missing required fields', description: 'Please provide a title and date.'});
        return;
    }
    setIsSaving(true);

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const startDate = new Date(date);
    startDate.setHours(startHours, startMinutes);

    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endDate = new Date(date);
    endDate.setHours(endHours, endMinutes);

    try {
        const newMeeting = await createMeeting({
            title,
            description,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            participants,
            meetingLink,
            project
        });
        toast({ title: 'Meeting Scheduled!', description: `${title} has been added to your calendar.`});
        onMeetingCreated(newMeeting);
        setIsOpen(false);
        // Reset form
        setTitle("");
        setDescription("");
        setDate(undefined);
        setParticipants([]);

    } catch (error) {
        toast({ variant: 'destructive', title: 'Something went wrong', description: 'Could not schedule the meeting.'})
    } finally {
        setIsSaving(false);
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule a New Meeting</DialogTitle>
          <DialogDescription>
            Organize your next team sync, planning session, or call.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly Sync" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Agenda / Description</Label>
                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What will be discussed?" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="meetingLink">Meeting Link</Label>
                    <Input id="meetingLink" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="project">Attach Project (Optional)</Label>
                    <Select value={project} onValueChange={setProject}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                            {boards.map(board => (
                                <SelectItem key={board.id} value={board.title}>{board.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Date</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Participants</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <Users className="mr-2 h-4 w-4" />
                                {participants.length > 0 ? `${participants.length} selected` : 'Select participants'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4 max-h-60 overflow-y-auto">
                            <h4 className="font-medium text-sm mb-2">Invite Team Members</h4>
                            <div className="space-y-2">
                                {team.map(member => (
                                    <div key={member.id} className="flex items-center gap-2">
                                        <Checkbox 
                                            id={`participant-${member.id}`} 
                                            checked={participants.includes(member.id)}
                                            onCheckedChange={() => handleParticipantToggle(member.id)}
                                        />
                                        <Label htmlFor={`participant-${member.id}`} className="font-normal flex-grow">{member.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                     </Popover>
                </div>
             </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleScheduleMeeting} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 animate-spin" />}
            Schedule Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
