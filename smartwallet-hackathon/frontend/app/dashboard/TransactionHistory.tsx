'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  Filter,
  Search,
  Calendar,
  Download,
  ChevronDown,
  Smartphone,
  User,
  Clock,
  Loader2
} from 'lucide-react'
import { useTransactions } from '@/hooks/useSmartWallet'

type TxStatus = 'completed' | 'pending' | 'failed'

export function TransactionHistory() {
  const { transactions, loading } = useTransactions()
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = filterType === 'all' || tx.type === filterType
    const matchesSearch = tx.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.message?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getStatusColor = (status: TxStatus) => {
    switch (status) {
      case 'completed': return 'text-accent-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: TxStatus) => {
    switch (status) {
      case 'completed': return 'bg-accent-500/10 border-accent-500/20'
      case 'pending': return 'bg-yellow-500/10 border-yellow-500/20'
      case 'failed': return 'bg-red-500/10 border-red-500/20'
      default: return 'bg-gray-500/10 border-gray-500/20'
    }
  }

  const openTransaction = (txHash: string) => {
    window.open(`https://explorer-holesky.morphl2.io/tx/${txHash}`, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-dark-800/50 backdrop-blur-xl border border-dark-600 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center">
            <History className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Transaction History</h3>
            <p className="text-sm text-gray-400">{filteredTransactions.length} transactions</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={false}
        animate={{
          height: showFilters ? 'auto' : 0,
          opacity: showFilters ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {showFilters && (
          <div className="mb-6 p-4 bg-dark-700/30 rounded-xl border border-dark-600/50 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-lg text-white placeholder-gray-400 transition-all duration-200"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'sent', label: 'Sent' },
                { key: 'received', label: 'Received' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    filterType === filter.key
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'bg-dark-700/50 text-gray-400 border border-dark-600 hover:bg-dark-600/50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Transaction List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Loading transactions…</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">No transactions found</h4>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Your transactions will appear here'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => openTransaction(transaction.txHash)}
              className="group flex items-center justify-between p-4 bg-dark-700/20 hover:bg-dark-700/40 border border-dark-600/30 hover:border-dark-500/50 rounded-xl cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  transaction.type === 'received' 
                    ? 'bg-accent-500/20 text-accent-400' 
                    : 'bg-primary-500/20 text-primary-400'
                }`}>
                  {transaction.type === 'received' ? (
                    <ArrowDownLeft className="w-6 h-6" />
                  ) : (
                    <ArrowUpRight className="w-6 h-6" />
                  )}
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-white capitalize">
                      {transaction.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBg(transaction.status)} ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    {transaction.identifierType === 'phone' ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span>{transaction.identifier}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(transaction.timestamp)}</span>
                  </div>

                  {transaction.message && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      "{transaction.message}"
                    </p>
                  )}
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="text-right">
                <div className={`font-semibold mb-1 ${
                  transaction.type === 'received' ? 'text-accent-400' : 'text-white'
                }`}>
                  {transaction.type === 'received' ? '+' : '-'}{transaction.amount} {transaction.token}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  {transaction.gasUsed && (
                    <>
                      <span>Gas: {transaction.gasUsed} ETH</span>
                      <span>•</span>
                    </>
                  )}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <button className="px-6 py-3 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 hover:border-primary-500/50 text-gray-300 hover:text-white font-medium rounded-lg transition-all duration-200">
            Load More Transactions
          </button>
        </motion.div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-dark-600/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-dark-700/20 rounded-lg">
            <p className="text-sm text-gray-400">Total Sent</p>
            <p className="text-lg font-semibold text-primary-400">
              {transactions
                .filter(tx => tx.type === 'sent' && tx.status === 'completed')
                .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                .toFixed(2)} ETH
            </p>
          </div>
          
          <div className="p-3 bg-dark-700/20 rounded-lg">
            <p className="text-sm text-gray-400">Total Received</p>
            <p className="text-lg font-semibold text-accent-400">
              {transactions
                .filter(tx => tx.type === 'received' && tx.status === 'completed')
                .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                .toFixed(2)} ETH
            </p>
          </div>
          
          <div className="p-3 bg-dark-700/20 rounded-lg">
            <p className="text-sm text-gray-400">Gas Spent</p>
            <p className="text-lg font-semibold text-gray-300">
              {transactions
                .filter(tx => tx.gasUsed && tx.status === 'completed')
                .reduce((sum, tx) => sum + parseFloat(tx.gasUsed || '0'), 0)
                .toFixed(4)} ETH
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}