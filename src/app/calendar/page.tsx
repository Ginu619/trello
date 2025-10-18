
'use client';

import { useAuth } from '@/hooks/useAuth';
import { getMeetings, getTasksForUser } from '@/lib/data';
import { CalendarEvent, Meeting, Card as TaskCard } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { isSameDay, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Video } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const { user, loading: userLoading } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!userLoading && user) {
      setLoading(true);
      Promise.all([
        getMeetings(),
        getTasksForUser(user.id),
      ]).then(([meetings, tasks]) => {
        const meetingEvents: CalendarEvent[] = meetings
          .filter(m => m.participants.includes(user.id))
          .map(meeting => ({
            id: meeting.id,
            title: meeting.title,
            date: parseISO(meeting.startDate),
            type: 'meeting',
            project: meeting.project,
          }));

        const taskEvents: CalendarEvent[] = tasks
          .filter(task => task.dueDate)
          .map(task => ({
            id: task.id,
            title: task.title,
            date: parseISO(task.dueDate!),
            type: 'task',
            boardId: task.boardId,
          }));
        
        setEvents([...meetingEvents, ...taskEvents]);
        setLoading(false);
      });
    }
  }, [user, userLoading]);

  const eventDates = useMemo(() => events.map(event => event.date), [events]);

  const eventsForSelectedDay = useMemo(() => {
    return events
      .filter(event => isSameDay(event.date, selectedDate))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, selectedDate]);

  if (loading || userLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          Your schedule at a glance.
        </p>
      </div>
      <Card>
        <CardContent className="p-2 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => setSelectedDate(day || new Date())}
                className="p-0"
                modifiers={{
                  hasEvent: eventDates,
                }}
                modifiersClassNames={{
                  hasEvent: 'has-event',
                }}
                components={{
                  Day: ({ date, ...props }) => {
                    const dayEvents = events.filter(event => isSameDay(event.date, date));
                    const isSelected = props.selected;

                    return (
                        <div
                            className={cn(
                                "relative flex items-center justify-center h-9 w-9",
                                props.modifiers?.today && "bg-accent rounded-md"
                            )}
                        >
                            <time dateTime={date.toISOString()}>{date.getDate()}</time>
                            {dayEvents.length > 0 && (
                                <div className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full",
                                isSelected ? "bg-primary-foreground" : "bg-primary"
                                )}></div>
                            )}
                        </div>
                    );
                  },
                }}
              />
          </div>
          <div className="lg:col-span-1 lg:border-l lg:pl-6">
                <h2 className="text-lg font-semibold mb-4">
                    Events for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                {eventsForSelectedDay.length > 0 ? (
                    <div className="space-y-3">
                        {eventsForSelectedDay.map(event => (
                            <div key={event.id} className="p-3 rounded-md bg-muted/50 flex items-start gap-3">
                                <div className={cn("mt-1", event.type === 'meeting' ? 'text-blue-400' : 'text-green-400')}>
                                    {event.type === 'meeting' ? <Video className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{event.title}</p>
                                    <p className="text-xs text-muted-foreground">{event.type === 'meeting' ? 'Meeting' : 'Task Due'}</p>
                                    {event.project && <p className="text-xs text-muted-foreground">Project: {event.project}</p>}
                                    {event.type === 'task' && event.boardId && (
                                        <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
                                           <Link href={`/board/${event.boardId}`}>View Task</Link>
                                        </Button>
                                    )}
                                     {event.type === 'meeting' && (
                                        <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
                                           <Link href="/meetings">View Meeting</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No events for this day.</p>
                )}
            </div>
        </CardContent>
      </Card>
        <style jsx global>{`
            .rdp-day_selected {
                font-weight: 600;
                background-color: hsl(var(--primary)) !important;
                color: hsl(var(--primary-foreground)) !important;
            }
             .rdp-day_selected:hover {
                background-color: hsl(var(--primary)) !important;
            }
            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                 background-color: hsl(var(--accent));
            }
        `}</style>
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-9 w-32 mb-2" />
                <Skeleton className="h-5 w-64" />
            </div>
            <Card>
                <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-[330px] w-full" />
                    </div>
                     <div className="lg:col-span-1 lg:border-l lg:pl-6">
                        <Skeleton className="h-7 w-48 mb-4" />
                        <div className="space-y-3">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
