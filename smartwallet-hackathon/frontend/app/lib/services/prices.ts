'use client'

// Simple price fetching utilities for hackathon use
// Uses public CoinGecko endpoint; falls back to a static value on failure

export async function getEthPriceUsd(): Promise<number> {
  try {
    // CoinGecko simple price API
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
      // Cache for 60 seconds to avoid rate limits
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error('Failed to fetch price')
    const data = await res.json()
    const price = Number(data?.ethereum?.usd)
    if (!isFinite(price) || price <= 0) throw new Error('Invalid price')
    return price
  } catch (_e) {
    // Fallback to a reasonable default if API fails
    return 2000
  }
}

// Returns ETH price and 24h percentage change
export async function getEthPrice(): Promise<{ priceUsd: number; change24hPct: number }> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: 60 } }
    )
    if (!res.ok) throw new Error('Failed to fetch price')
    const data = await res.json()
    const price = Number(data?.ethereum?.usd)
    const change = Number(data?.ethereum?.usd_24h_change)
    if (!isFinite(price) || price <= 0) throw new Error('Invalid price')
    return {
      priceUsd: price,
      change24hPct: isFinite(change) ? change : 0,
    }
  } catch (_e) {
    return { priceUsd: 2000, change24hPct: 0 }
  }
}

export async function getTokenPriceUsdByAddress(chain: 'ethereum', tokenAddress: string): Promise<number | null> {
  try {
    // Extendable placeholder for ERC20 prices by address if needed later
    // Not implemented for now
    return null
  } catch {
    return null
  }
}


