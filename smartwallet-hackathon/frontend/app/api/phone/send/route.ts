import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export const runtime = 'nodejs'

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

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID
    if (!accountSid || !authToken || !verifySid) {
      return NextResponse.json({ success: false, error: 'Server not configured' }, { status: 500 })
    }

    const client = twilio(accountSid, authToken)
    const verification = await client.verify.v2.services(verifySid).verifications.create({ to: phone, channel: 'sms' })

    return NextResponse.json({ success: true, sid: verification.sid })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to send code' }, { status: 500 })
  }
}



