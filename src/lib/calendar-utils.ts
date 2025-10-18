
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, eachDayOfInterval } from 'date-fns';

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

