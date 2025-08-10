import { NextRequest, NextResponse } from 'next/server'
// Twilio is dynamically imported only when needed (non-mock)

export const runtime = 'nodejs'

// Mirror the mock store used in send/route.ts via module cache
const codeStore = (global as any).__verifyCodeStore || new Map<string, { code: string; expiresAt: number }>()
;(global as any).__verifyCodeStore = codeStore
const USE_MOCK = process.env.VERIFY_PROVIDER === 'mock' || process.env.USE_MOCK_PHONE_VERIFY === 'true'

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()
    if (!phone || typeof phone !== 'string' || !code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }
    const isE164 = /^\+[1-9]\d{9,14}$/.test(phone.trim())
    if (!isE164) {
      return NextResponse.json({ success: false, error: 'Phone must be E.164 format (e.g., +15551234567)' }, { status: 400 })
    }

    if (USE_MOCK) {
      const entry = codeStore.get(phone)
      const isValid = Boolean(entry && entry.code === code && Date.now() < entry.expiresAt)
      if (isValid) codeStore.delete(phone)
      return NextResponse.json({ success: true, isValid })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID
    if (!accountSid || !authToken || !verifySid) {
      return NextResponse.json({ success: false, error: 'Server not configured' }, { status: 500 })
    }

    const twilio = (await import('twilio')).default
    const client = twilio(accountSid, authToken)
    const check = await client.verify.v2.services(verifySid).verificationChecks.create({ to: phone, code })

    const isValid = check.status === 'approved'
    return NextResponse.json({ success: true, isValid })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to verify code' }, { status: 500 })
  }
}



