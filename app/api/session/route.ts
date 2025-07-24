import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

export const runtime = 'edge'

// Google’s JWK Set URL
const JWKS = jose.createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
)

export async function POST(req: NextRequest) {
  let body: { credential?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { message: 'Invalid JSON' },
      { status: 400 }
    )
  }

  const credential = body.credential
  if (typeof credential !== 'string') {
    return NextResponse.json(
      { message: "'credential' must be a string" },
      { status: 400 }
    )
  }

  let payload: jose.JWTVerifyResult['payload']
  try {
    const verified = await jose.jwtVerify(credential, JWKS, {
      issuer: 'https://accounts.google.com',
      audience: process.env.APP_GOOGLE_ID,
    })
    payload = verified.payload
  } catch (err: unknown) {
    console.error('[/api/session] token verification failed:', err)
    return NextResponse.json(
      { message: 'Invalid Google credential' },
      { status: 403 }
    )
  }

  const sub = payload.sub
  const exp = payload.exp
  if (typeof sub !== 'string' || typeof exp !== 'number') {
    return NextResponse.json(
      { message: 'Google token missing sub or exp' },
      { status: 403 }
    )
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET
    )
    const token = await new jose.SignJWT({ user_id: sub })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(exp)
      .sign(secret)

    return NextResponse.json({ token })
  } catch (err: unknown) {
    console.error('[/api/session] signing failed:', err)
    return NextResponse.json(
      { message: 'Failed to sign token' },
      { status: 500 }
    )
  }
}
