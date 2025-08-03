// app/api/activities/route.ts

import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextResponse } from 'next/server'
import * as jose from 'jose'
import { auth } from '@/auth'

export const runtime = 'edge'

// HMAC secret for your own JWTs
const AUTH_SECRET = process.env.AUTH_SECRET || ''
const authSecret = new TextEncoder().encode(AUTH_SECRET)

/**
 * Resolve the current user’s ID by first checking the NextAuth session,
 * then falling back to a Bearer‑token JWT.
 * @throws NextResponse(401) if no valid user ID is found.
 */
async function resolveUserId(request: Request): Promise<string> {
  const session = await auth()
  if (session?.sub && typeof session.sub === 'string') {
    return session.sub
  }

  const authHeader = request.headers.get('authorization') || ''
  const match = authHeader.match(/^Bearer (.+)$/)
  if (!match) {
    throw new NextResponse(
      JSON.stringify({ message: 'Missing credentials (cookie or Bearer token)' }),
      { status: 401 }
    )
  }

  try {
    const { payload } = await jose.jwtVerify(match[1], authSecret, {
      algorithms: ['HS256'],
    })
    if (typeof payload.user_id === 'string') {
      return payload.user_id
    }
    throw new Error('Invalid token payload')
  } catch {
    throw new NextResponse(
      JSON.stringify({ message: 'Invalid or expired token' }),
      { status: 401 }
    )
  }
}

interface ActivityBody {
  activity_id: number | string
  notes?: string | null
}

export async function POST(request: Request) {
  // 1️⃣ Parse and type JSON body
  let body: ActivityBody
  try {
    body = (await request.json()) as ActivityBody
  } catch {
    return NextResponse.json(
      { message: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // 2️⃣ Validate required field
  const { activity_id, notes } = body
  if (activity_id === undefined || activity_id === null) {
    return NextResponse.json(
      { message: "Missing required field 'activity_id'" },
      { status: 400 }
    )
  }

  // 3️⃣ Resolve user ID
  let userId: string
  try {
    userId = await resolveUserId(request)
  } catch (resp) {
    return resp as NextResponse
  }

  const { env } = await getRequestContext()

  // 4️⃣ Insert into activities
  const timestamp = new Date().toISOString()
  const result = await env.users
    .prepare(
      `INSERT INTO activities
         (user_id, activity_id, type, completed_at, notes)
       VALUES
         (?1, ?2, 'activity', ?3, ?4)`
    )
    .bind(userId, activity_id, timestamp, notes ?? null)
    .run()

  if (!result.success) {
    return NextResponse.json(
      { message: 'Failed to record activity completion' },
      { status: 500 }
    )
  }

  // 5️⃣ Create user row if not exists, then add 50 points
  await env.users
    .prepare(`
      INSERT INTO users (user_id, points)
      VALUES (?1, 0)
      ON CONFLICT(user_id) DO NOTHING
    `)
    .bind(userId)
    .run()

  await env.users
    .prepare(`
      UPDATE users
      SET points = points + 50
      WHERE user_id = ?1
    `)
    .bind(userId)
    .run()

  // 6️⃣ Return success
  return NextResponse.json(
    { success: true, timestamp },
    { status: 201 }
  )
}
