'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { 
  User, 
  Smartphone, 
  Plus, 
  Copy, 
  ExternalLink, 
  Edit3, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Shield,
  Settings,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useUserIdentifiers } from '@/hooks/useSmartWallet'

interface UserProfileProps {
  onRegister: () => void
}

export function UserProfile({ onRegister }: UserProfileProps) {
  const { address } = useAccount()
  const { identifiers, loading } = useUserIdentifiers()
  const [showAllIdentifiers, setShowAllIdentifiers] = useState(false)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const openExplorer = () => {
    if (address) {
      window.open(`https://explorer-holesky.morphl2.io/address/${address}`, '_blank')
    }
  }

  const removeIdentifier = (id: string) => {
    // TODO: Implement remove identifier functionality
    toast.success('Identifier removed successfully!')
  }

  const setDefaultIdentifier = (id: string) => {
    // TODO: Implement set default functionality
    toast.success('Default identifier updated!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-dark-800/50 backdrop-blur-xl border border-dark-600 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-secondary-500/20 to-accent-500/20 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-secondary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Profile</h3>
            <p className="text-sm text-gray-400">Manage your identifiers</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-400" />
        </motion.button>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-dark-700/50 to-dark-600/50 rounded-xl p-6 mb-6 border border-dark-600/50">
        {/* Avatar */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {address ? address.slice(2, 4).toUpperCase() : 'A'}
            </span>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">Smart Wallet User</h4>
            {identifiers.length > 0 && (
              <p className="text-gray-400">Identifiers linked: {identifiers.length}</p>
            )}
          </div>
        </div>

        {/* Wallet Address */}
        <div className="bg-dark-800/50 rounded-lg p-4 border border-dark-600/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Wallet Address</span>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => copyToClipboard(address || '', 'Address')}
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
          <code className="text-sm text-white font-mono">
            {address ? `${address.slice(0, 10)}...${address.slice(-10)}` : 'Not connected'}
          </code>
        </div>
      </div>

      {/* Identifiers Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Your Identifiers</h4>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRegister}
            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </motion.button>
        </div>

        {loading ? (
          <div className="text-center py-8 border-2 border-dashed border-dark-600 rounded-xl">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Loading identifiers…</p>
          </div>
        ) : identifiers.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-dark-600 rounded-xl">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h5 className="text-lg font-medium text-gray-400 mb-2">No identifiers yet</h5>
            <p className="text-gray-500 mb-4">
              Add a phone number or username to start receiving payments
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRegister}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-colors"
            >
              Add Identifier
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            {identifiers
              .slice(0, showAllIdentifiers ? identifiers.length : 2)
              .map((identifier, index) => (
                <motion.div
                  key={identifier.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group flex items-center justify-between p-4 bg-dark-700/30 hover:bg-dark-700/50 border border-dark-600/50 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      identifier.type === 'phone' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {identifier.type === 'phone' ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">
                          {identifier.identifier}
                        </span>
                        {identifier.verified && (
                          <CheckCircle className="w-4 h-4 text-accent-400" />
                        )}
                        {identifier.isDefault && (
                          <span className="px-2 py-1 bg-primary-500/20 text-primary-300 text-xs font-medium rounded-full border border-primary-500/30">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span className="capitalize">{identifier.type}</span>
                        <span>•</span>
                        <span>Added {identifier.registeredAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(identifier.identifier, 'Identifier')}
                      className="p-2 hover:bg-dark-600/50 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    </motion.button>
                    
                    {!identifier.isDefault && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDefaultIdentifier(identifier.id)}
                        className="p-2 hover:bg-dark-600/50 rounded-lg transition-colors"
                        title="Set as default"
                      >
                        <Shield className="w-4 h-4 text-gray-400 hover:text-accent-400" />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeIdentifier(identifier.id)}
                      className="p-2 hover:bg-dark-600/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}

            {identifiers.length > 2 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAllIdentifiers(!showAllIdentifiers)}
                className="w-full py-3 text-sm text-gray-400 hover:text-white border border-dashed border-dark-600 hover:border-dark-500 rounded-lg transition-all duration-200"
              >
                {showAllIdentifiers 
                  ? 'Show Less' 
                  : `Show ${identifiers.length - 2} More Identifiers`
                }
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Security Status */}
      <div className="bg-dark-700/30 rounded-lg p-4 border border-dark-600/50">
        <div className="flex items-center space-x-3 mb-3">
          <Shield className="w-5 h-5 text-accent-400" />
          <h5 className="font-semibold text-white">Security Status</h5>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Wallet Connected</span>
            <CheckCircle className="w-4 h-4 text-accent-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Phone Linked</span>
            {identifiers.some(i => i.type === 'phone') ? (
              <CheckCircle className="w-4 h-4 text-accent-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Email Verified</span>
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 py-2 bg-dark-600/50 hover:bg-dark-500/50 border border-dark-600 text-gray-300 text-sm font-medium rounded-lg transition-all duration-200"
        >
          Complete Verification
        </motion.button>
      </div>
    </motion.div>
  )
}