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

type ReflectionResponse = {
  question: string
  answer: string
}

type ReflectionRequestBody = {
  responses: ReflectionResponse[]
}

export async function POST(request: Request) {
  let userId: string
  try {
    userId = await resolveUserId(request)
  } catch (resp) {
    return resp as NextResponse
  }

  let body: ReflectionRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  // Expecting { responses: [...] }
  if (!body || typeof body !== 'object' || !Array.isArray(body.responses)) {
    return NextResponse.json({ message: 'Missing or invalid responses' }, { status: 400 })
  }

  const responsesJson = JSON.stringify(body.responses)

  const { env } = await getRequestContext()
  const result = await env.users
    .prepare(
      `INSERT INTO reflections (user_id, responses) VALUES (?1, ?2)`
    )
    .bind(userId, responsesJson)
    .run()

  if (!result.success) {
    return NextResponse.json({ message: 'Failed to save reflection' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}

export async function GET(request: Request) {
  let userId: string
  try {
    userId = await resolveUserId(request)
  } catch (resp) {
    return resp as NextResponse
  }

  const { env } = await getRequestContext()
  const result = await env.users
    .prepare(
      `SELECT id, responses, created_at FROM reflections WHERE user_id = ?1 ORDER BY created_at DESC`
    )
    .bind(userId)
    .all<{ id: number; responses: string; created_at: string }>()

  if (!result.success) {
    return NextResponse.json({ message: 'Failed to fetch reflections' }, { status: 500 })
  }

  // Parse responses JSON for each reflection
  const reflections = (result.results || []).map(r => ({
    id: r.id,
    responses: (() => {
      try {
        return JSON.parse(r.responses)
      } catch {
        return []
      }
    })(),
    created_at: r.created_at,
  }))

  return NextResponse.json({ reflections })
}