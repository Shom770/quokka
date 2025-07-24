// app/api/calendar/route.ts

import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextResponse } from 'next/server'
import * as jose from 'jose'
import { auth } from '@/auth'

export const runtime = 'edge'

const AUTH_SECRET = process.env.AUTH_SECRET || ''
const authSecret = new TextEncoder().encode(AUTH_SECRET)

/**
 * Resolve the current user’s ID by first checking the NextAuth session,
 * then falling back to a Bearer‑token JWT.
 * @throws NextResponse(401) if no valid user ID is found.
 */
async function resolveUserId(request: Request): Promise<string> {
  // 1️⃣ Try NextAuth session
  const session = await auth()
  if (session?.sub && typeof session.sub === 'string') {
    return session.sub
  }

  // 2️⃣ Fallback to Authorization header
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

export async function GET(request: Request) {
  // 1️⃣ Authenticate
  let userId: string
  try {
    userId = await resolveUserId(request)
  } catch (resp) {
    return resp as NextResponse
  }

  // 2️⃣ Parse date param
  const url = new URL(request.url)
  const dateParam = url.searchParams.get('date')
  const date = dateParam ?? new Date().toISOString().split('T')[0]

  const { env } = await getRequestContext()

  try {
    // 3️⃣ Fetch activities for the date
    const activitiesRes = await env.users
      .prepare(`
        SELECT id,
               activity_id,
               type,
               completed_at,
               notes
        FROM activities
        WHERE user_id = ?1
          AND date(completed_at) = date(?2)
        ORDER BY completed_at DESC
      `)
      .bind(userId, date)
      .all<{ id: number; activity_id: string | number; type: string; completed_at: string; notes: string | null }>()

    const rawActivities = Array.isArray(activitiesRes.results)
      ? activitiesRes.results
      : []

    // 4️⃣ Enrich challenges with theme/description
    const activities = await Promise.all(
      rawActivities.map(async (act) => {
        if (act.type === 'challenge') {
          let cid: number | null = null
          if (typeof act.activity_id === 'number') {
            cid = act.activity_id
          } else if (typeof act.activity_id === 'string') {
            cid = parseInt(act.activity_id.split('.')[0], 10)
          }
          if (cid && Number.isInteger(cid)) {
            const ch = await env.challenges
              .prepare('SELECT theme, description FROM challenges WHERE id = ?1')
              .bind(cid)
              .first<{ theme: string | null; description: string }>()
            if (ch) {
              return {
                ...act,
                challenge_theme: ch.theme,
                challenge_description: ch.description,
              }
            }
          }
        }
        return act
      })
    )

    // 5️⃣ Return
    return NextResponse.json({ date, activities })
  } catch (err) {
    console.error('[/api/calendar] error:', err)
    return NextResponse.json(
      { message: 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
}
