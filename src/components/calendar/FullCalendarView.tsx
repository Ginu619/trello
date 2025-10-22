
'use client';

import { Calendar as BaseCalendar, dateFnsLocalizer, Views, EventProps, View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { CalendarEvent } from '@/lib/types';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export type CalendarViewType = View;

interface FullCalendarViewProps {
  events: CalendarEvent[];
  onSelectSlot: (slot: { start: Date; end: Date }) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  // Drag & drop and resizing
  onEventDrop?: (args: { event: CalendarEvent; start: Date; end: Date; allDay?: boolean }) => void;
  onEventResize?: (args: { event: CalendarEvent; start: Date; end: Date }) => void;
  // Controlled navigation/view
  date?: Date;
  view?: CalendarViewType;
  onNavigate?: (newDate: Date) => void;
  onView?: (view: CalendarViewType) => void;
  onRangeChange?: (range: Date[] | { start: Date; end: Date }) => void;
}

// We intentionally do not render a toolbar inside the calendar. The page
// provides its own header and controls.

const CustomEvent = ({ event }: EventProps<CalendarEvent>) => {
  const content = (
      <div className={cn("p-1 h-full text-xs flex rounded-md overflow-hidden",
        event.type === 'meeting' ? 'rbc-event-meeting' : 'rbc-event-task',
      )}>
        <div className="flex flex-col w-full">
            <strong className="truncate font-semibold">{event.title}</strong>
            {event.start && event.end && !event.allDay && (
                <p className="text-xs truncate">{`${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`}</p>
            )}
        </div>
      </div>
  );

  if (event.type === 'task' && event.resource.boardId) {
    return <Link href={`/board/${event.resource.boardId}`} className="block h-full">{content}</Link>
  }

  return content;
}


export function FullCalendarView({
  events,
  onSelectSlot,
  onSelectEvent,
  onEventDrop,
  onEventResize,
  date,
  view,
  onNavigate,
  onView,
  onRangeChange,
}: FullCalendarViewProps) {
  const { defaultDate, views } = useMemo(() => ({
    defaultDate: new Date(),
    views: [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA],
  }), [])

  const DnDCalendar = useMemo(() => withDragAndDrop(BaseCalendar as any), []);

  return (
    <div className="min-h-[480px] h-[70vh] md:h-[calc(100vh-12rem)] lg:h-[calc(100vh-10rem)] bg-card p-3 md:p-4 rounded-lg border text-foreground">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ flex: 1 }}
        selectable
        resizable
        popup
        longPressThreshold={250}
        onSelectSlot={onSelectSlot as any}
        onSelectEvent={onSelectEvent as any}
        defaultDate={defaultDate}
        views={views}
        defaultView={Views.WEEK}
        components={{
          event: CustomEvent,
        }}
        eventPropGetter={(event) => ({
          className: cn('!rounded-md !border-0 !p-0'),
        })}
        // Controlled navigation/view (if provided)
        date={date}
        view={view}
        onNavigate={onNavigate as any}
        onView={onView as any}
        onRangeChange={onRangeChange as any}
        onEventDrop={onEventDrop as any}
        onEventResize={onEventResize as any}
      />
    </div>
  );
}
