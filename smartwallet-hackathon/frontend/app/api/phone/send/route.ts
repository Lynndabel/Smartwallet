import { NextRequest, NextResponse } from 'next/server'
// Twilio is dynamically imported only when needed (non-mock)

export const runtime = 'nodejs'

// Simple in-memory code store for mock mode (dev/hackathon) shared via global
const codeStore = (global as any).__verifyCodeStore || new Map<string, { code: string; expiresAt: number }>()
;(global as any).__verifyCodeStore = codeStore
const USE_MOCK = process.env.VERIFY_PROVIDER === 'mock' || process.env.USE_MOCK_PHONE_VERIFY === 'true'
const CODE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid phone' }, { status: 400 })
    }
    const isE164 = /^\+[1-9]\d{9,14}$/.test(phone.trim())
    if (!isE164) {
      return NextResponse.json({ success: false, error: 'Phone must be E.164 format (e.g., +15551234567)' }, { status: 400 })
    }

    // Mock provider path for hackathons/dev (no cost)
    if (USE_MOCK) {
      const code = ('' + Math.floor(100000 + Math.random() * 900000)).slice(0, 6)
      codeStore.set(phone, { code, expiresAt: Date.now() + CODE_TTL_MS })
      // Do not expose the code in production
      const expose = process.env.NODE_ENV !== 'production'
      return NextResponse.json({ success: true, sid: `mock-${Date.now()}`, ...(expose ? { mockCode: code } : {}) })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID
    if (!accountSid || !authToken || !verifySid) {
      return NextResponse.json({ success: false, error: 'Server not configured' }, { status: 500 })
    }

    const twilio = (await import('twilio')).default
    const client = twilio(accountSid, authToken)
    const verification = await client.verify.v2.services(verifySid).verifications.create({ to: phone, channel: 'sms' })

    return NextResponse.json({ success: true, sid: verification.sid })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to send code' }, { status: 500 })
  }
}



