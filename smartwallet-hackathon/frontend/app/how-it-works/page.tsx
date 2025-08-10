'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { 
  ArrowRight, 
  Wallet, 
  UserPlus, 
  Send, 
  CheckCircle,
  Smartphone,
  Shield,
  Zap,
  Globe,
  Lock,
  Users,
  CreditCard,
  ArrowDown,
  PlayCircle,
  Code,
  Book,
  MessageCircle
} from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Connect Your Wallet',
    description: 'Start by connecting your Web3 wallet (MetaMask, WalletConnect, etc.) to our secure platform.',
    icon: Wallet,
    details: [
      'Supports 50+ popular wallets',
      'Secure authentication process',
      'No personal data stored',
      'One-click connection'
    ],
    color: 'from-primary-500 to-primary-600'
  },
  {
    number: '02',
    title: 'Create Smart Wallet',
    description: 'Deploy your personal smart contract wallet that will handle all your crypto payments.',
    icon: UserPlus,
    details: [
      'Gas-optimized smart contracts',
      'Full self-custody control',
      'Cross-chain compatibility',
      'Upgradeable architecture'
    ],
    color: 'from-secondary-500 to-secondary-600'
  },
  {
    number: '03',
    title: 'Register Your Identity',
    description: 'Link your phone number or create a username to make yourself discoverable to friends.',
    icon: Smartphone,
    details: [
      'Phone number verification',
      'Custom username creation',
      'Multiple identifiers per wallet',
      'Privacy-first approach'
    ],
    color: 'from-accent-500 to-accent-600'
  },
  {
    number: '04',
    title: 'Send & Receive',
    description: 'Start sending crypto using just phone numbers or usernames. No more complex addresses!',
    icon: Send,
    details: [
      'Instant peer-to-peer transfers',
      'Multi-token support',
      'Batch payment capabilities',
      'Transaction history tracking'
    ],
    color: 'from-purple-500 to-pink-500'
  }
]

const features = [
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Your funds are protected by audited smart contracts and decentralized infrastructure.',
    color: 'text-blue-400'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Powered by Morph L2 for instant, low-cost transactions that settle in seconds.',
    color: 'text-yellow-400'
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Send money anywhere in the world instantly. No borders, no banks, no delays.',
    color: 'text-green-400'
  },
  {
    icon: Lock,
    title: 'Self-Custody',
    description: 'You own your keys, you own your crypto. Non-custodial solution with full control.',
    color: 'text-red-400'
  },
  {
    icon: Users,
    title: 'Social Payments',
    description: 'Build your payment network with friends and family using familiar identifiers.',
    color: 'text-purple-400'
  },
  {
    icon: CreditCard,
    title: 'Advanced Features',
    description: 'Batch payments, scheduled transfers, payment requests, and more coming soon.',
    color: 'text-pink-400'
  }
]

const faqs = [
  {
    question: 'How does phone number payment work?',
    answer: 'When you register your phone number, it gets linked to your wallet address in our smart contract. When someone sends money to your phone number, our system automatically routes it to your wallet.'
  },
  {
    question: 'Is my phone number stored on the blockchain?',
    answer: 'Yes, but it\'s hashed for privacy. The actual phone number is not directly visible on-chain, providing an extra layer of privacy protection.'
  },
  {
    question: 'What tokens can I send?',
    answer: 'Currently, we support ETH and major ERC-20 tokens like USDC and USDT. We\'re constantly adding support for more tokens based on community demand.'
  },
  {
    question: 'Are there any fees?',
    answer: 'There are small network gas fees for transactions (typically $0.01-$0.10 on Morph L2). We don\'t charge any additional platform fees for basic transfers.'
  },
  {
    question: 'Can I use multiple phone numbers?',
    answer: 'Yes! You can register up to 5 different identifiers (phone numbers or usernames) per wallet, giving you maximum flexibility.'
  },
  {
    question: 'What if I lose access to my wallet?',
    answer: 'Since this is a self-custody solution, you\'re responsible for your private keys. We recommend using a hardware wallet and backing up your seed phrase securely.'
  }
]

export default function HowItWorks() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
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
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-2 bg-secondary-500/10 border border-secondary-500/20 rounded-full text-secondary-300 text-sm font-medium mb-4">
                How It Works
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Send Crypto Like
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Sending a Text
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Learn how SmartWallet revolutionizes crypto payments with phone number transactions. 
                No more copying wallet addresses or worrying about typos.
              </p>
            </motion.div>
          </div>

          {/* Demo Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative max-w-4xl mx-auto mb-20"
          >
            <div className="relative bg-gradient-to-r from-dark-800 to-dark-700 rounded-3xl p-2 shadow-2xl">
              <div className="bg-dark-900 rounded-2xl aspect-video flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                >
                  <PlayCircle className="w-6 h-6" />
                  <span>Watch Demo Video</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Step by Step Guide */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Get Started in
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  4 Simple Steps
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Setting up your smart wallet takes less than 5 minutes. Follow our step-by-step guide 
                to start sending crypto with phone numbers.
              </p>
            </motion.div>
          </div>

          {/* Steps */}
          <div className="space-y-20">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 0
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
                >
                  {/* Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-6xl font-bold text-dark-600">{step.number}</div>
                    </div>
                    
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-accent-400 flex-shrink-0" />
                          <span className="text-gray-300">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-3xl p-8 border border-dark-600 shadow-2xl">
                        <div className="bg-dark-900 rounded-2xl p-6">
                          <div className={`w-16 h-16 bg-gradient-to-r ${step.color} bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                            <Icon className={`w-8 h-8 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`} />
                          </div>
                          <h4 className="text-lg font-semibold text-white text-center mb-2">
                            Step {step.number}
                          </h4>
                          <p className="text-center text-gray-400 text-sm">
                            {step.title}
                          </p>
                        </div>
                      </div>

                      {/* Floating elements */}
                      <motion.div
                        className="absolute -top-4 -right-4 w-8 h-8 bg-primary-500/20 rounded-full"
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute -bottom-4 -left-4 w-6 h-6 bg-secondary-500/20 rounded-full"
                        animate={{ y: [10, -10, 10] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Arrow down */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center mt-16"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-primary-400"
            >
              <ArrowDown className="w-8 h-8" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Why Choose
                </span>
                <br />
                <span className="bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
                  SmartWallet?
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Built with cutting-edge technology to provide the best user experience 
                while maintaining the highest security standards.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className="group p-8 bg-dark-800/50 backdrop-blur-xl border border-dark-600 rounded-2xl hover:border-primary-500/30 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                    <h3 className="text-xl font-bold text-white group-hover:text-primary-300 transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Frequently Asked
                </span>
                <br />
                <span className="bg-gradient-to-r from-secondary-400 to-accent-400 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <p className="text-xl text-gray-300">
                Everything you need to know about SmartWallet and phone number payments.
              </p>
            </motion.div>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-dark-800/50 backdrop-blur-xl border border-dark-600 rounded-2xl p-8 hover:border-primary-500/30 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  {faq.question}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Get Started?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of users who are already experiencing the future of crypto payments. 
              Start sending money with just phone numbers today.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href={isConnected ? "/dashboard" : "/"}
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
              </Link>

              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Book className="w-4 h-4" />
                  <span>Documentation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4" />
                  <span>Open Source</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Community</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}