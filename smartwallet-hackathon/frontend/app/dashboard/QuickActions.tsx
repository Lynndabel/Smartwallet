'use client'

import { motion } from 'framer-motion'
import { 
  Send, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Users, 
  Clock, 
  CreditCard,
  Smartphone,
  Zap
} from 'lucide-react'

interface QuickActionsProps {
  onSend: () => void
  onDeposit: () => void
  onWithdraw: () => void
  onBatch?: () => void
  onSchedule?: () => void
  onRequest?: () => void
}

const actions = [
  {
    id: 'send',
    title: 'Send Payment',
    description: 'Send crypto using phone numbers',
    icon: Send,
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-500/10',
    borderColor: 'border-primary-500/20',
    hoverColor: 'hover:border-primary-400/40'
  },
  {
    id: 'deposit',
    title: 'Deposit Funds',
    description: 'Add money to your wallet',
    icon: ArrowDownToLine,
    color: 'from-accent-500 to-accent-600',
    bgColor: 'bg-accent-500/10',
    borderColor: 'border-accent-500/20',
    hoverColor: 'hover:border-accent-400/40'
  },
  {
    id: 'withdraw',
    title: 'Withdraw',
    description: 'Move funds to external wallet',
    icon: ArrowUpFromLine,
    color: 'from-secondary-500 to-secondary-600',
    bgColor: 'bg-secondary-500/10',
    borderColor: 'border-secondary-500/20',
    hoverColor: 'hover:border-secondary-400/40'
  },
  {
    id: 'batch',
    title: 'Batch Payment',
    description: 'Send to multiple recipients',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    hoverColor: 'hover:border-purple-400/40'
  },
  {
    id: 'schedule',
    title: 'Schedule Payment',
    description: 'Set up recurring transfers',
    icon: Clock,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    hoverColor: 'hover:border-orange-400/40'
  },
  {
    id: 'request',
    title: 'Request Payment',
    description: 'Ask someone to pay you',
    icon: CreditCard,
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    hoverColor: 'hover:border-teal-400/40'
  }
]

export function QuickActions({ onSend, onDeposit, onWithdraw, onBatch, onSchedule, onRequest }: QuickActionsProps) {

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'send':
        onSend()
        break
      case 'deposit':
        onDeposit()
        break
      case 'withdraw':
        onWithdraw()
        break
      case 'batch':
        onBatch && onBatch()
        break
      case 'schedule':
        onSchedule && onSchedule()
        break
      case 'request':
        onRequest && onRequest()
        break
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-dark-800/50 backdrop-blur-xl border border-dark-600 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
            <p className="text-sm text-gray-400">Fast access to common tasks</p>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleActionClick(action.id)}
              className={`group relative p-4 bg-dark-700/30 border rounded-xl transition-all duration-300 ${action.borderColor} ${action.hoverColor} hover:bg-dark-700/50`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`} />
              </div>

              {/* Content */}
              <div className="text-left">
                <h4 className="font-semibold text-white mb-1 group-hover:text-primary-300 transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {action.description}
                </p>
              </div>

              {/* Hover effect overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
            </motion.button>
          )
        })}
      </div>

      {/* Featured Action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 p-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-xl"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">Phone Number Payments</h4>
            <p className="text-sm text-gray-400">
              The easiest way to send crypto - just use a phone number or username!
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSend}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            Try Now
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-dark-700/20 rounded-lg">
          <p className="text-2xl font-bold text-primary-400">24</p>
          <p className="text-xs text-gray-400">Payments Sent</p>
        </div>
        <div className="text-center p-3 bg-dark-700/20 rounded-lg">
          <p className="text-2xl font-bold text-accent-400">12</p>
          <p className="text-xs text-gray-400">Payments Received</p>
        </div>
        <div className="text-center p-3 bg-dark-700/20 rounded-lg">
          <p className="text-2xl font-bold text-secondary-400">5</p>
          <p className="text-xs text-gray-400">Contacts</p>
        </div>
      </div>
    </motion.div>
  )
}