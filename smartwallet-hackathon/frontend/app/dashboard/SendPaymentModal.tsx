'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  X,
  Send,
  User,
  Smartphone,
  DollarSign,
  Check,
  AlertCircle,
  ArrowRight,
  Zap
} from 'lucide-react'
import { useSendPayment } from '@/hooks/useSmartWallet'

interface SendPaymentModalProps {
  onClose: () => void
}

const sendPaymentSchema = z.object({
  recipient: z.string().min(1, 'Recipient is required'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a valid positive number'
  ),
  token: z.string().min(1, 'Token is required'),
  message: z.string().optional()
})

type SendPaymentForm = z.infer<typeof sendPaymentSchema>

const tokens = [
  { symbol: 'ETH', name: 'Ethereum', balance: '2.45', icon: '⟠' },
  { symbol: 'USDC', name: 'USD Coin', balance: '1,250.00', icon: '💎' },
  { symbol: 'USDT', name: 'Tether USD', balance: '500.00', icon: '💵' }
]

const recentRecipients = [
  { identifier: '+1234567890', type: 'phone', name: 'Alice Johnson' },
  { identifier: 'bob_crypto', type: 'username', name: 'Bob Smith' },
  { identifier: '+0987654321', type: 'phone', name: 'Charlie Brown' },
  { identifier: 'diana_eth', type: 'username', name: 'Diana Prince' }
]

export function SendPaymentModal({ onClose }: SendPaymentModalProps) {
  const [step, setStep] = useState<'form' | 'confirm' | 'sending' | 'success'>('form')
  const [recipientType, setRecipientType] = useState<'phone' | 'username'>('phone')
  const [selectedToken, setSelectedToken] = useState(tokens[0])
  const [estimatedGas, setEstimatedGas] = useState('0.0023')
  const { sendPayment, loading: sending } = useSendPayment()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<SendPaymentForm>({
    resolver: zodResolver(sendPaymentSchema),
    mode: 'onChange',
    defaultValues: {
      token: 'ETH'
    }
  })

  const watchedValues = watch()

  // Update estimated gas when form changes
  useEffect(() => {
    if (watchedValues.amount && watchedValues.recipient) {
      // Simulate gas estimation
      const baseGas = 0.002
      const extraGas = parseFloat(watchedValues.amount) * 0.0001
      setEstimatedGas((baseGas + extraGas).toFixed(4))
    }
  }, [watchedValues.amount, watchedValues.recipient])

  const detectRecipientType = (value: string) => {
    if (value.startsWith('+') || /^\d+$/.test(value)) {
      setRecipientType('phone')
    } else {
      setRecipientType('username')
    }
  }

  const onSubmit = async (data: SendPaymentForm) => {
    setStep('confirm')
  }

  const confirmSend = async () => {
    setStep('sending')
    try {
      await sendPayment(watchedValues.recipient, watchedValues.amount, selectedToken.symbol)
      setStep('success')
    } catch (error) {
      toast.error('Failed to send payment')
      setStep('form')
    }
  }

  const handleRecipientSelect = (recipient: typeof recentRecipients[0]) => {
    setValue('recipient', recipient.identifier)
    setRecipientType(recipient.type as 'phone' | 'username')
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
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Send Payment</h2>
                <p className="text-sm text-gray-400">Send crypto using phone or username</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              aria-label="Close"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {step === 'form' && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Send to
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      {recipientType === 'phone' ? (
                        <Smartphone className="w-5 h-5 text-gray-400" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <input
                      {...register('recipient')}
                      type="text"
                      placeholder={recipientType === 'phone' ? '+1234567890' : '@username'}
                      onChange={(e) => {
                        detectRecipientType(e.target.value)
                        register('recipient').onChange(e)
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-dark-700/50 border border-dark-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-lg text-white placeholder-gray-400 transition-all duration-200"
                    />
                  </div>
                  {errors.recipient && (
                    <p className="mt-1 text-sm text-red-400">{errors.recipient.message}</p>
                  )}

                  {/* Recent Recipients */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">Recent</p>
                    <div className="flex flex-wrap gap-2">
                      {recentRecipients.map((recipient, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleRecipientSelect(recipient)}
                          className="flex items-center space-x-2 px-3 py-1 bg-dark-700/30 hover:bg-dark-600/50 border border-dark-600/50 rounded-full text-xs transition-colors"
                        >
                          {recipient.type === 'phone' ? (
                            <Smartphone className="w-3 h-3 text-gray-400" />
                          ) : (
                            <User className="w-3 h-3 text-gray-400" />
                          )}
                          <span className="text-gray-300">{recipient.identifier}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Token Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Token
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
                            ? 'border-primary-500 bg-primary-500/10'
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
                      className="w-full pl-12 pr-20 py-3 bg-dark-700/50 border border-dark-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-lg text-white placeholder-gray-400 transition-all duration-200"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm font-medium text-gray-400">{selectedToken.symbol}</span>
                    </div>
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>
                  )}

                  {/* Quick amounts */}
                  <div className="mt-2 flex space-x-2">
                    {['0.1', '0.5', '1.0'].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setValue('amount', amount)}
                        className="px-3 py-1 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 rounded-full text-xs text-gray-300 transition-colors"
                      >
                        {amount} {selectedToken.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    {...register('message')}
                    rows={2}
                    placeholder="What's this payment for?"
                    className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-lg text-white placeholder-gray-400 resize-none transition-all duration-200"
                  />
                </div>

                {/* Gas estimate */}
                <div className="p-3 bg-dark-700/30 rounded-lg border border-dark-600/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Estimated Gas Fee</span>
                    <span className="text-white font-medium">{estimatedGas} ETH</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isValid}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  <span>Review Payment</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Confirm Payment</h3>
                  <p className="text-gray-400">Review the details before sending</p>
                </div>

                {/* Payment details */}
                <div className="space-y-4">
                  <div className="p-4 bg-dark-700/30 rounded-lg border border-dark-600/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">To</span>
                      <div className="flex items-center space-x-2">
                        {recipientType === 'phone' ? (
                          <Smartphone className="w-4 h-4 text-gray-400" />
                        ) : (
                          <User className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-white">{watchedValues.recipient}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Amount</span>
                      <span className="text-lg font-bold text-white">
                        {watchedValues.amount} {selectedToken.symbol}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-dark-700/30 rounded-lg border border-dark-600/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Gas Fee</span>
                      <span className="text-sm text-white">{estimatedGas} ETH</span>
                    </div>
                  </div>

                  {watchedValues.message && (
                    <div className="p-4 bg-dark-700/30 rounded-lg border border-dark-600/50">
                      <p className="text-sm text-gray-400 mb-1">Message</p>
                      <p className="text-sm text-white">{watchedValues.message}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 py-3 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={confirmSend}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Send Payment
                  </button>
                </div>
              </div>
            )}

            {step === 'sending' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Zap className="w-8 h-8 text-white animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sending Payment...</h3>
                <p className="text-gray-400 mb-4">Please wait while we process your transaction</p>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
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
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Payment Sent!</h3>
                <p className="text-gray-400 mb-6">
                  Your payment of {watchedValues.amount} {selectedToken.symbol} has been sent to {watchedValues.recipient}
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}