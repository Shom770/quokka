import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";
import * as jose from "jose";
import { auth } from "@/auth";
import {
  parseICalendarFeed,
  serializeAssignments,
} from "@/utils/ical";

export const runtime = "edge";

const AUTH_SECRET = process.env.AUTH_SECRET || "";
const authSecret = new TextEncoder().encode(AUTH_SECRET);

async function resolveUserId(request: Request): Promise<string> {
  const session = await auth();
  if (session?.sub && typeof session.sub === "string") {
    return session.sub;
  }

  const authHeader = request.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    throw new NextResponse(
      JSON.stringify({
        message: "Missing credentials (cookie or Bearer token)",
      }),
      { status: 401 }
    );
  }

  try {
    const { payload } = await jose.jwtVerify(match[1], authSecret, {
      algorithms: ["HS256"],
    });
    if (typeof payload.user_id === "string") {
      return payload.user_id;
    }
    throw new Error("Invalid token payload");
  } catch {
    throw new NextResponse(
      JSON.stringify({ message: "Invalid or expired token" }),
      { status: 401 }
    );
  }
}

function validateCalendarUrl(input: string): URL | NextResponse {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(input);
  } catch {
    return NextResponse.json(
      { message: "Invalid iCal URL" },
      { status: 400 }
    );
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    return NextResponse.json(
      {
        message:
          "Unsupported protocol. Please use HTTP or HTTPS links.",
      },
      { status: 400 }
    );
  }

  return parsedUrl;
}

async function fetchAssignments(parsedUrl: URL): Promise<
  | { assignments: ReturnType<typeof serializeAssignments> }
  | NextResponse
> {
  const response = await fetch(parsedUrl.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        message: `Failed to download calendar (${response.status})`,
      },
      { status: 400 }
    );
  }

  const ics = await response.text();
  const assignments = serializeAssignments(
    parseICalendarFeed(ics)
  );
  return { assignments };
}

export async function POST(request: Request) {
  let userId: string;
  try {
    userId = await resolveUserId(request);
  } catch (resp) {
    return resp as NextResponse;
  }

  try {
    const { url } = (await request.json()) as { url?: string };
    if (!url) {
      return NextResponse.json(
        { message: "Missing iCal URL" },
        { status: 400 }
      );
    }

    const parsedUrl = validateCalendarUrl(url);
    if (parsedUrl instanceof NextResponse) {
      return parsedUrl;
    }

    const result = await fetchAssignments(parsedUrl);
    if (result instanceof NextResponse) {
      return result;
    }

    const { env } = await getRequestContext();
    const upsertResult = await env.users
      .prepare(
        `
        INSERT INTO users (user_id, points, ical_iurl)
        VALUES (?1, 0, ?2)
        ON CONFLICT(user_id) DO UPDATE
          SET ical_iurl = excluded.ical_iurl
        `
      )
      .bind(userId, parsedUrl.toString())
      .run();

    if (!upsertResult.success) {
      throw new Error("Failed to store calendar URL");
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[/api/calendar/ical] Failed to fetch calendar", error);
    return NextResponse.json(
      { message: "Unable to load calendar feed. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  let userId: string;
  try {
    userId = await resolveUserId(request);
  } catch (resp) {
    return resp as NextResponse;
  }

  try {
    const { env } = await getRequestContext();
    const row = await env.users
      .prepare(
        `
        SELECT ical_iurl
        FROM users
        WHERE user_id = ?1
      `
      )
      .bind(userId)
      .first<{ ical_iurl: string | null }>();

    const storedUrl = row?.ical_iurl ?? null;

    if (!storedUrl) {
      return NextResponse.json(
        { message: "No calendar feed configured for this user." },
        { status: 404 }
      );
    }

    const parsedUrl = validateCalendarUrl(storedUrl);
    if (parsedUrl instanceof NextResponse) {
      return NextResponse.json(
        {
          message:
            "Stored calendar URL is invalid. Please reconnect your calendar.",
        },
        { status: 500 }
      );
    }

    const result = await fetchAssignments(parsedUrl);
    if (result instanceof NextResponse) {
      return result;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[/api/calendar/ical] Failed to load stored calendar", error);
    return NextResponse.json(
      { message: "Unable to load calendar feed. Please try again later." },
      { status: 500 }
    );
  }
}
