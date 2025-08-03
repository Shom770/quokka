import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextResponse } from 'next/server'
import * as jose from 'jose'
import { auth } from '@/auth'

export const runtime = 'edge'

const AUTH_SECRET = process.env.AUTH_SECRET || ''
const authSecret = new TextEncoder().encode(AUTH_SECRET)

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

export async function GET(request: Request) {
  // Authenticate
  let userId: string
  try {
    userId = await resolveUserId(request)
  } catch (resp) {
    return resp as NextResponse
  }

  // Today's date in YYYY-MM-DD
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const todayStr = `${yyyy}-${mm}-${dd}`

  const { env } = await getRequestContext()

  try {
    // Only fetch activities of type 'challenge' for today
    const challengesRes = await env.users
      .prepare(`
        SELECT id,
               activity_id,
               completed_at
        FROM activities
        WHERE user_id = ?1
          AND type = 'challenge'
          AND date(completed_at) = date(?2)
        ORDER BY completed_at DESC
      `)
      .bind(userId, todayStr)
      .all<{ id: number; activity_id: string | number; completed_at: string }>()

    const completedChallenges = Array.isArray(challengesRes.results)
      ? challengesRes.results.map((row) => ({
          id: row.id,
          challenge_id: row.activity_id,
          completed_at: row.completed_at,
        }))
      : []

    return NextResponse.json({ date: todayStr, completed: completedChallenges })
  } catch (err) {
    console.error('[/api/challenges/completed] error:', err)
    return NextResponse.json(
      { message: 'Failed to fetch completed challenges' },
      { status: 500 }
    )
  }
}