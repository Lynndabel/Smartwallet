'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ArrowRight, Smartphone, Zap, Shield } from 'lucide-react'

export function HeroSection() {
  const { isConnected } = useAccount()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-500/5 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-full text-sm font-medium text-primary-300 mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>Powered by Morph Testnet</span>
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-white via-primary-200 to-secondary-200 bg-clip-text text-transparent">
              Send Crypto with
            </span>
            <br />
            <motion.span
              className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              Phone Numbers
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            The future of payments is here. Send and receive crypto using just phone numbers or usernames. 
            <br />
            <span className="text-primary-400 font-medium">No wallet addresses. No complexity. Just simple transfers.</span>
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center items-center gap-6 mb-12"
          >
            {[
              { icon: Smartphone, text: 'Phone Number Payments' },
              { icon: Shield, text: 'Secure & Decentralized' },
              { icon: Zap, text: 'Instant Transfers' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-gray-300">
                <feature.icon className="w-5 h-5 text-primary-400" />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              href={isConnected ? "/dashboard" : "/how-it-works"}
              className="group relative"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary-500/25 transition-all duration-200 flex items-center space-x-2"
              >
                <span>{isConnected ? "Open Dashboard" : "Get Started"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl opacity-20 blur-xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </Link>

            <Link href="/how-it-works">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-dark-800/50 hover:bg-dark-700/50 border border-dark-600 hover:border-primary-500/50 text-white font-semibold rounded-xl backdrop-blur-xl transition-all duration-200"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>

          {/* Demo video or mockup placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="relative bg-gradient-to-r from-dark-800 to-dark-700 rounded-2xl p-1 shadow-2xl">
              <div className="bg-dark-900 rounded-xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Step 1 */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="text-center p-6 bg-dark-800/50 rounded-xl border border-dark-600"
                  >
                    <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Enter Phone Number</h3>
                    <p className="text-sm text-gray-400">Just type +1234567890</p>
                  </motion.div>

                  {/* Arrow */}
                  <div className="hidden md:flex justify-center">
                    <ArrowRight className="w-6 h-6 text-primary-400" />
                  </div>

                  {/* Step 2 */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="text-center p-6 bg-dark-800/50 rounded-xl border border-dark-600"
                  >
                    <div className="w-12 h-12 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-secondary-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Send Instantly</h3>
                    <p className="text-sm text-gray-400">Money sent in seconds</p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -left-4 w-8 h-8 bg-primary-500 rounded-full opacity-60 blur-sm"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-4 -right-4 w-6 h-6 bg-secondary-500 rounded-full opacity-60 blur-sm"
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/2 -right-8 w-4 h-4 bg-accent-500 rounded-full opacity-40 blur-sm"
              animate={{ x: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none" />
    </section>
  )
}