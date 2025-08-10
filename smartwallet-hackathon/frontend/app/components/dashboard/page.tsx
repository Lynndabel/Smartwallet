'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  Send, 
  Plus, 
  History, 
  User,
  Settings,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  ExternalLink
} from 'lucide-react'
import { WalletOverview } from './WalletOverview'
import { QuickActions } from '../../dashboard/QuickActions'
import { TransactionHistory } from '../../dashboard/TransactionHistory'
import { UserProfile } from '../../dashboard/UserProfile'
import { SendPaymentModal } from '../../dashboard/SendPaymentModal'
import { DepositModal } from '../../dashboard/Deposite'
import { WithdrawModal } from '../../dashboard/WithdrawModal'
import { RegisterIdentifierModal } from '../../dashboard/RegisterIdentifierModal'

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const [activeModal, setActiveModal] = useState<string | null>(null)

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      window.location.href = '/'
    }
  }, [isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Please connect your wallet
          </h2>
          <p className="text-gray-400">
            You need to connect a wallet to access the dashboard
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-gray-400">
                Manage your smart wallet and send payments with ease
              </p>
            </div>
            
            {/* Quick stats */}
            <div className="mt-6 lg:mt-0 flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-400">$2,450</p>
                <p className="text-sm text-gray-400">Total Balance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent-400">24</p>
                <p className="text-sm text-gray-400">Transactions</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Wallet Overview */}
            <WalletOverview onDeposit={() => setActiveModal('deposit')} />
            
            {/* Quick Actions */}
            <QuickActions 
              onSend={() => setActiveModal('send')}
              onDeposit={() => setActiveModal('deposit')}
              onWithdraw={() => setActiveModal('withdraw')}
            />

            {/* Transaction History */}
            <TransactionHistory />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* User Profile */}
            <UserProfile onRegister={() => setActiveModal('register')} />

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-dark-800/50 backdrop-blur-xl border border-dark-600 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <History className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {[
                  {
                    type: 'received',
                    amount: '0.5 ETH',
                    from: '+1234567890',
                    time: '2 min ago',
                    icon: ArrowDownLeft,
                    color: 'text-accent-400'
                  },
                  {
                    type: 'sent',
                    amount: '0.2 ETH',
                    to: 'alice_crypto',
                    time: '1 hour ago',
                    icon: ArrowUpRight,
                    color: 'text-primary-400'
                  },
                  {
                    type: 'received',
                    amount: '1.0 ETH',
                    from: '+0987654321',
                    time: '3 hours ago',
                    icon: ArrowDownLeft,
                    color: 'text-accent-400'
                  }
                ].map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-dark-700/30 rounded-lg">
                      <div className={`w-8 h-8 ${activity.color === 'text-accent-400' ? 'bg-accent-500/20' : 'bg-primary-500/20'} rounded-full flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {activity.type === 'received' ? 'Received' : 'Sent'} {activity.amount}
                        </p>
                        <p className="text-xs text-gray-400">
                          {activity.type === 'received' ? `From ${activity.from}` : `To ${activity.to}`}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Network Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-dark-800/50 backdrop-blur-xl border border-dark-600 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Network Status</h3>
                <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Network</span>
                  <span className="text-sm text-white">Morph Testnet</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Gas Price</span>
                  <span className="text-sm text-white">15 gwei</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Block Height</span>
                  <span className="text-sm text-white">1,234,567</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'send' && (
        <SendPaymentModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'deposit' && (
        <DepositModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'withdraw' && (
        <WithdrawModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'register' && (
        <RegisterIdentifierModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  )
}