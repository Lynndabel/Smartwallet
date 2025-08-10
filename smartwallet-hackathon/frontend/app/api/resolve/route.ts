import { NextRequest, NextResponse } from 'next/server'
import { publicClient } from '@/lib/contracts/contracts'
import { UserRegistryABI } from '@/lib/contracts/abis'
import { getContractAddress } from '@/lib/contracts/address'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const identifier = searchParams.get('id') || searchParams.get('identifier')
    if (!identifier) {
      return NextResponse.json({ success: false, error: 'Missing identifier' }, { status: 400 })
    }

    // Read identifier details from registry mapping to avoid revert
    const res = await publicClient.readContract({
      address: getContractAddress('USER_REGISTRY'),
      abi: UserRegistryABI as any,
      functionName: 'identifierToUser',
      args: [identifier],
    }) as any

    const wallet = res?.wallet as string | undefined
    const identifierType = res?.identifierType as string | undefined
    const isActive = Boolean(res?.isActive)

    if (!wallet || !isActive) {
      return NextResponse.json({ success: true, found: false })
    }

    return NextResponse.json({
      success: true,
      found: true,
      wallet,
      identifier,
      type: identifierType,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Resolve failed' }, { status: 500 })
  }
}


