
'use client';

import { Calendar, dateFnsLocalizer, Views, EventProps, View, ToolbarProps } from 'react-big-calendar';
// Drag & drop and resize addon
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - types are bundled with the library in recent versions
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
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
  onSelectSlot: (slot: { start: Date; end: Date }) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onEventMove?: (args: { event: CalendarEvent; start: Date; end: Date; isAllDay?: boolean }) => void;
  onEventResize?: (args: { event: CalendarEvent; start: Date; end: Date }) => void;
  onCreate?: (ctx: { date: Date; view: View }) => void;
  date?: Date;
  view?: View;
  onNavigate?: (newDate: Date, view: View, action: unknown) => void;
  onView?: (view: View) => void;
  onRangeChange?: (range: { start: Date; end: Date } | Date[], view: View) => void;
}

type ToolbarWithCreate = ToolbarProps & { onCreate?: (ctx: { date: Date; view: View }) => void };

const CustomToolbar = (toolbar: ToolbarWithCreate) => {
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
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {toolbar.label}
        </h2>
        <div className="flex items-center gap-1 ml-4">
            <Button variant="outline" size="icon" onClick={goToBack}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={goToCurrent}>Today</Button>
            <Button variant="outline" size="icon" onClick={goToNext}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-md bg-muted p-1">
          {(toolbar.views as (keyof typeof viewNames)[]).map(view => (
            <Button
              key={view}
              variant={toolbar.view === view ? 'default' : 'ghost'}
              onClick={() => toolbar.onView(view)}
              size="sm"
              className="h-8 px-3"
            >
              {viewNames[view]}
            </Button>
          ))}
        </div>
        <Button onClick={() => toolbar.onCreate?.({ date: toolbar.date, view: toolbar.view })} className="ml-2">Create</Button>
      </div>
    </div>
  );
};

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


export function FullCalendarView({ events, onSelectSlot, onSelectEvent, onEventMove, onEventResize, onCreate, date, view, onNavigate, onView, onRangeChange }: FullCalendarViewProps) {
  const { defaultDate, views } = useMemo(() => ({
    defaultDate: new Date(),
    views: [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA],
  }), [])

  const DnDCalendar = useMemo(() => withDragAndDrop(Calendar), []);

  return (
    <div className="h-[calc(100vh-10rem)] bg-card p-4 rounded-lg border text-foreground">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ flex: 1 }}
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        defaultDate={defaultDate}
        date={date}
        views={views}
        defaultView={Views.WEEK}
        view={view}
        components={{
          toolbar: (props: ToolbarProps) => (
            <CustomToolbar {...props} onCreate={onCreate} />
          ),
          event: CustomEvent,
        }}
        eventPropGetter={(event) => ({
            className: cn(
                '!rounded-md !border-0 !p-0',
            ),
        })}
        draggableAccessor={() => true}
        resizable
        onNavigate={onNavigate as any}
        onView={onView as any}
        onRangeChange={onRangeChange as any}
        onEventDrop={(args: unknown) => {
          const { event, start, end, isAllDay } = args as { event: CalendarEvent; start: Date; end: Date; isAllDay?: boolean };
          // Forward to parent
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - parent may omit handler
          onEventMove?.({ event, start, end, isAllDay });
        }}
        onEventResize={(args: unknown) => {
          const { event, start, end } = args as { event: CalendarEvent; start: Date; end: Date };
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - parent may omit handler
          onEventResize?.({ event, start, end });
        }}
      />
    </div>
  );
}
