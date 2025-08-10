'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAccount, useChainId, useBalance } from 'wagmi'
import { 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  Wallet,
  Plus,
  RefreshCw,
  AlertCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useSmartWallet, useWalletBalances } from '@/hooks/useSmartWallet'
import { getExplorerUrl, MORPH_TESTNET_CONFIG } from '@/lib/contracts/address'

interface WalletOverviewProps {
  onDeposit: () => void
}

export function WalletOverview({ onDeposit }: WalletOverviewProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  const { smartWalletAddress, hasWallet, loading: walletLoading, createWallet } = useSmartWallet()
  const { balances, totalUsdValue, loading: balancesLoading, refreshBalances } = useWalletBalances()
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [creatingWallet, setCreatingWallet] = useState(false)
  const [debugInfo, setDebugInfo] = useState(false)

  // Check if on correct network
  const isCorrectNetwork = chainId === MORPH_TESTNET_CONFIG.id
  const hasEnoughGas = balance && parseFloat(balance.formatted) > 0.001 // Need at least 0.001 ETH for gas

  const copyAddress = () => {
    if (smartWalletAddress) {
      navigator.clipboard.writeText(smartWalletAddress)
      toast.success('Smart wallet address copied!')
    } else if (address) {
      navigator.clipboard.writeText(address)
      toast.success('EOA address copied!')
    }
  }

  const openExplorer = () => {
    const addressToOpen = smartWalletAddress || address
    if (addressToOpen) {
      window.open(getExplorerUrl(addressToOpen, 'address'), '_blank')
    }
  }

  const handleCreateWallet = async () => {
    console.log('🚀 Starting wallet creation...')
    console.log('📍 User Address:', address)
    console.log('🌐 Chain ID:', chainId)
    console.log('💰 Balance:', balance?.formatted, balance?.symbol)
    console.log('✅ Correct Network:', isCorrectNetwork)
    console.log('⛽ Has Gas:', hasEnoughGas)

    // Pre-flight checks
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isCorrectNetwork) {
      toast.error(`Please switch to Morph Testnet (Chain ID: ${MORPH_TESTNET_CONFIG.id})`)
      return
    }

    if (!hasEnoughGas) {
      toast.error('Insufficient ETH for gas fees. Need at least 0.001 ETH')
      return
    }

    try {
      setCreatingWallet(true)
      console.log('📞 Calling createWallet...')
      
      const result = await createWallet()
      console.log('✅ Wallet creation result:', result)
      
      toast.success('Smart wallet created successfully!')
    } catch (error: any) {
      console.error('❌ Wallet creation failed:', error)
      console.error('Error message:', error?.message)
      console.error('Error cause:', error?.cause)
      console.error('Error stack:', error?.stack)
      
      // More specific error messages
      if (error?.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user')
      } else if (error?.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas')
      } else if (error?.message?.includes('network')) {
        toast.error('Network error - check your connection')
      } else if (error?.message?.includes('revert')) {
        toast.error('Contract reverted - check contract state')
      } else {
        toast.error(`Failed to create wallet: ${error?.message || 'Unknown error'}`)
      }
    } finally {
      setCreatingWallet(false)
    }
  }

  // Show network warning if wrong network
  if (!isCorrectNetwork) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-dark-800/60 to-dark-700/60 backdrop-blur-xl border border-dark-600 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Wrong Network</h2>
          <p className="text-gray-400 mb-6">
            Please switch to Morph Testnet to continue
          </p>
          
          <div className="bg-dark-700/30 rounded-xl p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Network:</span>
                <span className="text-red-400">Chain ID {chainId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Required Network:</span>
                <span className="text-green-400">Morph Testnet ({MORPH_TESTNET_CONFIG.id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RPC URL:</span>
                <code className="text-blue-400 text-xs">
                  {MORPH_TESTNET_CONFIG.rpcUrls.default.http[0]}
                </code>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              // Try to switch network programmatically
              if (window.ethereum) {
                window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: `0x${MORPH_TESTNET_CONFIG.id.toString(16)}` }],
                }).catch((error: any) => {
                  console.error('Failed to switch network:', error)
                  toast.error('Please manually switch to Morph Testnet in your wallet')
                })
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-lg transition-all duration-200"
          >
            Switch to Morph Testnet
          </button>
        </div>
      </motion.div>
    )
  }

  // Show loading state
  if (walletLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-dark-800/60 to-dark-700/60 backdrop-blur-xl border border-dark-600 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          <span className="ml-3 text-white">Loading wallet...</span>
        </div>
      </motion.div>
    )
  }

  // Show create wallet if user doesn't have one
  if (!hasWallet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-dark-800/60 to-dark-700/60 backdrop-blur-xl border border-dark-600 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Create Your Smart Wallet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Get started by creating your smart wallet to send and receive payments using phone numbers and usernames.
          </p>

          {/* Pre-flight check warnings */}
          {!hasEnoughGas && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <div className="flex items-center space-x-2 text-orange-300">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Low Balance Warning</span>
              </div>
              <p className="text-sm text-orange-200/80 mt-1">
                You have {balance?.formatted || '0'} ETH. You may need more for gas fees.
              </p>
            </div>
          )}

          {/* Debug Info Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setDebugInfo(!debugInfo)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {debugInfo ? 'Hide' : 'Show'} Debug Info
            </button>
          </div>

          {/* Debug Information */}
          {debugInfo && (
            <div className="mb-6 p-4 bg-dark-700/30 rounded-xl border border-dark-600/50 text-left">
              <h4 className="font-semibold text-white mb-3">Debug Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Wallet Address:</span>
                  <code className="text-green-400 text-xs">{address || 'Not connected'}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chain ID:</span>
                  <span className="text-blue-400">{chainId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Balance:</span>
                  <span className="text-purple-400">{balance?.formatted || '0'} {balance?.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Has Smart Wallet:</span>
                  <span className={hasWallet ? 'text-green-400' : 'text-red-400'}>
                    {hasWallet ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network Check:</span>
                  <span className={isCorrectNetwork ? 'text-green-400' : 'text-red-400'}>
                    {isCorrectNetwork ? 'Correct' : 'Wrong'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateWallet}
            disabled={creatingWallet || !hasEnoughGas}
            className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed mx-auto"
          >
            {creatingWallet ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Wallet...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Create Smart Wallet</span>
              </>
            )}
          </motion.button>

          {/* Connected EOA Info */}
          {address && (
            <div className="mt-8 p-4 bg-dark-700/30 rounded-xl border border-dark-600/50">
              <p className="text-sm text-gray-400 mb-2">Connected Account</p>
              <div className="flex items-center justify-center space-x-2">
                <code className="text-sm text-gray-300 font-mono">
                  {`${address.slice(0, 8)}...${address.slice(-8)}`}
                </code>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-dark-600/50 rounded"
                >
                  <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-dark-800/60 to-dark-700/60 backdrop-blur-xl border border-dark-600 rounded-3xl p-8 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Smart Wallet</h2>
            <p className="text-gray-400">Phone & Username Payments</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshBalances}
            disabled={balancesLoading}
            className="p-2 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${balancesLoading ? 'animate-spin' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="p-2 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 rounded-lg transition-colors"
          >
            {balanceVisible ? 
              <Eye className="w-4 h-4 text-gray-400" /> : 
              <EyeOff className="w-4 h-4 text-gray-400" />
            }
          </motion.button>
        </div>
      </div>

      {/* Smart Wallet Address */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-2">Smart Wallet Address</p>
        <div className="flex items-center space-x-2 p-3 bg-dark-700/30 rounded-lg border border-dark-600/50">
          <code className="text-sm text-gray-300 font-mono flex-1">
            {smartWalletAddress ? 
              `${smartWalletAddress.slice(0, 8)}...${smartWalletAddress.slice(-8)}` : 
              'Loading...'
            }
          </code>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyAddress}
            className="p-1 hover:bg-dark-600/50 rounded"
          >
            <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openExplorer}
            className="p-1 hover:bg-dark-600/50 rounded"
          >
            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
          </motion.button>
        </div>
      </div>

      {/* Total Balance */}
      <div className="mb-8 text-center">
        <p className="text-sm text-gray-400 mb-2">Total Balance</p>
        <div className="flex items-center justify-center space-x-2">
          {balanceVisible ? (
            <h3 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              ${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
          ) : (
            <h3 className="text-4xl font-bold text-gray-500">••••••</h3>
          )}
          {balancesLoading ? (
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          ) : (
            <TrendingUp className="w-6 h-6 text-accent-400" />
          )}
        </div>
      </div>

      {/* Token Balances */}
      <div className="space-y-4 mb-8">
        {balancesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            <span className="ml-3 text-gray-400">Loading balances...</span>
          </div>
        ) : balances.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-dark-600 rounded-xl">
            <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No tokens found</p>
            <p className="text-sm text-gray-500">Deposit some funds to get started</p>
          </div>
        ) : (
          balances.map((token, index) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-dark-700/20 rounded-xl border border-dark-600/30 hover:border-dark-500/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${token.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{token.symbol[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-white">{token.name}</p>
                  <p className="text-sm text-gray-400">{token.symbol}</p>
                </div>
              </div>

              <div className="text-right">
                {balanceVisible ? (
                  <>
                    <p className="font-semibold text-white">
                      {token.balance} {token.symbol}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-400">${token.usdValue}</p>
                      <span className={`text-sm ${
                        token.changeType === 'positive' ? 'text-accent-400' : 'text-red-400'
                      }`}>
                        {token.change}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-500">••••••</p>
                    <p className="text-sm text-gray-500">••••••</p>
                  </>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDeposit}
          className="flex-1 flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Deposit</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-4 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 hover:border-primary-500/50 text-white font-semibold rounded-xl transition-all duration-200"
        >
          History
        </motion.button>
      </div>
    </motion.div>
  )
}