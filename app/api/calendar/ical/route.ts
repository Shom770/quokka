import { NextResponse } from "next/server";
import {
  parseICalendarFeed,
  serializeAssignments,
} from "@/utils/ical";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { url } = (await request.json()) as { url?: string };
    if (!url) {
      return NextResponse.json(
        { message: "Missing iCal URL" },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { message: "Invalid iCal URL" },
        { status: 400 }
      );
    }

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return NextResponse.json(
        { message: "Unsupported protocol. Please use HTTP or HTTPS links." },
        { status: 400 }
      );
    }

    const response = await fetch(parsedUrl.toString(), { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json(
        { message: `Failed to download calendar (${response.status})` },
        { status: 400 }
      );
    }

    const ics = await response.text();
    const assignments = serializeAssignments(parseICalendarFeed(ics));

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    console.error("[/api/calendar/ical] Failed to fetch calendar", error);
    return NextResponse.json(
      { message: "Unable to load calendar feed. Please try again later." },
      { status: 500 }
    );
  }
}
