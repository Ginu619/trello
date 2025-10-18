'use client';

import { Calendar as MiniCalendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { addHours, isToday } from 'date-fns';
import { PlusCircle, Search } from 'lucide-react';
import { ReactNode } from 'react';

export type CalendarFilters = {
  showMeetings: boolean;
  showTasks: boolean;
};

interface CalendarSidebarProps {
  date: Date;
  onDateChange: (date: Date) => void;
  search: string;
  onSearchChange: (q: string) => void;
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
  onCreate: (ctx: { date: Date }) => void;
  footer?: ReactNode;
}

export function CalendarSidebar({
  date,
  onDateChange,
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onCreate,
  footer,
}: CalendarSidebarProps) {
  const defaultCreateDate = isToday(date) ? addHours(new Date(), 1) : new Date(date);

  return (
    <aside className="w-full sm:w-72 shrink-0 space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <MiniCalendar
          mode="single"
          selected={date}
          onSelect={(d) => d && onDateChange(d)}
          initialFocus
        />
        <div className="mt-4 flex gap-2">
          <Button className="w-full" onClick={() => onCreate({ date: defaultCreateDate })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="calendar-search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="calendar-search"
              className="pl-8"
              placeholder="Search events"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn('inline-block h-3 w-3 rounded-sm', 'bg-primary/80')} />
              <Label className="font-normal">Meetings</Label>
            </div>
            <Switch
              checked={filters.showMeetings}
              onCheckedChange={(checked) => onFiltersChange({ ...filters, showMeetings: !!checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn('inline-block h-3 w-3 rounded-sm', 'border border-chart-2')} />
              <Label className="font-normal">Tasks</Label>
            </div>
            <Switch
              checked={filters.showTasks}
              onCheckedChange={(checked) => onFiltersChange({ ...filters, showTasks: !!checked })}
            />
          </div>
        </div>
      </div>

      {footer}
    </aside>
  );
}
