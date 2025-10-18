
'use client';
import { AgendaItem, Meeting, User } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useEffect, useState } from 'react';
import { updateMeeting } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format, isToday } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Calendar, CheckSquare, Clock, Copy, List, Loader2, Plus, Projector, Trash2, Users, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { MeetingStatusBadge } from './MeetingStatusBadge';


interface MeetingDetailsDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    meeting: Meeting;
    team: User[];
    onMeetingUpdate: (updatedMeeting: Meeting) => void;
}

export function MeetingDetailsDialog({ isOpen, onOpenChange, meeting: initialMeeting, team, onMeetingUpdate }: MeetingDetailsDialogProps) {
    const [meeting, setMeeting] = useState(initialMeeting);
    const [newAgendaItem, setNewAgendaItem] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setMeeting(initialMeeting);
        }
    }, [isOpen, initialMeeting]);

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const handleAgendaItemToggle = async (itemId: string) => {
        const updatedAgenda = meeting.agendaItems?.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        const updatedMeeting = await updateMeeting(meeting.id, { agendaItems: updatedAgenda });
        setMeeting(updatedMeeting);
        onMeetingUpdate(updatedMeeting);
    };

    const handleAddAgendaItem = async () => {
        if (!newAgendaItem.trim()) return;
        const newItem: AgendaItem = {
            id: `agenda-${Date.now()}`,
            text: newAgendaItem,
            completed: false,
        };
        const updatedAgenda = [...(meeting.agendaItems || []), newItem];
        const updatedMeeting = await updateMeeting(meeting.id, { agendaItems: updatedAgenda });
        setMeeting(updatedMeeting);
        onMeetingUpdate(updatedMeeting);
        setNewAgendaItem('');
    };

    const handleAgendaItemDelete = async (itemId: string) => {
        const updatedAgenda = meeting.agendaItems?.filter(item => item.id !== itemId);
        const updatedMeeting = await updateMeeting(meeting.id, { agendaItems: updatedAgenda });
        setMeeting(updatedMeeting);
        onMeetingUpdate(updatedMeeting);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(meeting.meetingLink);
        toast({ title: 'Meeting link copied!' });
    };

    const agendaProgress = (meeting.agendaItems?.length ?? 0) > 0 ? ((meeting.agendaItems?.filter(i => i.completed).length ?? 0) / meeting.agendaItems!.length) * 100 : 0;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                     <div className="flex justify-between items-start">
                        <DialogTitle className="text-2xl font-bold">{meeting.title}</DialogTitle>
                        <MeetingStatusBadge status={meeting.status} />
                    </div>
                    <DialogDescription className="flex items-center gap-4 text-sm pt-2">
                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4"/> {isToday(new Date(meeting.startDate)) ? 'Today' : format(new Date(meeting.startDate), 'E, MMM d, yyyy')}</span>
                        <span className="flex items-center gap-2"><Clock className="h-4 w-4"/> {format(new Date(meeting.startDate), 'h:mm a')} - {format(new Date(meeting.endDate), 'h:mm a')}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-y-auto">
                    {/* Main content */}
                    <div className="md:col-span-2 space-y-6">
                        {meeting.description && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><List className="h-5 w-5"/> Description</h3>
                                <p className="text-muted-foreground text-sm">{meeting.description}</p>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold flex items-center gap-2"><CheckSquare className="h-5 w-5"/> Agenda</h3>
                            </div>
                            { (meeting.agendaItems?.length ?? 0) > 0 && 
                                <div className="space-y-2">
                                    <Progress value={agendaProgress} className="h-2" />
                                    {meeting.agendaItems?.map(item => (
                                        <div key={item.id} className="flex items-center gap-2 group">
                                            <Checkbox id={`agenda-${item.id}`} checked={item.completed} onCheckedChange={() => handleAgendaItemToggle(item.id)} />
                                            <label htmlFor={`agenda-${item.id}`} className={cn("flex-grow text-sm", item.completed && "line-through text-muted-foreground")}>{item.text}</label>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleAgendaItemDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                            }
                            <div className="flex gap-2 mt-2">
                                <Input 
                                    value={newAgendaItem}
                                    onChange={(e) => setNewAgendaItem(e.target.value)}
                                    placeholder="Add agenda item"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddAgendaItem()}
                                />
                                <Button onClick={handleAddAgendaItem} size="sm"><Plus className="mr-1 h-4 w-4" /> Add</Button>
                            </div>
                        </div>

                    </div>
                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold">Join Meeting</h3>
                            <Button asChild className="w-full" disabled={meeting.status !== 'ongoing'}>
                                <Link href={meeting.meetingLink} target="_blank">
                                    <Video className="mr-2 h-4 w-4"/> Join
                                </Link>
                            </Button>
                             <Button variant="outline" className="w-full" onClick={handleCopyLink}><Copy className="mr-2 h-4 w-4"/> Copy Link</Button>
                        </div>
                        
                        {meeting.project && (
                            <div>
                                <h3 className="text-base font-semibold mb-2">Project</h3>
                                <div className="text-sm text-muted-foreground flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                    <Projector className="h-4 w-4 flex-shrink-0"/>
                                    <span className="font-medium text-foreground truncate">{meeting.project}</span>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-base font-semibold mb-2">Participants ({meeting.participants.length})</h3>
                            <div className="space-y-2">
                                {meeting.participants.map(pId => {
                                    const participant = team.find(t => t.id === pId);
                                    if (!participant) return null;
                                    return (
                                        <div key={pId} className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                                                <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{participant.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
