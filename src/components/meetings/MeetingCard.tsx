
'use client';
import { Meeting, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { format, isToday } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Clock, Copy, Edit, MoreHorizontal, Projector, Trash2, Video } from 'lucide-react';
import { MeetingStatusBadge } from './MeetingStatusBadge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useState } from 'react';
import { ScheduleMeetingDialog } from './ScheduleMeetingDialog';
import { MeetingDetailsDialog } from './MeetingDetailsDialog';
import { cn } from '@/lib/utils';

interface MeetingCardProps {
    meeting: Meeting;
    team: User[];
    variant?: 'default' | 'past';
    onMeetingUpdate: (updatedMeeting: Meeting) => void;
    onMeetingDelete: (meetingId: string) => void;
}

export function MeetingCard({ meeting, team, variant = 'default', onMeetingUpdate, onMeetingDelete }: MeetingCardProps) {
    const { toast } = useToast();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(meeting.meetingLink);
        toast({ title: 'Meeting link copied!' });
    }
    
    const handleMeetingScheduled = (updatedMeeting: Meeting) => {
        onMeetingUpdate(updatedMeeting);
    }
    
    const openDetails = () => setIsDetailsDialogOpen(true);
    
    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const actionButton = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMenuClick}><MoreHorizontal className="h-4 w-4"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={handleMenuClick}>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4"/> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4"/> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    if (variant === 'past') {
        return (
             <>
                <Card className="flex items-center justify-between p-4 bg-card/60 hover:bg-card/80 transition-colors cursor-pointer" onClick={openDetails}>
                    <div className="flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-lg">
                            <Video className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold truncate">{meeting.title}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(meeting.startDate), 'MMM d, yyyy')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {meeting.participants.map(pId => {
                                const participant = team.find(t => t.id === pId);
                                if (!participant) return null;
                                return (
                                    <Avatar key={pId} className="h-8 w-8 border-2 border-background">
                                        <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                                        <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                                    </Avatar>
                                )
                            })}
                        </div>
                        <Button variant="secondary" size="sm" onClick={(e) => e.stopPropagation()}>View Recording</Button>
                        {actionButton}
                    </div>
                </Card>
                <MeetingDetailsDialog 
                    isOpen={isDetailsDialogOpen}
                    onOpenChange={setIsDetailsDialogOpen}
                    meeting={meeting}
                    team={team}
                    onMeetingUpdate={onMeetingUpdate}
                />
                 <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the meeting "{meeting.title}".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onMeetingDelete(meeting.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        )
    }

    return (
        <>
            <Card className="flex flex-col bg-card/80 hover:bg-card/90 transition-colors cursor-pointer" onClick={openDetails}>
                <CardHeader>
                    <div>
                        <CardTitle className="text-lg mb-2">{meeting.title}</CardTitle>
                        <div className="flex justify-between items-center">
                            <MeetingStatusBadge status={meeting.status} />
                           {actionButton}
                        </div>
                    </div>
                    <CardDescription className="flex items-center gap-2 pt-2 text-sm">
                        <Clock className="h-4 w-4"/>
                        {isToday(new Date(meeting.startDate)) ? 'Today' : format(new Date(meeting.startDate), 'E, MMM d')} at {format(new Date(meeting.startDate), 'h:mm a')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{meeting.description}</p>
                    {meeting.project && (
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Projector className="h-4 w-4"/>
                            <span>Project: <span className="font-medium text-foreground">{meeting.project}</span></span>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Participants</p>
                        <div className="flex -space-x-2">
                            {meeting.participants.slice(0, 5).map(pId => {
                                const participant = team.find(t => t.id === pId);
                                if (!participant) return null;
                                return (
                                    <Avatar key={pId} className="h-8 w-8 border-2 border-card">
                                        <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                                        <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                                    </Avatar>
                                )
                            })}
                            {meeting.participants.length > 5 && (
                            <Avatar className="h-8 w-8 border-2 border-card">
                                <AvatarFallback>+{meeting.participants.length - 5}</AvatarFallback>
                            </Avatar>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button asChild className="flex-1" disabled={meeting.status !== 'ongoing'} onClick={(e) => e.stopPropagation()}>
                        <Link href={meeting.meetingLink} target="_blank">
                            <Video className="mr-2 h-4 w-4"/> Join
                        </Link>
                    </Button>
                    <Button variant="secondary" size="icon" onClick={handleCopyLink}><Copy className="h-4 w-4"/></Button>
                </CardFooter>
            </Card>
            
            <MeetingDetailsDialog 
                isOpen={isDetailsDialogOpen}
                onOpenChange={setIsDetailsDialogOpen}
                meeting={meeting}
                team={team}
                onMeetingUpdate={onMeetingUpdate}
            />

            <ScheduleMeetingDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onMeetingScheduled={handleMeetingScheduled}
                meetingToEdit={meeting}
            >
                <></>
            </ScheduleMeetingDialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the meeting "{meeting.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleMenuClick}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onMeetingDelete(meeting.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
