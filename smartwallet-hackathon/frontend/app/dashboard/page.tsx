'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WalletOverview } from './WalletOverview'
import { QuickActions } from './QuickActions'
import { TransactionHistory } from './TransactionHistory'
import { UserProfile } from './UserProfile'
import { DepositModal } from './Deposite'
import { SendPaymentModal } from './SendPaymentModal'
import { WithdrawModal } from './WithdrawModal'
import { RegisterIdentifierModal } from './RegisterIdentifierModal'

export default function DashboardPage() {
  const { isConnected } = useAccount()
  const router = useRouter()
  
  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  
  // Modal handlers
  const handleDeposit = () => setShowDepositModal(true)
  const handleSend = () => setShowSendModal(true)
  const handleWithdraw = () => setShowWithdrawModal(true)
  const handleRegister = () => setShowRegisterModal(true)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Please connect your wallet
          </h1>
          <p className="text-gray-300">
            You need to connect your wallet to access the dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">
            Manage your smart wallet and transactions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <WalletOverview onDeposit={handleDeposit} />
            <QuickActions 
              onSend={handleSend}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              onBatch={() => setShowBatchModal(true)}
              onSchedule={() => setShowScheduleModal(true)}
              onRequest={() => setShowRequestModal(true)}
            />
            <TransactionHistory />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            <UserProfile onRegister={handleRegister} />
          </div>
        </div>
        
        {/* Modals */}
        {showDepositModal && (
          <DepositModal onClose={() => setShowDepositModal(false)} />
        )}
        {showSendModal && (
          <SendPaymentModal 
           // isOpen={showSendModal}
            onClose={() => setShowSendModal(false)}
          />
        )}
        {showWithdrawModal && (
          <WithdrawModal 
          //  isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
          />
        )}
        {showBatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 text-white">
              <p>Batch Payment coming soon (wired to PaymentProcessor).</p>
              <button className="mt-4 px-4 py-2 bg-dark-600 rounded" onClick={() => setShowBatchModal(false)}>Close</button>
            </div>
          </div>
        )}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 text-white">
              <p>Schedule Payment coming soon (wired to PaymentProcessor).</p>
              <button className="mt-4 px-4 py-2 bg-dark-600 rounded" onClick={() => setShowScheduleModal(false)}>Close</button>
            </div>
          </div>
        )}
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 text-white">
              <p>Request Payment coming soon (wired to PaymentProcessor).</p>
              <button className="mt-4 px-4 py-2 bg-dark-600 rounded" onClick={() => setShowRequestModal(false)}>Close</button>
            </div>
          </div>
        )}
        {showRegisterModal && (
          <RegisterIdentifierModal 
        //    isOpen={showRegisterModal}
            onClose={() => setShowRegisterModal(false)}
          />
        )}
      </div>
    </div>
  )
}
