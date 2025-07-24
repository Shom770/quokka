// app/api/sleep/route.ts

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

interface SleepBody {
  hours: number
  quality?: number
  notes?: string
  date?: string
}

export async function POST(request: Request) {
  let body: SleepBody
  try {
    body = await request.json() as SleepBody
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const { hours, quality, notes, date } = body

  if (typeof hours !== 'number' || hours < 0 || hours > 24) {
    return NextResponse.json({ message: 'Hours must be 0–24' }, { status: 400 })
  }
  if (quality !== undefined && (quality < 1 || quality > 5)) {
    return NextResponse.json({ message: 'Quality must be 1–5' }, { status: 400 })
  }

  let userId: string
  try {
    userId = await resolveUserId(request)
  } catch (res) {
    return res as NextResponse
  }

  const { env } = await getRequestContext()
  const sleepDate = date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  const timestamp = new Date().toISOString()

  try {
    const r = await env.users
      .prepare(`
        REPLACE INTO sleep_records
          (user_id, hours, quality, notes, sleep_date, created_at)
        VALUES
          (?1, ?2, ?3, ?4, ?5, ?6)
      `)
      .bind(userId, hours, quality ?? null, notes ?? null, sleepDate, timestamp)
      .run()
    if (!r.success) throw new Error()
    return NextResponse.json({ success: true, sleep_date: sleepDate, recorded_at: timestamp }, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Failed to record sleep' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  let userId: string
  try {
    userId = await resolveUserId(request)
  } catch (res) {
    return res as NextResponse
  }

  const { env } = await getRequestContext()
  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  const start = url.searchParams.get('start_date') ?? '2000-01-01'
  const end = url.searchParams.get('end_date') ?? new Date().toISOString().slice(0, 10)

  const sql = date
    ? `
      SELECT id, hours, quality, notes, sleep_date, created_at
      FROM sleep_records
      WHERE user_id = ?1 AND sleep_date = ?2
      ORDER BY created_at DESC
    `
    : `
      SELECT id, hours, quality, notes, sleep_date, created_at
      FROM sleep_records
      WHERE user_id = ?1 AND sleep_date BETWEEN ?2 AND ?3
      ORDER BY sleep_date DESC, created_at DESC
    `
  const params = date ? [userId, date] : [userId, start, end]

  try {
    const res = await env.users.prepare(sql).bind(...params).all()
    if (!res.success) throw new Error()
    return NextResponse.json({ records: res.results })
  } catch {
    return NextResponse.json({ message: 'Failed to fetch sleep records' }, { status: 500 })
  }
}
