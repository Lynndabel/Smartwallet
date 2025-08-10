'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSendPayment } from '@/hooks/useSmartWallet'
import { motion } from 'framer-motion'
import { Smartphone, User, ArrowRight, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PayPage() {
  const params = useSearchParams()
  const prefillId = params.get('id') || params.get('identifier') || ''
  const [identifier, setIdentifier] = useState(prefillId)
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState<'ETH' | 'USDC' | 'USDT'>('ETH')
  const [type, setType] = useState<'phone' | 'username'>(identifier.startsWith('+') ? 'phone' : 'username')
  const { sendPayment, loading } = useSendPayment()

  useEffect(() => {
    setType(identifier.startsWith('+') ? 'phone' : 'username')
  }, [identifier])

  const onPay = async () => {
    if (!identifier || !amount) return toast.error('Enter identifier and amount')
    try {
      await sendPayment(identifier, amount, token)
      toast.success('Payment sent!')
    } catch (e) {
      toast.error('Payment failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-800 border border-dark-600 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-1">Pay by Identifier</h1>
        <p className="text-gray-400 mb-6">Send crypto using a phone number or username</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Identifier</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {type === 'phone' ? <Smartphone className="w-5 h-5 text-gray-400" /> : <User className="w-5 h-5 text-gray-400" />}
              </div>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={type === 'phone' ? '+15551234567' : '@username'}
                className="w-full pl-12 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2" htmlFor="token-select">Token</label>
            <select
              id="token-select"
              value={token}
              onChange={(e) => setToken(e.target.value as any)}
              className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-lg text-white"
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          <button
            onClick={onPay}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-lg transition-all"
          >
            <span>{loading ? 'Sending...' : 'Send Payment'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}


