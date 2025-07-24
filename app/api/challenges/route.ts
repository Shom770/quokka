// app/api/challenges/route.ts

import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextResponse } from 'next/server'
import * as jose from 'jose'
import { auth } from '@/auth'

export const runtime = 'edge'

const AUTH_SECRET = process.env.AUTH_SECRET || ''
const authSecret = new TextEncoder().encode(AUTH_SECRET)

async function resolveUserId(request: Request): Promise<string> {
  const session = await auth()
  if (session?.sub) return session.sub

  const header = request.headers.get('authorization') || ''
  const match = header.match(/^Bearer (.+)$/)
  if (!match) throw new NextResponse(JSON.stringify({ message: 'Missing credentials' }), { status: 401 })

  try {
    const { payload } = await jose.jwtVerify(match[1], authSecret, { algorithms: ['HS256'] })
    if (typeof payload.user_id !== 'string') throw new Error()
    return payload.user_id
  } catch {
    throw new NextResponse(JSON.stringify({ message: 'Invalid token' }), { status: 401 })
  }
}

interface ChallengeBody {
  challenge_id: number
  notes?: string | null
}

export async function POST(request: Request) {
  // parse & type
  let body: ChallengeBody
  try {
    body = await request.json() as ChallengeBody
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const { challenge_id, notes } = body
  if (!Number.isInteger(challenge_id)) {
    return NextResponse.json({ message: "'challenge_id' must be an integer" }, { status: 400 })
  }

  // auth
  let userId: string
  try {
    userId = await resolveUserId(request)
  } catch (res) {
    return res as NextResponse
  }

  const { env } = await getRequestContext()

  // check exists
  const chk = await env.challenges
    .prepare('SELECT id FROM challenges WHERE id = ?1')
    .bind(challenge_id)
    .first<{ id: number }>()
  if (!chk) {
    return NextResponse.json({ message: 'Challenge not found' }, { status: 404 })
  }

  // insert
  const timestamp = new Date().toISOString()
  const ins = await env.users
    .prepare(`
      INSERT INTO activities
        (user_id, activity_id, type, completed_at, notes)
      VALUES
        (?1, ?2, 'challenge', ?3, ?4)
    `)
    .bind(userId, challenge_id.toString(), timestamp, notes ?? null)
    .run()

  if (!ins.success) {
    return NextResponse.json({ message: 'DB error' }, { status: 500 })
  }

  return NextResponse.json({ success: true, timestamp }, { status: 201 })
}
