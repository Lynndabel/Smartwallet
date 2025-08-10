'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff,
  Copy,
  ExternalLink
} from 'lucide-react'
import { formatEther } from 'viem'

interface WalletOverviewProps {
  className?: string
  onDeposit?: () => void
}

export function WalletOverview({ className = '', onDeposit }: WalletOverviewProps) {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  
  const [showBalance, setShowBalance] = useState(true)
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected || !address) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
      >
        <div className="text-center py-8">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wallet Connected</h3>
          <p className="text-gray-600">Connect your wallet to view your overview</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Wallet Overview</h2>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {showBalance ? (
            <Eye className="w-5 h-5 text-gray-600" />
          ) : (
            <EyeOff className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Wallet Address */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Wallet Address
        </label>
        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
          <span className="text-sm font-mono text-gray-900 flex-1">
            {formatAddress(address)}
          </span>
          <button
            onClick={copyAddress}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Copy address"
          >
            <Copy className="w-4 h-4 text-gray-600" />
          </button>
          <a
            href={`https://etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="View on Etherscan"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </a>
        </div>
        {copied && (
          <p className="text-xs text-green-600 mt-1">Address copied to clipboard!</p>
        )}
      </div>

      {/* Balance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Total Balance</span>
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {showBalance ? (
              balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ETH` : '0.0000 ETH'
            ) : (
              '••••••••'
            )}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {showBalance && balance ? (
              `$${(parseFloat(formatEther(balance.value)) * 2000).toFixed(2)} USD`
            ) : (
              showBalance ? '$0.00 USD' : '••••••••'
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">24h Change</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {showBalance ? '+2.34%' : '••••••••'}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {showBalance ? '+$45.67' : '••••••••'}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {showBalance ? '12' : '••'}
          </div>
          <div className="text-xs text-gray-600">Transactions</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {showBalance ? '3' : '••'}
          </div>
          <div className="text-xs text-gray-600">Active Policies</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {showBalance ? '98%' : '••'}
          </div>
          <div className="text-xs text-gray-600">Success Rate</div>
        </div>
      </div>
    </motion.div>
  )
}
