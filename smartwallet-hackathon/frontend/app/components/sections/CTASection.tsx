'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ArrowRight, Rocket, Star, Zap } from 'lucide-react'

export function CTASection() {
  const { isConnected } = useAccount()

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary-500/10 via-secondary-500/5 to-transparent"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Floating icons */}
          <div className="relative mb-8">
            <motion.div
              className="absolute -top-8 -left-8 w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center"
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Star className="w-4 h-4 text-primary-400" />
            </motion.div>
            <motion.div
              className="absolute -top-4 -right-12 w-6 h-6 bg-secondary-500/20 rounded-full flex items-center justify-center"
              animate={{
                y: [10, -10, 10],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Zap className="w-3 h-3 text-secondary-400" />
            </motion.div>
            <motion.div
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-accent-500/20 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Rocket className="w-5 h-5 text-accent-400" />
            </motion.div>
          </div>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to revolutionize
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                your payments?
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Join thousands of users who are already experiencing the future of crypto payments. 
              Start sending money with just phone numbers today.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Link
              href={isConnected ? "/dashboard" : "/how-it-works"}
              className="group relative"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 flex items-center space-x-3"
              >
                <span>{isConnected ? "Open Dashboard" : "Get Started Now"}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl opacity-30 blur-xl -z-10"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </Link>

            <Link href="/how-it-works">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-dark-800/50 hover:bg-dark-700/50 border border-dark-600 hover:border-primary-500/50 text-white text-lg font-semibold rounded-2xl backdrop-blur-xl transition-all duration-300"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
              <span>Decentralized & Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse" />
              <span>Community Driven</span>
            </div>
          </motion.div>

          
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-24 text-dark-900"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,120 C150,60 350,0 600,30 C850,60 1050,120 1200,90 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  )
}