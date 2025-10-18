
'use client';
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { Meeting } from "@/lib/types";

interface MeetingStatusBadgeProps {
  status: Meeting['status'];
}

export function MeetingStatusBadge({ status }: MeetingStatusBadgeProps) {
  return (
    <Badge
      className={cn({
        "bg-green-500/20 text-green-400 border-green-500/30": status === 'ongoing',
        "bg-blue-500/20 text-blue-400 border-blue-500/30": status === 'upcoming',
        "bg-muted text-muted-foreground border-border": status === 'past',
      })}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
