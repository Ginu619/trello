
'use client';

import { Calendar, dateFnsLocalizer, Views, EventProps, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent } from '@/lib/types';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  onSelectSlot: (slot: { start: Date; end: Date; }) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

const CustomToolbar = (toolbar: any) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };
  
  const viewNames: Record<string,string> = {
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={goToBack}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" onClick={goToCurrent}>Today</Button>
        <Button variant="outline" size="icon" onClick={goToNext}><ChevronRight className="h-4 w-4" /></Button>
         <h2 className="text-xl sm:text-2xl font-bold text-foreground ml-4">
            {toolbar.label}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {(toolbar.views as (keyof typeof viewNames)[]).map(view => (
          <Button
            key={view}
            variant={toolbar.view === view ? 'default' : 'outline'}
            onClick={() => toolbar.onView(view)}
            size="sm"
          >
            {viewNames[view]}
          </Button>
        ))}
      </div>
    </div>
  );
};

const CustomEvent = ({ event }: EventProps<CalendarEvent>) => {
  const content = (
      <div className={cn("p-1 h-full text-xs flex flex-col rounded-md",
        event.type === 'meeting' ? 'bg-primary/20 text-primary-foreground/80 border border-primary/50' : 'bg-green-600/20 text-green-100 border border-green-600/50',
      )}>
        <strong className="truncate font-semibold">{event.title}</strong>
        {event.start && event.end && !event.allDay && (
            <p className="text-xs">{`${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`}</p>
        )}
      </div>
  );

  if (event.type === 'task' && event.resource.boardId) {
    return <Link href={`/board/${event.resource.boardId}`} className="block h-full">{content}</Link>
  }

  return content;
}


export function FullCalendarView({ events, onSelectSlot, onSelectEvent }: FullCalendarViewProps) {
  const { defaultDate, views } = useMemo(() => ({
    defaultDate: new Date(),
    views: [Views.MONTH, Views.WEEK, Views.DAY],
  }), [])

  return (
    <div className="h-[calc(100vh-8rem)] bg-card p-4 rounded-lg border text-foreground">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ flex: 1 }}
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        defaultDate={defaultDate}
        views={views}
        defaultView={Views.WEEK}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent,
        }}
        eventPropGetter={(event) => ({
            className: cn(
                '!rounded-md !border-0 !p-0',
                event.type === 'meeting' ? 'rbc-event-meeting' : 'rbc-event-task',
            ),
        })}
      />
    </div>
  );
}
