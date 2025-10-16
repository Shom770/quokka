export type CalendarAssignment = {
  uid?: string;
  title: string;
  start: Date;
  end?: Date;
  description?: string;
  location?: string;
  allDay: boolean;
};

export type CalendarAssignmentPayload = Omit<
  CalendarAssignment,
  "start" | "end"
> & {
  start: string;
  end?: string;
};

function decodeIcsText(value: string) {
  return value
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .trim()
    .replace(/\s+$/g, "");
}

function parseDate(
  value: string,
  tzid?: string
): { date: Date | null; allDay: boolean } {
  let allDay = false;
  let cleanValue = value.trim();

  // Handle VALUE=DATE (e.g., DTSTART;VALUE=DATE:20241105)
  if (cleanValue.length === 8 && /^\d{8}$/.test(cleanValue)) {
    const year = Number(cleanValue.slice(0, 4));
    const month = Number(cleanValue.slice(4, 6)) - 1;
    const day = Number(cleanValue.slice(6, 8));
    allDay = true;
    return { date: new Date(year, month, day), allDay };
  }

  // Convert floating times (no timezone, e.g., YYYYMMDDTHHmmss)
  if (/^\d{8}T\d{6}$/.test(cleanValue)) {
    const year = Number(cleanValue.slice(0, 4));
    const month = Number(cleanValue.slice(4, 6)) - 1;
    const day = Number(cleanValue.slice(6, 8));
    const hour = Number(cleanValue.slice(9, 11));
    const minute = Number(cleanValue.slice(11, 13));
    const second = Number(cleanValue.slice(13, 15));

    // Timezone aware parsing is complex without Temporal/Intl support,
    // so we treat it as local time but keep tzid on the Date via offset adjustments.
    if (tzid && typeof Intl !== "undefined" && "DateTimeFormat" in Intl) {
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tzid,
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const parts = formatter.formatToParts(
          new Date(Date.UTC(year, month, day, hour, minute, second))
        );
        const get = (type: Intl.DateTimeFormatPartTypes) =>
          Number(parts.find((p) => p.type === type)?.value);
        const tzDate = new Date(
          get("year"),
          (get("month") || 1) - 1,
          get("day") || 1,
          get("hour") || 0,
          get("minute") || 0,
          get("second") || 0
        );
        if (!Number.isNaN(tzDate.getTime())) {
          return { date: tzDate, allDay };
        }
      } catch {
        // fall through to local parsing
      }
    }

    const date = new Date(year, month, day, hour, minute, second);
    return { date, allDay };
  }

  // Try to parse as ISO or RFC compliant string (handles trailing Z, offsets, etc.)
  const parsed = new Date(cleanValue);
  if (!Number.isNaN(parsed.getTime())) {
    return { date: parsed, allDay };
  }

  return { date: null, allDay };
}

function unfoldLines(ics: string) {
  const normalized = ics.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const unfolded: string[] = [];

  for (const line of lines) {
    if (!line) {
      continue;
    }
    if ((line.startsWith(" ") || line.startsWith("\t")) && unfolded.length) {
      unfolded[unfolded.length - 1] += line.slice(1);
      continue;
    }
    unfolded.push(line);
  }

  return unfolded;
}

export function parseICalendarFeed(ics: string) {
  const lines = unfoldLines(ics);
  const events: CalendarAssignment[] = [];
  let current: Partial<CalendarAssignment & { uid?: string }> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (current?.title && current.start instanceof Date) {
        events.push({
          uid: current.uid,
          title: current.title,
          start: current.start,
          end: current.end,
          description: current.description,
          location: current.location,
          allDay: Boolean(current.allDay),
        });
      }
      current = null;
      continue;
    }

    if (!current) {
      continue;
    }

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const propertyPart = line.slice(0, separatorIndex);
    const rawValue = line.slice(separatorIndex + 1);
    const [property, ...params] = propertyPart.split(";");
    const tzidParam = params.find((param) => param.startsWith("TZID="));
    const tzid = tzidParam ? tzidParam.split("=")[1] : undefined;
    const value = decodeIcsText(rawValue);

    switch (property) {
      case "SUMMARY":
        current.title = value;
        break;
      case "DESCRIPTION":
        current.description = value;
        break;
      case "LOCATION":
        current.location = value;
        break;
      case "UID":
        current.uid = value;
        break;
      case "DTSTART": {
        const result = parseDate(rawValue, tzid);
        if (result.date) {
          current.start = result.date;
          current.allDay = result.allDay;
        }
        break;
      }
      case "DTEND": {
        const result = parseDate(rawValue, tzid);
        if (result.date) {
          current.end = result.date;
          current.allDay = current.allDay ?? result.allDay;
        }
        break;
      }
      default:
        break;
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function serializeAssignments(
  assignments: CalendarAssignment[]
): CalendarAssignmentPayload[] {
  return assignments.map((assignment) => ({
    uid: assignment.uid,
    title: assignment.title,
    start: assignment.start.toISOString(),
    end: assignment.end?.toISOString(),
    description: assignment.description,
    location: assignment.location,
    allDay: assignment.allDay,
  }));
}
