import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";
import * as jose from "jose";
import { auth } from "@/auth";

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

export async function GET(request: Request) {
  let userId: string;
  try {
    userId = await resolveUserId(request);
  } catch (resp) {
    return resp as NextResponse;
  }

  try {
    const { env } = await getRequestContext();
    const { results } = await env.calendar
      .prepare(
        `
        SELECT assignment_id, completed_at
        FROM completed_assignments
        WHERE user_id = ?1 AND completed = 1
        ORDER BY completed_at DESC
      `
      )
      .bind(userId)
      .all<{ assignment_id: string; completed_at: string | null }>();

    const assignments =
      results?.map((row) => ({
        assignmentId: row.assignment_id,
        completedAt: row.completed_at,
      })) ?? [];

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    console.error("[/api/calendar/ical/complete] Failed to load assignments", error);
    return NextResponse.json(
      { message: "Unable to load completed assignments. Please try again later." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  let userId: string;
  try {
    userId = await resolveUserId(request);
  } catch (resp) {
    return resp as NextResponse;
  }

  try {
    const body = (await request.json()) as {
      assignmentId?: string;
      completed?: boolean;
    };

    if (!body?.assignmentId || typeof body.assignmentId !== "string") {
      return NextResponse.json(
        { message: "Missing assignmentId" },
        { status: 400 }
      );
    }

    if (typeof body.completed !== "boolean") {
      return NextResponse.json(
        { message: "Missing completed flag" },
        { status: 400 }
      );
    }

    const completed = body.completed ? 1 : 0;
    const completedAt = body.completed ? new Date().toISOString() : null;

    const { env } = await getRequestContext();
    const upsertResult = await env.calendar
      .prepare(
        `
        INSERT INTO completed_assignments (user_id, assignment_id, completed, completed_at)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(user_id, assignment_id) DO UPDATE SET
          completed = excluded.completed,
          completed_at = excluded.completed_at
      `
      )
      .bind(userId, body.assignmentId, completed, completedAt)
      .run();

    if (!upsertResult.success) {
      throw new Error("Failed to update completion status");
    }

    return NextResponse.json(
      {
        assignmentId: body.assignmentId,
        completed: body.completed,
        completedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/calendar/ical/complete] Failed to update assignment", error);
    return NextResponse.json(
      { message: "Unable to update assignment completion. Please try again later." },
      { status: 500 }
    );
  }
}
