
'use client';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { deleteMeeting, getMeetings, getTeamMembers } from "@/lib/data";
import { Meeting, User } from "@/lib/types";
import { Loader2, Plus, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { ScheduleMeetingDialog } from "@/components/meetings/ScheduleMeetingDialog";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function MeetingsPage() {
    const { user, loading: userLoading } = useAuth();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [team, setTeam] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
        if (!userLoading && user) {
            Promise.all([getMeetings(), getTeamMembers()]).then(([userMeetings, teamMembers]) => {
                setMeetings(userMeetings);
                setTeam(teamMembers);
                setLoading(false);
            });
        }
    }, [user, userLoading]);

    const handleMeetingCreated = (newMeeting: Meeting) => {
        setMeetings(prev => [newMeeting, ...prev].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
    }

    const handleMeetingUpdated = (updatedMeeting: Meeting) => {
        setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
    }

    const handleMeetingDeleted = async (meetingId: string) => {
        const originalMeetings = [...meetings];
        setMeetings(prev => prev.filter(m => m.id !== meetingId));
        try {
            await deleteMeeting(meetingId);
            toast({ title: 'Meeting deleted successfully.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to delete meeting.' });
            setMeetings(originalMeetings);
        }
    }

    const heroImage = PlaceHolderImages.find(p => p.id === 'meetings-hero');

    const ongoingMeetings = meetings.filter(m => m.status === 'ongoing');
    const upcomingMeetings = meetings.filter(m => m.status === 'upcoming');
    const pastMeetings = meetings.filter(m => m.status === 'past');
    
    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="space-y-8">
             <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Meetings</h1>
                    <p className="text-muted-foreground">
                        Schedule, join, and manage your team meetings.
                    </p>
                </div>
                <ScheduleMeetingDialog onMeetingScheduled={handleMeetingCreated}>
                    <Button>
                        <Plus className="mr-2" />
                        Schedule Meeting
                    </Button>
                </ScheduleMeetingDialog>
             </div>
            
            {meetings.length === 0 ? (
                <div className="text-center py-16 col-span-full border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center">
                    {heroImage && 
                        <div className="relative w-64 h-48 mb-4">
                           <Image src={heroImage.imageUrl} alt="No meetings" layout="fill" objectFit="contain" data-ai-hint={heroImage.imageHint} />
                        </div>
                    }
                    <h2 className="text-xl font-semibold text-muted-foreground">No meetings scheduled yet</h2>
                    <p className="mt-2 text-muted-foreground">Get started by scheduling your first team meeting.</p>
                     <ScheduleMeetingDialog onMeetingScheduled={handleMeetingCreated}>
                        <Button className="mt-4">
                            <Plus className="mr-2" />
                            Schedule Meeting
                        </Button>
                    </ScheduleMeetingDialog>
                </div>
            ) : (
                <div className="space-y-12">
                {ongoingMeetings.length > 0 && (
                    <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Ongoing
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {ongoingMeetings.map(meeting => (
                            <MeetingCard 
                                key={meeting.id} 
                                meeting={meeting} 
                                team={team} 
                                onMeetingUpdate={handleMeetingUpdated}
                                onMeetingDelete={handleMeetingDeleted}
                            />
                        ))}
                    </div>
                    </section>
                )}

                {upcomingMeetings.length > 0 && (
                     <section>
                        <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingMeetings.map(meeting => (
                                <MeetingCard 
                                    key={meeting.id} 
                                    meeting={meeting} 
                                    team={team} 
                                    onMeetingUpdate={handleMeetingUpdated}
                                    onMeetingDelete={handleMeetingDeleted}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {pastMeetings.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Past Meetings</h2>
                        <div className="space-y-2">
                            {pastMeetings.map(meeting => (
                                <MeetingCard 
                                    key={meeting.id} 
                                    meeting={meeting} 
                                    team={team} 
                                    variant="past" 
                                    onMeetingUpdate={handleMeetingUpdated}
                                    onMeetingDelete={handleMeetingDeleted}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
            )}
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                 <div>
                    <Skeleton className="h-9 w-40 mb-2" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            <div className="space-y-12">
                <section>
                    <Skeleton className="h-7 w-32 mb-4" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-48 rounded-lg" />
                    </div>
                </section>
                 <section>
                    <Skeleton className="h-7 w-48 mb-4" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(2)].map((_, i) => (
                           <Skeleton key={i} className="h-48 rounded-lg" />
                        ))}
                    </div>
                </section>
                <section>
                    <Skeleton className="h-7 w-36 mb-4" />
                    <div className="grid gap-4 md:grid-cols-2">
                         {[...Array(3)].map((_, i) => (
                           <Skeleton key={i} className="h-20 rounded-lg" />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
