// app/api/sleep/stats/route.ts

import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextResponse } from 'next/server'
import * as jose from 'jose'
import { auth } from '@/auth'

export const runtime = 'edge'

const AUTH_SECRET = process.env.AUTH_SECRET || ''
const authSecret = new TextEncoder().encode(AUTH_SECRET)

/**
 * Resolve the current user’s ID by checking NextAuth session,
 * then falling back to a Bearer‑token JWT.
 * Throws a 401 NextResponse on failure.
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

  const { env } = await getRequestContext()

  // 2️⃣ Parse query params with defaults
  const url = new URL(request.url)
  const endDate =
    url.searchParams.get('end_date') ||
    new Date().toISOString().split('T')[0]
  const startDate =
    url.searchParams.get('start_date') ||
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  try {
    // 3️⃣ Aggregate statistics
    const stats = await env.users
      .prepare(
        `
        SELECT
          AVG(hours)            AS average_hours,
          MAX(hours)            AS max_hours,
          MIN(hours)            AS min_hours,
          AVG(quality)          AS average_quality,
          COUNT(*)              AS total_records,
          COUNT(DISTINCT sleep_date) AS total_days
        FROM sleep_records
        WHERE user_id = ?1
          AND sleep_date BETWEEN ?2 AND ?3
      `
      )
      .bind(userId, startDate, endDate)
      .first<{
        average_hours: number
        max_hours: number
        min_hours: number
        average_quality: number
        total_records: number
        total_days: number
      }>()

    const baseline = {
      average_hours: 0,
      max_hours: 0,
      min_hours: 0,
      average_quality: 0,
      total_records: 0,
      total_days: 0,
    }
    const resultStats = stats || baseline

    // 4️⃣ Day-by-day breakdown
    const daily = await env.users
      .prepare(
        `
        SELECT
          sleep_date,
          AVG(hours)   AS hours,
          AVG(quality) AS quality
        FROM sleep_records
        WHERE user_id = ?1
          AND sleep_date BETWEEN ?2 AND ?3
        GROUP BY sleep_date
        ORDER BY sleep_date ASC
      `
      )
      .bind(userId, startDate, endDate)
      .all<{ sleep_date: string; hours: number; quality: number }>()

    const dailyData = Array.isArray(daily.results) ? daily.results : []

    // 5️⃣ Return JSON
    return NextResponse.json({
      ...resultStats,
      start_date: startDate,
      end_date: endDate,
      daily_data: dailyData,
    })
  } catch (err) {
    console.error('[/api/sleep/stats] error:', err)
    return NextResponse.json(
      { message: 'Failed to fetch sleep statistics' },
      { status: 500 }
    )
  }
}
