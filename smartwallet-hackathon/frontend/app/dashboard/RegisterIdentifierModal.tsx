'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  X,
  UserPlus,
  Smartphone,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Shield,
  Loader2,
  Copy
} from 'lucide-react'
import { useUserIdentifiers, useSmartWallet } from '@/hooks/useSmartWallet'
import { isValidPhoneNumber, normalizePhoneE164 } from '@/lib/utils'
import { phoneVerificationService } from '@/api/phone-service'

interface RegisterIdentifierModalProps {
  onClose: () => void
  onSuccess?: () => void
}

const identifierSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  type: z.enum(['phone', 'username'], {
    required_error: 'Please select an identifier type'
  })
}).refine((data) => {
  if (data.type === 'phone') {
    return isValidPhoneNumber(
      normalizePhoneE164(data.identifier) || data.identifier.trim()
    )
  } else {
    const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/
    return usernameRegex.test(data.identifier)
  }
}, {
  message: 'Invalid format for selected identifier type',
  path: ['identifier']
})

type IdentifierForm = z.infer<typeof identifierSchema>

export function RegisterIdentifierModal({ onClose, onSuccess }: RegisterIdentifierModalProps) {
  const [step, setStep] = useState<'form' | 'verify' | 'processing' | 'success'>('form')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [mockCode, setMockCode] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)

  const { registerIdentifier, checkAvailability } = useUserIdentifiers()
  const { hasWallet, createWallet } = useSmartWallet()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<IdentifierForm>({
    resolver: zodResolver(identifierSchema),
    mode: 'onChange'
  })

  const watchedValues = watch()
  const identifierType = watch('type')
  const identifier = watch('identifier')

  // Check availability when identifier changes
  useEffect(() => {
    const checkIdentifierAvailability = async () => {
      if (!identifier || identifier.length < 3 || !identifierType) {
        setIsAvailable(null)
        return
      }

      // Validate format first
      const isValidFormat = identifierType === 'phone' 
        ? /^(\+?\d{1,4}[-.\s]?)?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(identifier)
        : /^[a-zA-Z0-9._]{3,20}$/.test(identifier)

      if (!isValidFormat) {
        setIsAvailable(null)
        return
      }

      setIsChecking(true)
      try {
        let candidate = identifier
        if (identifierType === 'phone') {
          const normalized = normalizePhoneE164(identifier)
          if (!normalized) {
            setIsAvailable(null)
            return
          }
          candidate = normalized
        }
        const available = await checkAvailability(candidate)
        setIsAvailable(available)
      } catch (error) {
        console.error('Failed to check availability:', error)
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }

    const debounceTimer = setTimeout(checkIdentifierAvailability, 500)
    return () => clearTimeout(debounceTimer)
  }, [identifier, identifierType, checkAvailability])

  const onSubmit = async (data: IdentifierForm) => {
    if (data.type === 'phone') {
      try {
        const normalized = normalizePhoneE164(data.identifier.trim())
        if (!normalized) {
          toast.error('Enter phone in E.164 format, e.g. +15551234567')
          return
        }
        const res = await phoneVerificationService.sendVerificationCode(normalized)
        if (!res.success) {
          toast.error(res.error || 'Failed to send verification code')
          return
        }
        setVerificationId(res.verificationId || '')
        if (res.mockCode) {
          setMockCode(res.mockCode)
        }
        if (res.mockCode) {
          toast.success(`Mock code: ${res.mockCode}`)
        }
        setStep('verify')
        toast.success('Verification code sent!')
      } catch (error) {
        toast.error('Failed to send verification code')
        console.error(error)
      }
    } else {
      // For usernames, go directly to processing
      await processRegistration(data)
    }
  }

  const verifyPhone = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    try {
      const normalized = normalizePhoneE164(watchedValues.identifier.trim())
      if (!normalized) {
        toast.error('Enter phone in E.164 format, e.g. +15551234567')
        return
      }
      const res = await phoneVerificationService.verifyCode(normalized, verificationCode.trim())
      if (!res.success || !res.isValid) {
        toast.error(res.error || 'Invalid verification code')
        return
      }
      setIsPhoneVerified(true)
      setMockCode(null)
      await processRegistration(watchedValues)
    } catch (error) {
      toast.error('Invalid verification code')
      console.error(error)
    }
  }

  const processRegistration = async (data: IdentifierForm) => {
    setStep('processing')
    
    try {
      let valueToRegister = data.identifier.trim()
      let typeToRegister = data.type
      if (data.type === 'phone') {
        const normalized = normalizePhoneE164(valueToRegister)
        if (!normalized) {
          toast.error('Enter phone in E.164 format, e.g. +15551234567')
          setStep('verify')
          return
        }
        valueToRegister = normalized
      }
      if (!hasWallet) {
        // Create smart wallet and register identifier in one tx
        await createWallet(valueToRegister, typeToRegister)
      } else {
        // Register identifier to existing wallet
        await registerIdentifier(valueToRegister, typeToRegister)
      }
      setStep('success')
      onSuccess?.()
    } catch (error) {
      console.error('Failed to register identifier:', error)
      toast.error('Failed to register identifier')
      setStep(data.type === 'phone' ? 'verify' : 'form')
    }
  }

  const resendCode = async () => {
    try {
      const normalized = normalizePhoneE164(watchedValues.identifier.trim())
      if (!normalized) {
        toast.error('Enter phone in E.164 format, e.g. +15551234567')
        return
      }
      const res = await phoneVerificationService.resendVerificationCode(normalized)
      if (!res.success) {
        toast.error(res.error || 'Failed to resend code')
        return
      }
      setVerificationId(res.verificationId || '')
      if (res.mockCode) {
        setMockCode(res.mockCode)
      }
      if (res.mockCode) {
        toast.success(`Mock code: ${res.mockCode}`)
      }
      toast.success('Verification code sent!')
    } catch (error) {
      toast.error('Failed to resend code')
      console.error(error)
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
              <div className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add Identifier</h2>
                <p className="text-sm text-gray-400">Register phone or username</p>
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
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Choose Identifier Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: 'phone',
                        title: 'Phone Number',
                        description: 'Link your phone number',
                        icon: Smartphone,
                        color: 'from-blue-500 to-blue-600',
                        bgColor: 'bg-blue-500/10',
                        borderColor: 'border-blue-500/20'
                      },
                      {
                        value: 'username',
                        title: 'Username',
                        description: 'Create a custom handle',
                        icon: User,
                        color: 'from-purple-500 to-purple-600',
                        bgColor: 'bg-purple-500/10',
                        borderColor: 'border-purple-500/20'
                      }
                    ].map((type) => {
                      const Icon = type.icon
                      const isSelected = identifierType === type.value
                      
                      return (
                        <motion.button
                          key={type.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setValue('type', type.value as 'phone' | 'username')}
                          className={`p-4 border rounded-xl transition-all duration-200 ${
                            isSelected
                              ? `${type.borderColor} ${type.bgColor}`
                              : 'border-dark-600 bg-dark-700/30 hover:border-dark-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`w-12 h-12 ${type.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                              <Icon className={`w-6 h-6 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`} />
                            </div>
                            <h4 className="font-semibold text-white mb-1">{type.title}</h4>
                            <p className="text-xs text-gray-400">{type.description}</p>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                  {errors.type && (
                    <p className="mt-2 text-sm text-red-400">{errors.type.message}</p>
                  )}
                </div>

                {/* Identifier Input */}
                {identifierType && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-white mb-2">
                      {identifierType === 'phone' ? 'Phone Number' : 'Username'}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {identifierType === 'phone' ? (
                          <Smartphone className="w-5 h-5 text-gray-400" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <input
                        {...register('identifier')}
                        type="text"
                        placeholder={
                          identifierType === 'phone' 
                            ? '+1234567890' 
                            : 'your_username'
                        }
                        className="w-full pl-12 pr-12 py-3 bg-dark-700/50 border border-dark-600 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 rounded-lg text-white placeholder-gray-400 transition-all duration-200"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isChecking ? (
                          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        ) : isAvailable === true ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : isAvailable === false ? (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        ) : null}
                      </div>
                    </div>
                    
                    {errors.identifier && (
                      <p className="mt-1 text-sm text-red-400">{errors.identifier.message}</p>
                    )}
                    
                    {isAvailable === true && (
                      <p className="mt-1 text-sm text-green-400 flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Available!</span>
                      </p>
                    )}
                    
                    {isAvailable === false && (
                      <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>Already taken</span>
                      </p>
                    )}

                    {/* Format hints */}
                    <div className="mt-2 text-xs text-gray-400">
                      {identifierType === 'phone' ? (
                        'Include country code (e.g., +1234567890)'
                      ) : (
                        '3-20 characters, letters, numbers, underscore, or dot'
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Info Card */}
                {identifierType && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50"
                  >
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          {identifierType === 'phone' ? 'Phone Verification' : 'Username Registration'}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {identifierType === 'phone' 
                            ? 'We\'ll send you a verification code to confirm your phone number.'
                            : 'Your username will be registered on the blockchain immediately.'
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isValid || isAvailable === false || isChecking}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-secondary-600 to-accent-600 hover:from-secondary-500 hover:to-accent-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  <span>
                    {identifierType === 'phone' ? 'Send Verification Code' : 'Register Username'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {step === 'verify' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Verify Your Phone</h3>
                  <p className="text-gray-400">
                    We sent a 6-digit code to <br />
                    <span className="font-medium text-white">{watchedValues.identifier}</span>
                  </p>
                </div>

                {mockCode && (
                  <div className="p-3 bg-dark-700/50 border border-dark-600 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Mock code (for testing):</p>
                      <p className="text-lg font-mono text-white tracking-widest">{mockCode}</p>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(mockCode); toast.success('Code copied') }}
                      className="px-3 py-2 bg-dark-600 hover:bg-dark-500 border border-dark-500 rounded-md text-white flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                )}

                {/* Verification Code Input */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-white text-center text-2xl font-mono tracking-widest transition-all duration-200"
                    maxLength={6}
                  />
                  <p className="mt-2 text-xs text-gray-400 text-center">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>

                {/* Resend */}
                <div className="text-center">
                  <button
                    onClick={resendCode}
                    className="text-sm text-secondary-400 hover:text-secondary-300 transition-colors"
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 py-3 bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={verifyPhone}
                    disabled={verificationCode.length !== 6}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    Verify
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Zap className="w-8 h-8 text-white animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Registering on Blockchain...
                </h3>
                <p className="text-gray-400 mb-4">Please wait while we register your identifier</p>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-secondary-500 to-accent-500 h-2 rounded-full"
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
                <h3 className="text-xl font-bold text-white mb-2">
                  {watchedValues.type === 'phone' ? 'Phone Verified!' : 'Username Registered!'}
                </h3>
                <p className="text-gray-400 mb-6">
                  Your {watchedValues.type === 'phone' ? 'phone number' : 'username'} <br />
                  <span className="font-medium text-white">{watchedValues.identifier}</span> <br />
                  has been successfully registered on the blockchain.
                </p>

                <div className="bg-dark-700/30 rounded-xl p-4 border border-dark-600/50 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-white">You can now receive payments!</h4>
                      <p className="text-sm text-gray-400">
                        Share your {watchedValues.type} with friends to receive crypto
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-secondary-600 to-accent-600 hover:from-secondary-500 hover:to-accent-500 text-white font-semibold rounded-lg transition-all duration-200"
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