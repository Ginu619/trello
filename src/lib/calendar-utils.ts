
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, eachDayOfInterval, isBefore, isAfter, addWeeks, addMonths } from 'date-fns';
import type { Meeting, CalendarEvent } from './types';

export function generateWeeks(monthDate: Date): Date[][] {
  const startMonth = startOfMonth(monthDate);
  const endMonth = endOfMonth(monthDate);
  const startDate = startOfWeek(startMonth);
  const endDate = endOfWeek(endMonth);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weeks: Date[][] = [];

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  // Ensure we always have 5 weeks for a consistent grid height
  while (weeks.length < 5) {
      const lastDayOfLastWeek = weeks[weeks.length-1][6];
      const nextWeek = eachDayOfInterval({ start: addDays(lastDayOfLastWeek, 1), end: addDays(lastDayOfLastWeek, 7)});
      weeks.push(nextWeek);
  }
    
  // If a month has 6 weeks (like some Octobers), we need to show all 6
  if (weeks.length > 5 && isSameMonth(weeks[5][0], monthDate)) {
      // it's a 6 week month
  } else if (weeks.length > 5) {
      return weeks.slice(0, 5);
  }


  return weeks;
}

function isSameMonth(date1: Date, date2: Date) {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}

export function getRangeFromOnRangeChangeParam(
  range: { start: Date; end: Date } | Date[]
): { start: Date; end: Date } {
  if (Array.isArray(range)) {
    const start = range[0];
    const end = range[range.length - 1];
    return { start, end };
  }
  return range;
}

export function expandMeetingsToEvents(
  meetings: Meeting[],
  visibleStart: Date,
  visibleEnd: Date
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const meeting of meetings) {
    const baseStart = new Date(meeting.startDate);
    const baseEnd = new Date(meeting.endDate);
    const durationMs = baseEnd.getTime() - baseStart.getTime();

    const pushEvent = (start: Date) => {
      const end = new Date(start.getTime() + durationMs);
      if (isAfter(start, visibleEnd) || isBefore(end, visibleStart)) return;
      events.push({
        id: `${meeting.id}-${start.getTime()}`,
        title: meeting.title,
        start,
        end,
        type: 'meeting',
        resource: meeting,
      });
    };

    if (!meeting.recurrence || meeting.recurrence === 'none') {
      pushEvent(baseStart);
      continue;
    }

    // Find the first occurrence on/after visibleStart
    let occurrenceStart = new Date(baseStart);
    while (isBefore(occurrenceStart, visibleStart)) {
      if (meeting.recurrence === 'daily') occurrenceStart = addDays(occurrenceStart, 1);
      else if (meeting.recurrence === 'weekly') occurrenceStart = addWeeks(occurrenceStart, 1);
      else if (meeting.recurrence === 'monthly') occurrenceStart = addMonths(occurrenceStart, 1);
      else break;
    }

    // Emit occurrences within range
    while (!isAfter(occurrenceStart, visibleEnd)) {
      pushEvent(occurrenceStart);
      if (meeting.recurrence === 'daily') occurrenceStart = addDays(occurrenceStart, 1);
      else if (meeting.recurrence === 'weekly') occurrenceStart = addWeeks(occurrenceStart, 1);
      else if (meeting.recurrence === 'monthly') occurrenceStart = addMonths(occurrenceStart, 1);
      else break;
    }
  }
  return events;
}


