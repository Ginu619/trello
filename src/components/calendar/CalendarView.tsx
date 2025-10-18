
'use client';

import { CalendarEvent } from "@/lib/types";
import { generateWeeks } from "@/lib/calendar-utils";
import { useMemo } from "react";
import { isSameDay, isSameMonth, format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ClipboardList, Video } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";

interface CalendarViewProps {
  date: Date;
  events: CalendarEvent[];
}

export function CalendarView({ date, events }: CalendarViewProps) {
  const weeks = useMemo(() => generateWeeks(date), [date]);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      const dayKey = format(event.date, "yyyy-MM-dd");
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(event);
      return acc;
    }, {});
  }, [events]);

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg calendar-grid">
      <div className="grid grid-cols-7 border-b">
        {daysOfWeek.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-5 flex-grow">
        {weeks.flat().map((day, index) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dayKey] || [];
          const isCurrentMonth = isSameMonth(day, date);

          return (
            <div
              key={index}
              className={cn(
                "border-r border-b p-2 flex flex-col calendar-day-cell",
                (index + 1) % 7 === 0 && "border-r-0",
                index >= weeks.flat().length - 7 && "border-b-0",
              )}
            >
              <time
                dateTime={format(day, "yyyy-MM-dd")}
                className={cn(
                  "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </time>
              <div className="mt-1 flex-grow overflow-y-auto space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <EventItem key={event.id} event={event} />
                ))}
                {dayEvents.length > 2 && (
                   <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-xs text-muted-foreground hover:underline w-full text-left">
                        +{dayEvents.length - 2} more
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Events for {format(day, 'MMM d')}</h4>
                        {dayEvents.map(event => (
                            <EventItem key={event.id} event={event} />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventItem({ event }: { event: CalendarEvent }) {
    const content = (
        <div className={cn("p-1.5 rounded-md text-xs flex items-center gap-1.5 truncate", 
            event.type === 'meeting' ? 'bg-blue-600/30 text-blue-200' : 'bg-green-600/30 text-green-200'
        )}>
            {event.type === 'meeting' ? <Video className="h-3 w-3 flex-shrink-0" /> : <ClipboardList className="h-3 w-3 flex-shrink-0" />}
            <span className="truncate">{event.title}</span>
        </div>
    );
    
    if (event.type === 'task' && event.boardId) {
        return <Link href={`/board/${event.boardId}`} className="block">{content}</Link>
    }

    if (event.type === 'meeting') {
         return <Link href="/meetings" className="block">{content}</Link>
    }

    return content;
}
