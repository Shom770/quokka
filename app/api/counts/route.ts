// app/api/counts/route.ts

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
  // 1️⃣ Resolve user ID
  let userId: string
  try {
    userId = await resolveUserId(request)
  } catch (resp) {
    return resp as NextResponse
  }

  // 2️⃣ Read optional `type` query param
  const url = new URL(request.url)
  const type = url.searchParams.get('type')  // "activity" or "challenge"

  const { env } = await getRequestContext()

  // 3️⃣ Branch on type filter
  if (type === 'activity' || type === 'challenge') {
    const singleSql = `
      SELECT COUNT(*) AS count
      FROM activities
      WHERE user_id = ?1 AND type = ?2
    `
    const row = await env.users
      .prepare(singleSql)
      .bind(userId, type)
      .first<{ count: number }>()
    const count = row?.count ?? 0

    return NextResponse.json(
      { [`${type}_count`]: count }
    )
  }

  // 4️⃣ No filter: return totals for both
  const totalSql = `
    SELECT 
      COUNT(*)                  AS total_count,
      SUM(CASE WHEN type='activity'  THEN 1 ELSE 0 END) AS activity_count,
      SUM(CASE WHEN type='challenge' THEN 1 ELSE 0 END) AS challenge_count
    FROM activities
    WHERE user_id = ?1
  `
  const totals = await env.users
    .prepare(totalSql)
    .bind(userId)
    .first<{
      total_count: number
      activity_count: number
      challenge_count: number
    }>()
  const result = totals ?? { total_count: 0, activity_count: 0, challenge_count: 0 }

  return NextResponse.json(result)
}
