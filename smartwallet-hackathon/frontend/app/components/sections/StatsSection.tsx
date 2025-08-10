'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import { Users, Zap, Globe, DollarSign } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: 10000,
    suffix: '+',
    label: 'Active Users',
    description: 'Growing community of crypto users',
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-500/10',
  },
  {
    icon: Zap,
    value: 50000,
    suffix: '+',
    label: 'Transactions',
    description: 'Completed successfully',
    color: 'from-secondary-500 to-secondary-600',
    bgColor: 'bg-secondary-500/10',
  },
  {
    icon: Globe,
    value: 25,
    suffix: '+',
    label: 'Countries',
    description: 'Worldwide reach',
    color: 'from-accent-500 to-accent-600',
    bgColor: 'bg-accent-500/10',
  },
  {
    icon: DollarSign,
    value: 5,
    suffix: 'M+',
    label: 'Volume',
    description: 'Total value transferred',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
  },
]

export function StatsSection() {
  const [inView, setInView] = useState(false)

  return (
    <section className="py-16 lg:py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-800/50 to-dark-700/50" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onViewportEnter={() => setInView(true)}
                whileHover={{ y: -5 }}
                className="text-center group"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                </div>

                {/* Value */}
                <div className="mb-2">
                  <motion.span
                    className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                  >
                    {inView && (
                      <CountUp
                        end={stat.value}
                        duration={2}
                        delay={index * 0.2}
                      />
                    )}
                    {stat.suffix}
                  </motion.span>
                </div>

                {/* Label */}
                <h3 className="text-lg font-semibold text-white mb-1">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400">
                  {stat.description}
                </p>

                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  whileHover={{ scale: 1.05 }}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Bottom text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 max-w-2xl mx-auto">
            Trusted by thousands of users worldwide. Join the revolution and experience 
            the future of payments with SmartWallet.
          </p>
        </motion.div>
      </div>
    </section>
  )
}