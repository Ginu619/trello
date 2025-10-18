
'use client';

import { useAuth } from '@/hooks/useAuth';
import { getMeetings, getTasksForUser } from '@/lib/data';
import { CalendarEvent, Meeting } from '@/lib/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FullCalendarView } from '@/components/calendar/FullCalendarView';
import { ScheduleMeetingDialog } from '@/components/meetings/ScheduleMeetingDialog';
import { updateMeeting, createMeeting } from '@/lib/data';
import { CalendarSidebar, type CalendarFilters } from '@/components/calendar/CalendarSidebar';
import { getRangeFromOnRangeChangeParam, expandMeetingsToEvents } from '@/lib/calendar-utils';
import { addHours, isWithinInterval } from 'date-fns';

export default function CalendarPage() {
  const { user, loading: userLoading } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'agenda'>('week');
  const [visibleRange, setVisibleRange] = useState<{ start: Date; end: Date } | null>(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<CalendarFilters>({ showMeetings: true, showTasks: true });

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

    const meetingEvents: CalendarEvent[] = visibleRange
      ? expandMeetingsToEvents(meetings, visibleRange.start, visibleRange.end)
      : meetings.map(meeting => ({
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
  }, [user, visibleRange]);

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

  const handleCreateFromToolbar = useCallback(({ date, view }: { date: Date; view: string }) => {
    // Default 1 hour slot
    setDialogState({ startDate: date, endDate: addHours(date, 1) });
    setDialogOpen(true);
  }, []);

  const handleEventMove = useCallback(async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    // Only persist meetings for now
    if (event.type === 'meeting') {
      await updateMeeting((event.resource as Meeting).id, {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      fetchEvents();
    }
  }, [fetchEvents]);

  const handleEventResize = handleEventMove;

  const onRangeChange = useCallback((range: { start: Date; end: Date } | Date[], view: any) => {
    const { start, end } = getRangeFromOnRangeChangeParam(range);
    setVisibleRange({ start, end });
  }, []);

  const onNavigate = useCallback((newDate: Date) => {
    setCalendarDate(newDate);
  }, []);

  const onView = useCallback((view: any) => {
    setCalendarView(view);
  }, []);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter(evt => {
      if (evt.type === 'meeting' && !filters.showMeetings) return false;
      if (evt.type === 'task' && !filters.showTasks) return false;
      if (term && !evt.title.toLowerCase().includes(term)) return false;
      if (visibleRange) {
        return isWithinInterval(evt.start, visibleRange) || isWithinInterval(evt.end, visibleRange);
      }
      return true;
    });
  }, [events, filters, search, visibleRange]);

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
    }
    fetchEvents(); // Refetch events to show the new/updated one
    setDialogState({}); // Clear dialog state
  };


  if (loading || userLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 h-full">
        <CalendarSidebar
          date={calendarDate}
          onDateChange={setCalendarDate}
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={setFilters}
          onCreate={({ date }) => handleCreateFromToolbar({ date, view: calendarView })}
        />
        <div className="flex-1 min-w-0">
          <FullCalendarView
            events={filteredEvents}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onCreate={({ date }) => handleCreateFromToolbar({ date, view: calendarView })}
            onEventMove={handleEventMove}
            onEventResize={handleEventResize}
            date={calendarDate}
            view={calendarView as any}
            onNavigate={onNavigate}
            onView={onView}
            onRangeChange={onRangeChange}
          />
        </div>
      </div>
      <ScheduleMeetingDialog
        isOpen={dialogOpen}
        onOpenChange={(isOpen) => {
            setDialogOpen(isOpen);
            if (!isOpen) {
                setDialogState({});
            }
        }}
        onMeetingScheduled={handleMeetingScheduled}
        onMeetingDeleted={fetchEvents}
        meetingToEdit={dialogState.meeting}
        defaultStartDate={dialogState.startDate}
        defaultEndDate={dialogState.endDate}
       >
         <div />
       </ScheduleMeetingDialog>
    </>
  );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4 p-4 md:p-6">
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
