'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useSmartWallet } from '../hooks/useSmartWallet'
import { smartWalletService } from '@/lib/contracts/contracts'
import { parseEther } from 'viem'
import { 
  X, 
  ArrowDownToLine, 
  Copy, 
  ExternalLink, 
  QrCode,
  Smartphone,
  CreditCard,
  Banknote,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DepositModalProps {
  onClose: () => void
}

export function DepositModal({ onClose }: DepositModalProps) {
  const { address } = useAccount()
  const { smartWalletAddress } = useSmartWallet()
  const [depositMethod, setDepositMethod] = useState<'wallet' | 'fiat' | 'bridge'>('wallet')
  const [showQR, setShowQR] = useState(false)
  const [amount, setAmount] = useState('')

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Wallet address copied!')
    }
  }

  const openExplorer = () => {
    if (address) {
      window.open(`https://explorer-holesky.morphl2.io/address/${address}`, '_blank')
    }
  }

  const depositToSmartWallet = async () => {
    if (!smartWalletAddress || !address) return
    if (!amount || Number(amount) <= 0) return
    try {
      const txHash = await smartWalletService.deposit(
        smartWalletAddress,
        parseEther(amount),
        address
      )
      await smartWalletService.waitForTransaction(txHash as any)
      toast.success('Deposited to Smart Wallet!')
      onClose()
    } catch (e) {
      toast.error('Deposit failed')
      console.error(e)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                <ArrowDownToLine className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Deposit Funds</h2>
                <p className="text-sm text-gray-400">Add money to your smart wallet</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              aria-label="Close deposit modal"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Choose Deposit Method</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    key: 'wallet',
                    title: 'From Another Wallet',
                    description: 'Transfer from MetaMask, hardware wallet, etc.',
                    icon: Smartphone,
                    color: 'from-primary-500 to-primary-600',
                    bgColor: 'bg-primary-500/10',
                    borderColor: 'border-primary-500/20',
                  },
                  {
                    key: 'fiat',
                    title: 'Buy with Card',
                    description: 'Purchase crypto with credit/debit card',
                    icon: CreditCard,
                    color: 'from-secondary-500 to-secondary-600',
                    bgColor: 'bg-secondary-500/10',
                    borderColor: 'border-secondary-500/20',
                    comingSoon: true,
                  },
                  {
                    key: 'bridge',
                    title: 'Bridge from L1',
                    description: 'Bridge ETH from Ethereum mainnet',
                    icon: Banknote,
                    color: 'from-accent-500 to-accent-600',
                    bgColor: 'bg-accent-500/10',
                    borderColor: 'border-accent-500/20',
                    comingSoon: true,
                  }
                ].map((method) => {
                  const Icon = method.icon
                  const isSelected = depositMethod === method.key
                  
                  return (
                    <motion.button
                      key={method.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !method.comingSoon && setDepositMethod(method.key as any)}
                      disabled={method.comingSoon}
                      className={`relative p-4 border rounded-xl transition-all duration-200 text-left ${
                        isSelected
                          ? `${method.borderColor} ${method.bgColor}`
                          : 'border-dark-600 bg-dark-700/30 hover:border-dark-500'
                      } ${method.comingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${method.bgColor} rounded-xl flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 bg-gradient-to-r ${method.color} bg-clip-text text-transparent`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white flex items-center space-x-2">
                            <span>{method.title}</span>
                            {method.comingSoon && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-full">
                                Soon
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-400">{method.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Wallet Deposit Method */}
            {depositMethod === 'wallet' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Warning */}
                <div className="flex items-start space-x-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-300 mb-1">Important Notice</h4>
                    <p className="text-sm text-yellow-200/80">
                      Only send funds on Morph Testnet. Sending from other networks will result in permanent loss.
                    </p>
                  </div>
                </div>

                {/* Network Info */}
                <div className="bg-dark-700/30 rounded-xl p-4 border border-dark-600/50">
                  <h4 className="font-semibold text-white mb-3">Network Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network</span>
                      <span className="text-white">Morph Holesky Testnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Chain ID</span>
                      <span className="text-white">2810</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">RPC URL</span>
                      <span className="text-white text-xs">rpc-quicknode-holesky.morphl2.io</span>
                    </div>
                  </div>
                </div>

                {/* Wallet Address + Direct Deposit */}
                <div className="bg-dark-700/30 rounded-xl p-4 border border-dark-600/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Your Wallet Address</h4>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowQR(!showQR)}
                        className="p-2 bg-dark-600/50 hover:bg-dark-500/50 border border-dark-600 rounded-lg transition-colors"
                      aria-label="Show QR code"
                      title="Show QR code"
                    >
                        <QrCode className="w-4 h-4 text-gray-400" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyAddress}
                        className="p-2 bg-dark-600/50 hover:bg-dark-500/50 border border-dark-600 rounded-lg transition-colors"
                        aria-label="Copy wallet address"
                        title="Copy address"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openExplorer}
                        className="p-2 bg-dark-600/50 hover:bg-dark-500/50 border border-dark-600 rounded-lg transition-colors"
                        aria-label="Open in explorer"
                        title="Open in explorer"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="bg-dark-800/50 rounded-lg p-3 border border-dark-600/30">
                    <code className="text-sm text-white font-mono break-all">
                      {address || 'Not connected'}
                    </code>
                  </div>

                  {/* QR Code Placeholder */}
                  <AnimatePresence>
                    {showQR && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 text-center"
                      >
                        <div className="w-48 h-48 bg-white rounded-lg mx-auto flex items-center justify-center">
                          <span className="text-dark-900 font-medium">QR Code</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                          Scan this QR code with your wallet app
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Deposit to SmartWallet */}
                <div className="bg-dark-700/30 rounded-xl p-4 border border-dark-600/50">
                  <h4 className="font-semibold text-white mb-3">Deposit to Smart Wallet (internal balance)</h4>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="0"
                      step="0.0001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount in ETH"
                      className="flex-1 bg-dark-800/50 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white"
                    />
                    <button
                      onClick={depositToSmartWallet}
                      className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white text-sm font-medium rounded-lg transition-all duration-200"
                    >
                      Deposit
                    </button>
                  </div>
                  {smartWalletAddress ? (
                    <p className="text-xs text-gray-400 mt-2">Smart Wallet: {smartWalletAddress}</p>
                  ) : (
                    <p className="text-xs text-yellow-400 mt-2">Create your Smart Wallet first</p>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-dark-700/30 rounded-xl p-4 border border-dark-600/50">
                  <h4 className="font-semibold text-white mb-3">How to Deposit</h4>
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary-500/20 text-primary-300 rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span>Copy your wallet address above</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary-500/20 text-primary-300 rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span>Open your external wallet (MetaMask, etc.)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary-500/20 text-primary-300 rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <span>Make sure you're on Morph Testnet</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary-500/20 text-primary-300 rounded-full flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <span>Send ETH or tokens to this address</span>
                    </li>
                  </ol>
                </div>

                {/* Supported Tokens */}
                <div className="bg-dark-700/30 rounded-xl p-4 border border-dark-600/50">
                  <h4 className="font-semibold text-white mb-3">Supported Tokens</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
                      { symbol: 'USDC', name: 'USD Coin', icon: '💎' },
                      { symbol: 'USDT', name: 'Tether', icon: '💵' }
                    ].map((token) => (
                      <div key={token.symbol} className="text-center p-3 bg-dark-800/30 rounded-lg">
                        <div className="text-2xl mb-1">{token.icon}</div>
                        <div className="text-sm font-medium text-white">{token.symbol}</div>
                        <div className="text-xs text-gray-400">{token.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Coming Soon Methods */}
            {(depositMethod === 'fiat' || depositMethod === 'bridge') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Coming Soon!</h3>
                <p className="text-gray-400 mb-6">
                  {depositMethod === 'fiat' 
                    ? 'Credit card purchases will be available soon. Stay tuned!'
                    : 'L1 to L2 bridging will be available soon. Stay tuned!'
                  }
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Got it
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}