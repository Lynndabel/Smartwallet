'use client'

import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Address, formatEther, isAddress } from 'viem'
import { publicClient } from '@/lib/contracts/contracts'
import { SmartWalletABI } from '@/lib/contracts/abis'
import { useSmartWallet, useWalletBalances, useTransactions } from '@/hooks/useSmartWallet'
import { smartWalletService } from '@/lib/contracts/contracts'

export default function WalletEventListener() {
  const { smartWalletAddress } = useSmartWallet()
  const { refreshBalances } = useWalletBalances()
  const { refreshTransactions } = useTransactions()
  const tokenDecimalsCache = useRef(new Map<Address, number>())

  useEffect(() => {
    if (!smartWalletAddress) return

    const unwatchReceived = publicClient.watchContractEvent({
      address: smartWalletAddress,
      abi: SmartWalletABI,
      eventName: 'PaymentReceived',
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const args = log.args as any
            const amount = args?.amount as bigint
            const from = args?.from as Address
            toast.success(`Payment received: ${Number(formatEther(amount)).toFixed(6)} ETH from ${from.slice(0, 6)}...${from.slice(-4)}`)
            // Refresh UI
            refreshBalances()
            refreshTransactions()
          } catch (e) {
            // ignore toast failures
          }
        }
      },
    })

    const unwatchTokenReceived = publicClient.watchContractEvent({
      address: smartWalletAddress,
      abi: SmartWalletABI,
      eventName: 'TokenPaymentReceived',
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const args = log.args as any
            const token = args?.token as Address
            const amount = args?.amount as bigint
            const from = args?.from as Address
            let decimals = tokenDecimalsCache.current.get(token)
            if (decimals == null && isAddress(token)) {
              try {
                decimals = await smartWalletService.tokenDecimals(token)
                tokenDecimalsCache.current.set(token, decimals)
              } catch {
                decimals = 18
              }
            }
            const formatted = decimals === 18 
              ? Number(formatEther(amount)).toFixed(6)
              : (Number(amount) / 10 ** (decimals || 18)).toFixed(6)
            toast.success(`Token received: ${formatted} at ${token.slice(0, 6)}... from ${from.slice(0, 6)}...${from.slice(-4)}`)
            refreshBalances()
            refreshTransactions()
          } catch (e) {
            // ignore toast failures
          }
        }
      },
    })

    return () => {
      try { unwatchReceived?.() } catch {}
      try { unwatchTokenReceived?.() } catch {}
    }
  }, [smartWalletAddress, refreshBalances, refreshTransactions])

  return null
}



