'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  X,
  ArrowUpFromLine,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react'

interface WithdrawModalProps {
  onClose: () => void
}

const withdrawSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a valid positive number'
  ),
  token: z.string().min(1, 'Token is required'),
  recipient: z.string().min(1, 'Recipient address is required').refine(
    (val) => val.startsWith('0x') && val.length === 42,
    'Invalid Ethereum address'
  )
})

type WithdrawForm = z.infer<typeof withdrawSchema>

const tokens = [
  { symbol: 'ETH', name: 'Ethereum', balance: '2.45', icon: '⟠' },
  { symbol: 'USDC', name: 'USD Coin', balance: '1,250.00', icon: '💎' },
  { symbol: 'USDT', name: 'Tether USD', balance: '500.00', icon: '💵' }
]

export function WithdrawModal({ onClose }: WithdrawModalProps) {
  const [step, setStep] = useState<'form' | 'confirm' | 'processing' | 'success'>('form')
  const [selectedToken, setSelectedToken] = useState(tokens[0])
  const [estimatedGas, setEstimatedGas] = useState('0.0021')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
    mode: 'onChange',
    defaultValues: {
      token: 'ETH'
    }
  })

  const watchedValues = watch()

  const onSubmit = async (data: WithdrawForm) => {
    setStep('confirm')
  }

  const confirmWithdraw = async () => {
    setStep('processing')
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000))
      setStep('success')
      toast.success('Withdrawal completed successfully!')
    } catch (error) {
      toast.error('Failed to process withdrawal')
      setStep('form')
    }
  }

  const setMaxAmount = () => {
    setValue('amount', selectedToken.balance.replace(',', ''))
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
          className="relative w-full max-w-md bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                <ArrowUpFromLine className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Withdraw Funds</h2>
                <p className="text-sm text-gray-400">Move funds to external wallet</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'form' && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Warning */}
                <div className="flex items-start space-x-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-300 mb-1">Double Check Everything</h4>
                    <p className="text-sm text-orange-200/80">
                      Make sure the recipient address is correct. Transactions cannot be reversed.
                    </p>
                  </div>
                </div>

                {/* Token Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Select Token
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {tokens.map((token) => (
                      <button
                        key={token.symbol}
                        type="button"
                        onClick={() => {
                          setSelectedToken(token)
                          setValue('token', token.symbol)
                        }}
                        className={`p-3 border rounded-lg transition-all duration-200 ${
                          selectedToken.symbol === token.symbol
                            ? 'border-secondary-500 bg-secondary-500/10'
                            : 'border-dark-600 bg-dark-700/30 hover:border-dark-500'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">{token.icon}</div>
                          <div className="text-sm font-medium text-white">{token.symbol}</div>
                          <div className="text-xs text-gray-400">{token.balance}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      {...register('amount')}
                      type="number"
                      step="any"
                      placeholder="0.00"
                      className="w-full pl-12 pr-20 py-3 bg-dark-700/50 border border-dark-600 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 rounded-lg text-white placeholder-gray-400 transition-all duration-200"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={setMaxAmount}
                        className="px-2 py-1 bg-secondary-600 hover:bg-secondary-500 text-white text-xs font-medium rounded transition-colors"
                      >
                        MAX
                      </button>
                      <span className="text-sm font-medium text-gray-400">{selectedToken.symbol}</span>
                    </div>
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>
                  )}
                  
                  <div className="mt-2 flex justify-between text-sm text-gray-400">
                    <span>Available: {selectedToken.balance} {selectedToken.symbol}</span>
                    <span>≈ $2,450.00</span>
                  </div>
                </div>

                {/* Recipient Address */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Recipient Address
                  </label>
                  <input
                    {...register('recipient')}
                    type="text"
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 rounded-lg text-white placeholder-gray-400 transition-all duration-200 font-mono text-sm"
                  />
                  {errors.recipient && (
                    <p className="mt-1 text-sm text-red-400">{errors.recipient.message}</p>
                  )}
                </div>

                {/* Gas estimate */}
                <div className="p-3 bg-dark-700/30 rounded-lg border border-dark-600/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Estimated Gas Fee</span>
                    <span className="text-white font-medium">{estimatedGas} ETH</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-400">Network</span>
                    <span className="text-white">Morph Testnet</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isValid}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-secondary-600 to-secondary-600 hover:from-secondary-500 hover:to-secondary-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  <span>Review Withdrawal</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowUpFromLine className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Confirm Withdrawal</h3>
                  <p className="text-gray-400">Please verify all details before proceeding</p>
                </div>

                {/* Withdrawal details */}
                <div className="space-y-4">
                  <div className="p-4 bg-dark-700/30 rounded-lg border border-dark-600/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Amount</span>
                      <span className="text-lg font-bold text-white">
                        {watchedValues.amount} {selectedToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">To Address</span>
                      <span className="text-sm text-white font-mono">
                        {watchedValues.recipient?.slice(0, 8)}...{watchedValues.recipient?.slice(-8)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-dark-700/30 rounded-lg border border-dark-600/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Gas Fee</span>
                      <span className="text-sm text-white">{estimatedGas} ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Network</span>
                      <span className="text-sm text-white">Morph Testnet</span>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-semibold text-orange-300">Final Warning</span>
                    </div>
                    <p className="text-sm text-orange-200/80">
                      This transaction cannot be reversed. Make sure the recipient address is correct.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 py-3 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={confirmWithdraw}
                    className="flex-1 py-3 bg-gradient-to-r from-secondary-600 to-secondary-600 hover:from-secondary-500 hover:to-secondary-500 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Confirm & Send
                  </button>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Zap className="w-8 h-8 text-white animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Processing Withdrawal...</h3>
                <p className="text-gray-400 mb-4">Please wait while we process your transaction</p>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-secondary-500 to-secondary-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3 }}
                  />
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Withdrawal Successful!</h3>
                <p className="text-gray-400 mb-6">
                  Your withdrawal of {watchedValues.amount} {selectedToken.symbol} has been processed successfully.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => window.open('https://explorer-holesky.morphl2.io', '_blank')}
                    className="w-full py-3 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 hover:border-primary-500/50 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>View on Explorer</span>
                    <ArrowUpFromLine className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-secondary-600 to-secondary-600 hover:from-secondary-500 hover:to-secondary-500 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}