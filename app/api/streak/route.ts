// app/api/streak/route.ts
import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextResponse } from 'next/server'
import * as jose from 'jose'

export const runtime = 'edge'

// HMAC secret for your own JWTs
const authSecret = new TextEncoder().encode(process.env.AUTH_SECRET || '')

/** Verify incoming Bearer token and return user_id or throw a NextResponse */
async function verifyToken(request: Request): Promise<string> {
  const auth = request.headers.get('authorization') || ''
  const match = auth.match(/^Bearer (.+)$/)
  if (!match) {
    throw new NextResponse(
      JSON.stringify({ message: 'Missing or malformed Authorization header' }),
      { status: 401 }
    )
  }
  try {
    const { payload } = await jose.jwtVerify(match[1], authSecret, {
      algorithms: ['HS256'],
    })
    if (typeof payload.user_id !== 'string') {
      throw new Error('Invalid token payload')
    }
    return payload.user_id
  } catch {
    throw new NextResponse(
      JSON.stringify({ message: 'Invalid or expired token' }),
      { status: 401 }
    )
  }
}

export async function GET(request: Request) {
  let userId: string
  try {
    userId = await verifyToken(request)
  } catch (resp) {
    return resp as NextResponse
  }

  const { env } = await getRequestContext()

  // 1️⃣ Compute current consecutive-day streak
  const streakSql = `
    WITH dated_activities AS (
      SELECT
        date(completed_at) AS activity_date,
        ROW_NUMBER() OVER (ORDER BY date(completed_at)) AS row_num
      FROM activities
      WHERE user_id = ?1
      GROUP BY date(completed_at)
      ORDER BY activity_date DESC
    ),
    streak_groups AS (
      SELECT
        activity_date,
        date(activity_date, '-' || row_num || ' days') AS streak_group
      FROM dated_activities
    )
    SELECT COUNT(*) AS streak_count
    FROM (
      SELECT activity_date
      FROM streak_groups
      WHERE streak_group = (
        SELECT streak_group
        FROM streak_groups
        WHERE activity_date = date('now')
        LIMIT 1
      )
    )
  `
  const streakResult = await env.users.prepare(streakSql).bind(userId).first<{ streak_count: number }>()
  const streakCount = streakResult?.streak_count ?? 0

  // 2️⃣ Get all activity dates for the current month
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const firstDay = `${year}-${month}-01`
  const lastDayNum = new Date(year, now.getMonth() + 1, 0).getDate()
  const lastDay = `${year}-${month}-${String(lastDayNum).padStart(2, '0')}`

  const monthSql = `
    SELECT DISTINCT date(completed_at) AS activity_date
    FROM activities
    WHERE user_id = ?1
      AND date(completed_at) BETWEEN ?2 AND ?3
    ORDER BY activity_date ASC
  `
  const monthRes = await env.users.prepare(monthSql).bind(userId, firstDay, lastDay).all<{ activity_date: string }>()
  const streakDates = Array.isArray(monthRes.results)
    ? monthRes.results.map((r) => r.activity_date)
    : []

  // 3️⃣ Return JSON response
  return NextResponse.json({
    streak_count: streakCount,
    streak_dates: streakDates,
  })
}
