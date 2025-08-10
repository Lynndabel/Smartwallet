'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { 
  Smartphone, 
  Shield, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Wallet,
  Globe,
  Lock,
  Clock,
  Star
} from 'lucide-react'
import { HeroSection } from './components/sections/HeroSection'
import { FeaturesSection } from './components/sections/FeaturesSection'
import { HowItWorksSection } from './components/sections/HowItWorksSection'
import { StatsSection } from './components/sections/StatsSection'
import { CTASection } from './components/sections/CTASection'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="relative">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}