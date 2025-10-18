
'use client';

import { useAuth } from '@/hooks/useAuth';
import { getMeetings, getTasksForUser } from '@/lib/data';
import { CalendarEvent } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { CalendarView } from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  const { user, loading: userLoading } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

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
            date: new Date(meeting.startDate),
            type: 'meeting',
            project: meeting.project,
          }));

        const taskEvents: CalendarEvent[] = tasks
          .filter(task => task.dueDate)
          .map(task => ({
            id: task.id,
            title: task.title,
            date: new Date(task.dueDate!),
            type: 'task',
            boardId: task.boardId,
          }));
        
        setEvents([...meetingEvents, ...taskEvents]);
        setLoading(false);
      });
    }
  }, [user, userLoading]);

  if (loading || userLoading) {
    return <LoadingSkeleton />;
  }

  const handleNextMonth = () => {
    setCurrentDate(current => addMonths(current, 1));
  };

  const handlePrevMonth = () => {
    setCurrentDate(current => subMonths(current, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h1>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <Button variant="outline" onClick={handleToday}>Today</Button>
        </div>
      </div>
      <div className="flex-grow">
        <CalendarView date={currentDate} events={events} />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-40" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                </div>
                 <Skeleton className="h-9 w-20" />
            </div>
            <Skeleton className="h-[70vh] w-full" />
        </div>
    )
}
