
"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  getMeetings,
  getTasksForUser,
  updateMeeting,
  createMeeting,
  updateCard,
  getTeamMembers,
} from "@/lib/data";
import { CalendarEvent, Card, Meeting, User } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FullCalendarView, CalendarViewType } from "@/components/calendar/FullCalendarView";
import { ScheduleMeetingDialog } from "@/components/meetings/ScheduleMeetingDialog";
import { MeetingDetailsDialog } from "@/components/meetings/MeetingDetailsDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { addDays, addMonths, format, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { Views } from "react-big-calendar";

export default function CalendarPage() {
  const { user, loading: userLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // Data sources
  const [baseMeetings, setBaseMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Card[]>([]);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [showMeetings, setShowMeetings] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  // Calendar controls
  const [currentView, setCurrentView] = useState<CalendarViewType>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [visibleRange, setVisibleRange] = useState<{ start: Date; end: Date}>(() => ({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  }));

  // Dialogs
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDialogState, setScheduleDialogState] = useState<{ meeting?: Meeting; startDate?: Date; endDate?: Date }>({});

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsMeeting, setDetailsMeeting] = useState<Meeting | null>(null);
  const [team, setTeam] = useState<User[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [meetingsData, tasksData] = await Promise.all([
      getMeetings(),
      getTasksForUser(user.id),
    ]);
    setBaseMeetings(meetingsData);
    setTasks(tasksData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchData();
    }
  }, [user, userLoading, fetchData]);

  // Meeting Details team data
  useEffect(() => {
    if (detailsOpen) {
      getTeamMembers().then(setTeam);
    }
  }, [detailsOpen]);

  const expandRecurringMeetings = useCallback((meetings: Meeting[], rangeStart: Date, rangeEnd: Date): CalendarEvent[] => {
    const expanded: CalendarEvent[] = [];
    for (const meeting of meetings) {
      let start = new Date(meeting.startDate);
      let end = new Date(meeting.endDate);
      const recurrence = meeting.recurrence ?? "none";

      const pushOccurrence = (s: Date, e: Date) => {
        if (e < rangeStart || s > rangeEnd) return;
        expanded.push({
          id: `${meeting.id}__${s.toISOString()}`,
          title: meeting.title,
          start: s,
          end: e,
          type: "meeting",
          resource: meeting,
        });
      };

      if (recurrence === "none") {
        pushOccurrence(start, end);
        continue;
      }

      // Align first occurrence within or before rangeStart
      const safetyMax = 400; // prevent infinite loops
      let safety = 0;

      const advance = () => {
        if (recurrence === "daily") {
          start = addDays(start, 1);
          end = addDays(end, 1);
        } else if (recurrence === "weekly") {
          start = addDays(start, 7);
          end = addDays(end, 7);
        } else if (recurrence === "monthly") {
          start = addMonths(start, 1);
          end = addMonths(end, 1);
        }
      };

      while (end < rangeStart && safety < safetyMax) {
        advance();
        safety++;
      }

      while (start <= rangeEnd && safety < safetyMax) {
        pushOccurrence(start, end);
        advance();
        safety++;
      }
    }
    return expanded;
  }, []);

  const computedEvents = useMemo<CalendarEvent[]>(() => {
    const rangeStart = visibleRange.start;
    const rangeEnd = visibleRange.end;

    const meetingEvents = showMeetings
      ? expandRecurringMeetings(baseMeetings, rangeStart, rangeEnd)
      : [];

    const taskEvents: CalendarEvent[] = showTasks
      ? tasks
          .filter((t) => !!t.dueDate)
          .map((task) => {
            const due = new Date(task.dueDate!);
            return {
              id: `task-${task.id}`,
              title: task.title,
              start: due,
              end: due,
              allDay: true,
              type: "task",
              resource: task,
            } as CalendarEvent;
          })
      : [];

    const filtered = [...meetingEvents, ...taskEvents].filter((e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
    return filtered;
  }, [baseMeetings, tasks, showMeetings, showTasks, searchTerm, visibleRange, expandRecurringMeetings]);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setScheduleDialogState({ startDate: start, endDate: end });
    setScheduleDialogOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.type === "meeting") {
      setDetailsMeeting(event.resource as Meeting);
      setDetailsOpen(true);
    }
  }, []);

  const handleEventDrop = useCallback(
    async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      if (event.type === "meeting") {
        const meeting = event.resource as Meeting;
        await updateMeeting(meeting.id, {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });
        await fetchData();
      } else if (event.type === "task") {
        const card = event.resource as Card;
        if (!card.boardId) return;
        const newDue = new Date(start);
        newDue.setHours(0, 0, 0, 0);
        await updateCard(card.boardId, card.id, { dueDate: newDue.toISOString() });
        await fetchData();
      }
    },
    [fetchData]
  );

  const handleEventResize = useCallback(
    async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      if (event.type === "meeting") {
        const meeting = event.resource as Meeting;
        await updateMeeting(meeting.id, {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });
        await fetchData();
      }
      // Tasks remain all-day with a single due date; ignore resize
    },
    [fetchData]
  );

  const handleMeetingScheduled = async (meetingData: Partial<Meeting>) => {
    setScheduleDialogOpen(false);
    if (scheduleDialogState.meeting) {
      await updateMeeting(scheduleDialogState.meeting.id, meetingData);
    } else {
      const newMeetingData = {
        title: meetingData.title!,
        description: meetingData.description || "",
        startDate: meetingData.startDate!,
        endDate: meetingData.endDate!,
        participants: meetingData.participants || [],
        meetingLink: meetingData.meetingLink || "",
        project: meetingData.project,
        recurrence: meetingData.recurrence || "none",
      };
      // @ts-ignore - data layer types omit id/status
      await createMeeting(newMeetingData);
    }
    await fetchData();
    setScheduleDialogState({});
  };

  if (loading || userLoading) {
    return <LoadingSkeleton />;
  }

  const label = formatRangeLabel(currentView, currentDate, visibleRange);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="p-4 rounded-lg border bg-card">
            <Input
              placeholder="Search events"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(d) => d && setCurrentDate(d)}
              initialFocus
            />
          </div>
          <div className="p-4 rounded-lg border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showMeetings">Meetings</Label>
              <Switch id="showMeetings" checked={showMeetings} onCheckedChange={setShowMeetings} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showTasks">Tasks</Label>
              <Switch id="showTasks" checked={showTasks} onCheckedChange={setShowTasks} />
            </div>
            <Button className="w-full" onClick={() => setScheduleDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create
            </Button>
          </div>
        </aside>

        {/* Main calendar */}
        <section className="lg:col-span-9">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addDays(currentDate, - (currentView === Views.MONTH ? 30 : currentView === Views.WEEK ? 7 : 1)))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addDays(currentDate, (currentView === Views.MONTH ? 30 : currentView === Views.WEEK ? 7 : 1)))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="ml-4 text-xl sm:text-2xl font-bold">{label}</h2>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted p-1">
              {[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA].map((v) => (
                <Button
                  key={v}
                  variant={currentView === v ? "default" : "ghost"}
                  onClick={() => setCurrentView(v)}
                  size="sm"
                  className="h-8 px-3"
                >
                  {v === Views.MONTH ? "Month" : v === Views.WEEK ? "Week" : v === Views.DAY ? "Day" : "Agenda"}
                </Button>
              ))}
            </div>
          </div>

          <FullCalendarView
            events={computedEvents}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            date={currentDate}
            view={currentView}
            onNavigate={(d) => setCurrentDate(d)}
            onView={(v) => setCurrentView(v)}
            onRangeChange={(range) => {
              if (Array.isArray(range) && range.length) {
                setVisibleRange({ start: range[0], end: range[range.length - 1] });
              } else if (!Array.isArray(range) && range.start && range.end) {
                setVisibleRange({ start: range.start, end: range.end });
              }
            }}
          />
        </section>
      </div>

      {/* Create/Edit meeting */}
      <ScheduleMeetingDialog
        isOpen={scheduleDialogOpen}
        onOpenChange={(isOpen) => {
          setScheduleDialogOpen(isOpen);
          if (!isOpen) setScheduleDialogState({});
        }}
        onMeetingScheduled={handleMeetingScheduled}
        meetingToEdit={scheduleDialogState.meeting}
        defaultStartDate={scheduleDialogState.startDate}
        defaultEndDate={scheduleDialogState.endDate}
      >
        <div />
      </ScheduleMeetingDialog>

      {/* Meeting details */}
      {detailsMeeting && (
        <MeetingDetailsDialog
          isOpen={detailsOpen}
          onOpenChange={setDetailsOpen}
          meeting={detailsMeeting}
          team={team}
          onMeetingUpdate={async () => {
            await fetchData();
          }}
        />
      )}
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
  );
}

function formatRangeLabel(view: CalendarViewType, currentDate: Date, visibleRange: { start: Date; end: Date }) {
  if (view === Views.MONTH) return format(currentDate, "MMMM yyyy");
  if (view === Views.AGENDA) return format(currentDate, "MMMM d, yyyy");
  if (view === Views.DAY) return format(currentDate, "EEEE, MMM d, yyyy");
  const start = visibleRange.start;
  const end = visibleRange.end;
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameMonth && sameYear) return `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`;
  if (sameYear) return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
}
