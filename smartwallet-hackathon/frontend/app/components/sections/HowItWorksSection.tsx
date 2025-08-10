'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Wallet,
  UserPlus,
  Send,
  CheckCircle,
  Smartphone,
  ArrowRight
} from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Connect Your Wallet',
    description: 'Connect your Web3 wallet to get started. We support all major wallets including MetaMask, WalletConnect, and more.',
    icon: Wallet,
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-500/10',
    details: [
      'One-click wallet connection',
      'Support for 50+ wallets',
      'Secure authentication',
      'No personal data stored'
    ]
  },
  {
    number: '02',
    title: 'Register Your Identifier',
    description: 'Link your phone number or create a username to your wallet address. This makes you discoverable by friends.',
    icon: UserPlus,
    color: 'from-secondary-500 to-secondary-600',
    bgColor: 'bg-secondary-500/10',
    details: [
      'Phone number verification',
      'Custom username creation',
      'Multiple identifiers per wallet',
      'Privacy-first approach'
    ]
  },
  {
    number: '03',
    title: 'Send & Receive',
    description: 'Start sending crypto using just phone numbers or usernames. No more copying and pasting wallet addresses.',
    icon: Send,
    color: 'from-accent-500 to-accent-600',
    bgColor: 'bg-accent-500/10',
    details: [
      'Instant transfers',
      'Multiple token support',
      'Batch payments',
      'Transaction history'
    ]
  },
  {
    number: '04',
    title: 'Enjoy Simplicity',
    description: 'Experience the easiest way to handle crypto payments. Share your username with friends and start receiving payments.',
    icon: CheckCircle,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    details: [
      'User-friendly interface',
      'Real-time notifications',
      'Payment requests',
      'Recurring payments'
    ]
  }
]

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-2 bg-secondary-500/10 border border-secondary-500/20 rounded-full text-secondary-300 text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Get started in
              </span>
              <br />
              <span className="bg-gradient-to-r from-secondary-400 to-accent-400 bg-clip-text text-transparent">
                4 simple steps
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Setting up your smart wallet is quick and easy. Follow these steps to start 
              sending crypto with phone numbers in minutes.
            </p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left side - Interactive step list */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = activeStep === index
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setActiveStep(index)}
                  className={`group relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'bg-dark-700/50 border-primary-500/30 shadow-lg shadow-primary-500/10' 
                      : 'bg-dark-800/30 border-dark-600/50 hover:border-primary-500/20'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Step number */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive ? step.bgColor : 'bg-dark-700'
                    }`}>
                      {isActive ? (
                        <Icon className={`w-6 h-6 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`} />
                      ) : (
                        <span className="text-sm font-bold text-gray-400">{step.number}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-300'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                        isActive ? 'text-gray-300' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
                      isActive 
                        ? 'text-primary-400 translate-x-1' 
                        : 'text-gray-600 group-hover:text-gray-400'
                    }`} />
                  </div>

                  {/* Active step details */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: isActive ? 'auto' : 0,
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {isActive && (
                      <div className="mt-4 pt-4 border-t border-dark-600/50">
                        <div className="grid grid-cols-2 gap-3">
                          {step.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-center space-x-2 text-sm text-gray-400">
                              <CheckCircle className="w-4 h-4 text-accent-400 flex-shrink-0" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          {/* Right side - Visual demonstration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-dark-800 to-dark-700 rounded-3xl p-8 border border-dark-600 shadow-2xl">
              {/* Phone mockup */}
              <div className="bg-dark-900 rounded-2xl p-6 shadow-inner">
                <div className="bg-gradient-to-b from-dark-800 to-dark-700 rounded-xl p-4 border border-dark-600">
                  {/* Step content based on active step */}
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <div className={`w-16 h-16 ${steps[activeStep].bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      {React.createElement(steps[activeStep].icon, { className: `w-8 h-8 bg-gradient-to-r ${steps[activeStep].color} bg-clip-text text-transparent` })}
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {steps[activeStep].title}
                    </h4>
                    <p className="text-sm text-gray-400 mb-6">
                      {steps[activeStep].description}
                    </p>

                    {/* Visual elements based on step */}
                    {activeStep === 0 && (
                      <div className="space-y-3">
                        <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
                          <Wallet className="w-5 h-5 text-primary-400 mx-auto mb-1" />
                          <p className="text-xs text-primary-300">Wallet Connected</p>
                        </div>
                      </div>
                    )}

                    {activeStep === 1 && (
                      <div className="space-y-3">
                        <div className="bg-secondary-500/10 border border-secondary-500/20 rounded-lg p-3">
                          <Smartphone className="w-5 h-5 text-secondary-400 mx-auto mb-1" />
                          <p className="text-xs text-secondary-300">+1 (555) 123-4567</p>
                        </div>
                        <div className="text-xs text-gray-500">or</div>
                        <div className="bg-secondary-500/10 border border-secondary-500/20 rounded-lg p-3">
                          <UserPlus className="w-5 h-5 text-secondary-400 mx-auto mb-1" />
                          <p className="text-xs text-secondary-300">@alice_crypto</p>
                        </div>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div className="space-y-3">
                        <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-3 text-left">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-400">To:</span>
                            <span className="text-xs text-accent-300">+1 (555) 987-6543</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Amount:</span>
                            <span className="text-sm font-semibold text-white">0.5 ETH</span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-2 bg-gradient-to-r from-accent-600 to-accent-500 text-white text-sm font-medium rounded-lg"
                        >
                          Send Payment
                        </motion.button>
                      </div>
                    )}

                    {activeStep === 3 && (
                      <div className="space-y-3">
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-white">Payment Sent!</p>
                          <p className="text-xs text-gray-400">Transaction confirmed</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-2 -left-2 w-4 h-4 bg-primary-500 rounded-full blur-sm"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-2 -right-2 w-3 h-3 bg-secondary-500 rounded-full blur-sm"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.8, 0.4, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.2 }}
                onClick={() => setActiveStep(index)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                  activeStep === index 
                    ? 'bg-primary-500' 
                    : 'bg-dark-600 hover:bg-dark-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}