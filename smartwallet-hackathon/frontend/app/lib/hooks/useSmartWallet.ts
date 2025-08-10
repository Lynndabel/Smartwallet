// hooks/useSmartWallet.ts
import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { Address, formatEther, parseEther } from 'viem'
import { smartWalletService } from '@/lib/contracts/contracts'
import toast from 'react-hot-toast'

// Types
export interface TokenBalance {
  symbol: string
  name: string
  balance: string
  usdValue: string
  change: string
  changeType: 'positive' | 'negative'
  color: string
  address?: Address
}

export interface Transaction {
  id: string
  type: 'sent' | 'received'
  amount: string
  token: string
  identifier: string
  identifierType: 'phone' | 'username'
  timestamp: Date
  status: 'completed' | 'pending' | 'failed'
  txHash: string
  gasUsed?: string
  message?: string
}

export interface UserIdentifier {
  id: string
  identifier: string
  type: 'phone' | 'username'
  verified: boolean
  registeredAt: Date
  isDefault: boolean
}

// Main Smart Wallet Hook
export function useSmartWallet() {
  const { address: userAddress } = useAccount()
  const [smartWalletAddress, setSmartWalletAddress] = useState<Address | null>(null)
  const [hasWallet, setHasWallet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize wallet
  useEffect(() => {
    async function initializeWallet() {
      if (!userAddress) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const walletExists = await smartWalletService.hasWallet(userAddress)
        setHasWallet(walletExists)

        if (walletExists) {
          const walletAddr = await smartWalletService.getUserWallet(userAddress)
          setSmartWalletAddress(walletAddr)
        }
      } catch (err) {
        console.error('Failed to initialize wallet:', err)
        setError('Failed to load wallet information')
      } finally {
        setLoading(false)
      }
    }

    initializeWallet()
  }, [userAddress])

  // Create wallet
  const createWallet = useCallback(async (identifier?: string, identifierType?: 'phone' | 'username') => {
    if (!userAddress) throw new Error('User not connected')

    try {
      setLoading(true)
      let txHash: Address

      if (identifier && identifierType) {
        txHash = await smartWalletService.createWalletWithIdentifier(
          identifier,
          identifierType,
          userAddress
        )
      } else {
        txHash = await smartWalletService.createWallet(userAddress)
      }

      // Wait for transaction
      await smartWalletService.waitForTransaction(txHash)
      
      // Refresh wallet state
      const walletAddr = await smartWalletService.getUserWallet(userAddress)
      setSmartWalletAddress(walletAddr)
      setHasWallet(true)
      
      toast.success('Smart wallet created successfully!')
      return walletAddr
    } catch (err) {
      console.error('Failed to create wallet:', err)
      toast.error('Failed to create wallet')
      throw err
    } finally {
      setLoading(false)
    }
  }, [userAddress])

  return {
    smartWalletAddress,
    hasWallet,
    loading,
    error,
    createWallet,
  }
}

// Hook for wallet balances
export function useWalletBalances() {
  const { address: userAddress } = useAccount()
  const { smartWalletAddress } = useSmartWallet()
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [totalUsdValue, setTotalUsdValue] = useState(0)
  const [loading, setLoading] = useState(false)

  const refreshBalances = useCallback(async () => {
    if (!userAddress || !smartWalletAddress) return

    try {
      setLoading(true)
      
      // Get ETH balance
      const ethBalance = await smartWalletService.getBalance(smartWalletAddress, userAddress)
      const ethBalanceFormatted = formatEther(ethBalance)
      
      // TODO: Add token addresses for your deployment
      // Get USDC balance (example)
      // const usdcBalance = await smartWalletService.getTokenBalance(
      //   smartWalletAddress, 
      //   userAddress, 
      //   '0x...' // USDC token address
      // )

      // Mock prices for now - integrate with price API later
      const ethPrice = 2450.0
      
      const newBalances: TokenBalance[] = [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: parseFloat(ethBalanceFormatted).toFixed(4),
          usdValue: (parseFloat(ethBalanceFormatted) * ethPrice).toFixed(2),
          change: '+12.5%',
          changeType: 'positive',
          color: 'from-blue-500 to-blue-600'
        },
        // Add more tokens as needed
      ]
      
      setBalances(newBalances)
      setTotalUsdValue(newBalances.reduce((sum, token) => 
        sum + parseFloat(token.usdValue.replace(',', '')), 0
      ))
    } catch (err) {
      console.error('Failed to fetch balances:', err)
      toast.error('Failed to refresh balances')
    } finally {
      setLoading(false)
    }
  }, [userAddress, smartWalletAddress])

  useEffect(() => {
    refreshBalances()
  }, [refreshBalances])

  return {
    balances,
    totalUsdValue,
    loading,
    refreshBalances,
  }
}

// Hook for user identifiers
export function useUserIdentifiers() {
  const { address: userAddress } = useAccount()
  const { smartWalletAddress } = useSmartWallet()
  const [identifiers, setIdentifiers] = useState<UserIdentifier[]>([])
  const [loading, setLoading] = useState(false)

  const loadIdentifiers = useCallback(async () => {
    if (!userAddress || !smartWalletAddress) return

    try {
      setLoading(true)
      const identifierStrings = await smartWalletService.getIdentifiersByWallet(smartWalletAddress)
      
      // Transform to UserIdentifier format
      const userIdentifiers: UserIdentifier[] = identifierStrings.map((identifier, index) => ({
        id: `${index}`,
        identifier,
        type: identifier.startsWith('+') ? 'phone' : 'username',
        verified: true, // Assume verified since it's registered
        registeredAt: new Date(), // TODO: Get actual registration date from events
        isDefault: index === 0 // First one is default
      }))
      
      setIdentifiers(userIdentifiers)
    } catch (err) {
      console.error('Failed to load identifiers:', err)
    } finally {
      setLoading(false)
    }
  }, [userAddress, smartWalletAddress])

  useEffect(() => {
    loadIdentifiers()
  }, [loadIdentifiers])

  const registerIdentifier = useCallback(async (
    identifier: string, 
    type: 'phone' | 'username'
  ) => {
    if (!userAddress || !smartWalletAddress) throw new Error('Wallet not initialized')

    try {
      setLoading(true)
      const txHash = await smartWalletService.registerUser(
        identifier,
        type,
        smartWalletAddress,
        userAddress
      )
      
      await smartWalletService.waitForTransaction(txHash)
      await loadIdentifiers() // Refresh list
      
      toast.success('Identifier registered successfully!')
      return txHash
    } catch (err) {
      console.error('Failed to register identifier:', err)
      toast.error('Failed to register identifier')
      throw err
    } finally {
      setLoading(false)
    }
  }, [userAddress, smartWalletAddress, loadIdentifiers])

  const checkAvailability = useCallback(async (identifier: string) => {
    try {
      return await smartWalletService.isIdentifierAvailable(identifier)
    } catch (err) {
      console.error('Failed to check availability:', err)
      return false
    }
  }, [])

  return {
    identifiers,
    loading,
    registerIdentifier,
    checkAvailability,
    refreshIdentifiers: loadIdentifiers,
  }
}

// Hook for transactions
export function useTransactions() {
  const { address: userAddress } = useAccount()
  const { smartWalletAddress } = useSmartWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  const loadTransactions = useCallback(async () => {
    if (!userAddress || !smartWalletAddress) return

    try {
      setLoading(true)
      
      // Get sent and received payments
      const [sentPayments, receivedPayments] = await Promise.all([
        smartWalletService.getSentPayments(smartWalletAddress, userAddress),
        smartWalletService.getReceivedPayments(smartWalletAddress, userAddress)
      ])

      // Transform contract data to Transaction format
      const allTransactions: Transaction[] = [
        // Process sent payments
        ...(sentPayments as any[]).map((payment, index) => ({
          id: `sent-${index}`,
          type: 'sent' as const,
          amount: formatEther(payment.amount),
          token: payment.token === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'TOKEN',
          identifier: payment.identifier,
          identifierType: payment.identifier.startsWith('+') ? 'phone' as const : 'username' as const,
          timestamp: new Date(Number(payment.timestamp) * 1000),
          status: 'completed' as const,
          txHash: `0x${index.toString(16).padStart(64, '0')}`, // Mock hash
          message: ''
        })),
        // Process received payments
        ...(receivedPayments as any[]).map((payment, index) => ({
          id: `received-${index}`,
          type: 'received' as const,
          amount: formatEther(payment.amount),
          token: payment.token === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'TOKEN',
          identifier: payment.identifier,
          identifierType: payment.identifier.startsWith('+') ? 'phone' as const : 'username' as const,
          timestamp: new Date(Number(payment.timestamp) * 1000),
          status: 'completed' as const,
          txHash: `0x${index.toString(16).padStart(64, '0')}`, // Mock hash
          message: ''
        }))
      ]

      // Sort by timestamp
      allTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setTransactions(allTransactions)
    } catch (err) {
      console.error('Failed to load transactions:', err)
      toast.error('Failed to load transaction history')
    } finally {
      setLoading(false)
    }
  }, [userAddress, smartWalletAddress])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  return {
    transactions,
    loading,
    refreshTransactions: loadTransactions,
  }
}

// Hook for sending payments
export function useSendPayment() {
  const { address: userAddress } = useAccount()
  const { smartWalletAddress } = useSmartWallet()
  const [loading, setLoading] = useState(false)

  const sendPayment = useCallback(async (
    identifier: string,
    amount: string,
    token: 'ETH' | string = 'ETH'
  ) => {
    if (!userAddress || !smartWalletAddress) throw new Error('Wallet not initialized')

    try {
      setLoading(true)
      const amountWei = parseEther(amount)
      
      let txHash: Address
      
      if (token === 'ETH') {
        txHash = await smartWalletService.sendPayment(
          smartWalletAddress,
          identifier,
          amountWei,
          userAddress
        )
      } else {
        // TODO: Handle token payments
        throw new Error('Token payments not implemented yet')
      }

      await smartWalletService.waitForTransaction(txHash)
      toast.success('Payment sent successfully!')
      
      return txHash
    } catch (err) {
      console.error('Failed to send payment:', err)
      toast.error('Failed to send payment')
      throw err
    } finally {
      setLoading(false)
    }
  }, [userAddress, smartWalletAddress])

  return {
    sendPayment,
    loading,
  }
}