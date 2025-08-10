'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Smartphone, 
  Shield, 
  Zap, 
  Users, 
  Globe,
  Lock,
  Clock,
  Wallet,
  ArrowUpRight
} from 'lucide-react'

const features = [
  {
    icon: Smartphone,
    title: 'Phone Number Payments',
    description: 'Send crypto using just phone numbers or usernames. No need to remember complex wallet addresses.',
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-500/10',
    borderColor: 'border-primary-500/20',
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Your funds are protected by smart contracts and decentralized infrastructure. Full control, maximum security.',
    color: 'from-secondary-500 to-secondary-600',
    bgColor: 'bg-secondary-500/10',
    borderColor: 'border-secondary-500/20',
  },
  {
    icon: Zap,
    title: 'Instant Transfers',
    description: 'Lightning-fast transactions powered by Morph L2. Send money in seconds, not minutes.',
    color: 'from-accent-500 to-accent-600',
    bgColor: 'bg-accent-500/10',
    borderColor: 'border-accent-500/20',
  },
  {
    icon: Users,
    title: 'Social Payments',
    description: 'Build your payment network with friends and family. Easy onboarding with familiar identifiers.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Send money anywhere in the world instantly. No borders, no banks, no delays.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: Lock,
    title: 'Self-Custody',
    description: 'You own your keys, you own your crypto. Non-custodial solution with full user control.',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
]

const advancedFeatures = [
  {
    title: 'Batch Payments',
    description: 'Send money to multiple recipients in a single transaction',
    icon: Users,
  },
  {
    title: 'Payment Requests',
    description: 'Request payments from others with expiry dates',
    icon: Clock,
  },
  {
    title: 'Scheduled Payments',
    description: 'Set up recurring payments for subscriptions',
    icon: Clock,
  },
  {
    title: 'Multi-Token Support',
    description: 'Support for ETH and ERC-20 tokens',
    icon: Wallet,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Everything you need for
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                modern payments
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built for the future of finance. Our smart wallet combines the best of traditional banking 
              with the power of decentralized technology.
            </p>
          </motion.div>
        </div>

        {/* Main features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`group relative p-6 bg-dark-800/50 backdrop-blur-xl border ${feature.borderColor} rounded-2xl hover:border-opacity-40 transition-all duration-300`}
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.bgColor} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Arrow icon */}
                <ArrowUpRight className="absolute top-6 right-6 w-5 h-5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:text-primary-400 transition-all duration-300 transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
              </motion.div>
            )
          })}
        </div>

        {/* Advanced features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-dark-800/50 to-dark-700/50 backdrop-blur-xl border border-dark-600 rounded-3xl p-8 lg:p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Advanced Payment Features
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Take your payment experience to the next level with our advanced features 
              designed for power users and businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-6 bg-dark-800/30 rounded-xl border border-dark-600/50 hover:border-primary-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-gray-300 mb-6">
            Ready to experience the future of payments?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
          >
            Start Building Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}