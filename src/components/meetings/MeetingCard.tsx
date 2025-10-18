
'use client';
import { Meeting, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Clock, Copy, Projector, Video } from 'lucide-react';
import { MeetingStatusBadge } from './MeetingStatusBadge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MeetingCardProps {
    meeting: Meeting;
    team: User[];
    variant?: 'default' | 'past';
}

export function MeetingCard({ meeting, team, variant = 'default' }: MeetingCardProps) {
    const { toast } = useToast();

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const handleCopyLink = () => {
        navigator.clipboard.writeText(meeting.meetingLink);
        toast({ title: 'Meeting link copied!' });
    }

    if (variant === 'past') {
        return (
            <Card className="flex items-center justify-between p-4 bg-card/60">
                 <div className="flex items-center gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                        <Video className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold">{meeting.title}</p>
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
                    <Button variant="secondary" size="sm">View Recording</Button>
                </div>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col bg-card/80">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                    <MeetingStatusBadge status={meeting.status} />
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
                        {meeting.participants.map(pId => {
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
                <Button asChild className="flex-1" disabled={meeting.status !== 'ongoing'}>
                    <Link href={meeting.meetingLink} target="_blank">
                        <Video className="mr-2 h-4 w-4"/> Join
                    </Link>
                </Button>
                <Button variant="secondary" size="icon" onClick={handleCopyLink}><Copy className="h-4 w-4"/></Button>
            </CardFooter>
        </Card>
    )
}
