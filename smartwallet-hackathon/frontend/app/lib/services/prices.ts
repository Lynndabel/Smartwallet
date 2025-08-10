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

export async function getTokenPriceUsdByAddress(chain: 'ethereum', tokenAddress: string): Promise<number | null> {
  try {
    // Extendable placeholder for ERC20 prices by address if needed later
    // Not implemented for now
    return null
  } catch {
    return null
  }
}


