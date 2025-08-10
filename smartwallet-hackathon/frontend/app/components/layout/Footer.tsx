'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Wallet, Github, X, MessageCircle, Heart } from 'lucide-react'

const footerLinks = {
  product: [
    { name: 'How it Works', href: '/how-it-works' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Features', href: '/#features' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/api' },
    { name: 'Smart Contracts', href: '/contracts' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
  social: [
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'X', href: '#', icon: X },
    { name: 'Discord', href: '#', icon: MessageCircle },
  ],
}

export function Footer() {
  return (
    <footer className="bg-dark-900/50 border-t border-dark-700/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group mb-4">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center group-hover:animate-pulse">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg opacity-20 blur-md"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                SmartWallet
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed mb-6">
              The future of payments is here. Send crypto using just phone numbers or usernames. 
              No complicated wallet addresses, no friction - just simple, secure transactions.
            </p>
            <div className="flex items-center space-x-4">
              {footerLinks.social.map((item) => {
                const Icon = item.icon
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-dark-800 hover:bg-dark-700 border border-dark-600 hover:border-primary-500/50 rounded-lg flex items-center justify-center transition-all duration-200 group"
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
                    <span className="sr-only">{item.name}</span>
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-dark-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© 2025 SmartWallet. All rights reserved.</span>
              <div className="hidden md:flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
                <span>for the Web3 community</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 px-3 py-1 bg-accent-500/10 border border-accent-500/20 rounded-full">
                <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
                <span className="text-accent-400 font-medium">Morph Testnet</span>
              </div>
              <span className="text-gray-500">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
    </footer>
  )
}