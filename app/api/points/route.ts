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
  let userId: string
  try {
    userId = await resolveUserId(request)
  } catch (resp) {
    return resp as NextResponse
  }

  const { env } = await getRequestContext()

  // Try to get points
  const row = await env.users
    .prepare('SELECT points FROM users WHERE user_id = ?1')
    .bind(userId)
    .first<{ points: number }>()

  if (row && typeof row.points === 'number') {
    return NextResponse.json({ points: row.points })
  }

  // If not found, create user row and return 0
  await env.users
    .prepare('INSERT INTO users (user_id, points) VALUES (?1, 0) ON CONFLICT(user_id) DO NOTHING')
    .bind(userId)
    .run()

  return NextResponse.json({ points: 0 })
}