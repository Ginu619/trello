
'use client';

import { useAuth } from '@/hooks/useAuth';
import { getMeetings, getTasksForUser, createMeeting, updateMeeting } from '@/lib/data';
import { CalendarEvent, Meeting } from '@/lib/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FullCalendarView, CalendarViewType } from '@/components/calendar/FullCalendarView';
import { ScheduleMeetingDialog } from '@/components/meetings/ScheduleMeetingDialog';

export default function CalendarPage() {
  const { user, loading: userLoading } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // State for the new meeting dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogState, setDialogState] = useState<{ meeting?: Meeting, startDate?: Date, endDate?: Date }>({});

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [meetings, tasks] = await Promise.all([
      getMeetings(),
      getTasksForUser(user.id),
    ]);

    const meetingEvents: CalendarEvent[] = meetings
      .map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        start: new Date(meeting.startDate),
        end: new Date(meeting.endDate),
        type: 'meeting',
        resource: meeting,
      }));

    const taskEvents: CalendarEvent[] = tasks
      .filter(task => task.dueDate)
      .map(task => {
        const dueDate = new Date(task.dueDate!);
        return {
          id: task.id,
          title: task.title,
          start: dueDate,
          end: dueDate,
          allDay: true,
          type: 'task',
          resource: task,
        }
      });
    
    setEvents([...meetingEvents, ...taskEvents]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchEvents();
    }
  }, [user, userLoading, fetchEvents]);
  
  const handleSelectSlot = useCallback(({ start, end }: { start: Date, end: Date }) => {
    setDialogState({ startDate: start, endDate: end });
    setDialogOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.type === 'meeting') {
      setDialogState({ meeting: event.resource as Meeting });
      setDialogOpen(true);
    }
    // Clicking on tasks can be handled here if needed
  }, []);

  const handleMeetingScheduled = async (meetingData: Partial<Meeting>) => {
    setDialogOpen(false);
    if (dialogState.meeting) { // Editing existing meeting
      await updateMeeting(dialogState.meeting.id, meetingData);
    } else { // Creating new meeting
      const newMeetingData = {
        title: meetingData.title!,
        description: meetingData.description || '',
        startDate: meetingData.startDate!,
        endDate: meetingData.endDate!,
        participants: meetingData.participants || [],
        meetingLink: meetingData.meetingLink || '',
        project: meetingData.project,
        recurrence: meetingData.recurrence || 'none',
      }
      // @ts-ignore
      await createMeeting(newMeetingData);
_    }
    fetchEvents(); // Refetch events to show the new/updated one
  };


  if (loading || userLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <FullCalendarView
            events={events}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
        />
      </div>
      <ScheduleMeetingDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onMeetingScheduled={handleMeetingScheduled}
        meetingToEdit={dialogState.meeting}
        defaultStartDate={dialogState.startDate}
        defaultEndDate={dialogState.endDate}
       >
         <></>
       </ScheduleMeetingDialog>
    </>
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
