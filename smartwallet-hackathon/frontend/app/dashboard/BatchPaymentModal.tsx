'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users } from 'lucide-react'
import { useAccount } from 'wagmi'
import { smartWalletService } from '@/lib/contracts/contracts'
import { parseEther, Address, formatEther, isAddress } from 'viem'
import { smartWalletService as _service } from '@/lib/contracts/contracts'
import toast from 'react-hot-toast'

interface BatchPaymentModalProps {
  onClose: () => void
}

interface RecipientRow {
  id: string
  identifier: string
  amount: string
}

export function BatchPaymentModal({ onClose }: BatchPaymentModalProps) {
  const { address: account } = useAccount()
  const [rows, setRows] = useState<RecipientRow[]>([
    { id: '1', identifier: '', amount: '' },
  ])
  const [token, setToken] = useState<'ETH' | 'ERC20'>('ETH')
  const [customToken, setCustomToken] = useState<'' | Address>('')
  const [loading, setLoading] = useState(false)
  const [showCsvInput, setShowCsvInput] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [batchFeeWei, setBatchFeeWei] = useState<bigint | null>(null)
  const [tokenDecimals, setTokenDecimals] = useState<number>(18)
  const [knownTokens] = useState<{ label: string; address: Address; decimals: number }[]>([])

  // Load batch fee on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const fee = await smartWalletService.getBatchPaymentFee()
        if (mounted) setBatchFeeWei(fee)
      } catch (e) {
        console.error('Failed to fetch batch fee', e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Load ERC20 decimals when custom token changes
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (token === 'ERC20' && customToken && isAddress(customToken)) {
        try {
          // read decimals from chain via ERC20 ABI
          const dec = await _service.tokenDecimals(customToken)
          if (mounted) setTokenDecimals(Number(dec))
        } catch (e) {
          console.error('Failed to read token decimals, defaulting to 18', e)
          if (mounted) setTokenDecimals(18)
        }
      } else {
        if (mounted) setTokenDecimals(18)
      }
    })()
    return () => {
      mounted = false
    }
  }, [token, customToken])

  const addRow = () => {
    setRows((r) => [...r, { id: String(r.length + 1), identifier: '', amount: '' }])
  }

  const removeRow = (id: string) => {
    setRows((r) => r.filter((x) => x.id !== id))
  }

  const updateRow = (id: string, key: keyof RecipientRow, value: string) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [key]: value } : x)))
  }

  const addRowsBulk = (items: { identifier: string; amount: string }[]) => {
    setRows((prev) => {
      const start = prev.length
      const newRows: RecipientRow[] = items.map((it, idx) => ({
        id: String(start + idx + 1),
        identifier: it.identifier,
        amount: it.amount,
      }))
      return [...prev, ...newRows]
    })
  }

  const parseCsv = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) return [] as { identifier: string; amount: string }[]
    const out: { identifier: string; amount: string }[] = []
    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim())
      if (parts.length < 2) continue
      const [identifier, amount] = parts
      if (!identifier || !amount) continue
      out.push({ identifier, amount })
    }
    return out
  }

  const onCsvImport = () => {
    const items = parseCsv(csvText)
    if (items.length === 0) {
      toast.error('No valid rows found in CSV')
      return
    }
    addRowsBulk(items)
    setCsvText('')
    setShowCsvInput(false)
    toast.success(`Imported ${items.length} rows`)
  }

  const onCsvFile = async (file: File) => {
    try {
      const text = await file.text()
      const items = parseCsv(text)
      if (items.length === 0) {
        toast.error('No valid rows found in CSV')
        return
      }
      addRowsBulk(items)
      toast.success(`Imported ${items.length} rows from file`)
    } catch (e) {
      console.error(e)
      toast.error('Failed to read CSV file')
    }
  }

  const allInputsValid = useMemo(() => {
    if (!account) return false
    if (rows.length === 0) return false
    for (const r of rows) {
      const idOk = r.identifier.trim().length > 0
      const amtNum = Number(r.amount)
      const amtOk = r.amount.trim().length > 0 && isFinite(amtNum) && amtNum > 0
      if (!idOk || !amtOk) return false
    }
    const tokenOk = token === 'ETH' || (token === 'ERC20' && isAddress(customToken))
    return tokenOk
  }, [account, rows, token, customToken])

  const effectiveToken: 'ETH' | Address = useMemo(() => {
    if (token === 'ETH') return 'ETH'
    if (token === 'ERC20' && customToken && isAddress(customToken)) return customToken
    return 'ETH' // fallback; button should be disabled if invalid
  }, [token, customToken])

  const formatError = (e: unknown): string => {
    const err = e as any
    return (
      err?.cause?.shortMessage ||
      err?.shortMessage ||
      err?.details ||
      err?.message ||
      'Transaction failed'
    )
  }

  const onSubmit = async () => {
    if (!account) return toast.error('Connect wallet')
    if (rows.length === 0) return toast.error('Add at least one recipient')
    const recipients = rows.map((r) => r.identifier.trim()).filter(Boolean)
    const amountStrings = rows.map((r) => r.amount.trim()).filter(Boolean)
    if (recipients.length !== rows.length || amountStrings.length !== rows.length) {
      return toast.error('Fill all rows')
    }
    try {
      setLoading(true)
      // parse amounts; for ERC20 respect token decimals
      const amounts = amountStrings.map((a) => {
        if (token === 'ERC20') {
          const [whole, fraction = ''] = a.split('.')
          const padded = (fraction + '0'.repeat(tokenDecimals)).slice(0, tokenDecimals)
          const normalized = `${whole}${padded ? '.' + padded : ''}`
          // For non-18 decimals we cannot rely on parseEther. Implement simple bigint parse
          const integer = BigInt(whole || '0') * BigInt(10) ** BigInt(tokenDecimals)
          const frac = BigInt(padded || '0')
          return integer + frac
        }
        return parseEther(a)
      })
      const txHash = await smartWalletService.processBatchPayment(
        recipients,
        amounts,
        effectiveToken,
        account
      )
      await smartWalletService.waitForTransaction(txHash as any)
      toast.success('Batch payment submitted')
      onClose()
    } catch (e) {
      console.error(e)
      toast.error(formatError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-dark-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Batch Payment</h2>
                <p className="text-sm text-gray-400">Send to multiple identifiers at once</p>
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

          <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center space-x-3">
              <label htmlFor="token-select" className="text-sm text-gray-300">Token</label>
              <select
                id="token-select"
                value={token}
                onChange={(e) => setToken(e.target.value as 'ETH' | 'ERC20')}
                className="bg-dark-800/50 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="ETH">ETH</option>
                <option value="ERC20">Custom ERC20 (18 decimals)</option>
              </select>
              {token === 'ERC20' && (
                <input
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value as any)}
                  placeholder="Token address (0x...)"
                  className="bg-dark-800/50 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white w-[280px]"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <div>
                Batch fee: {batchFeeWei != null ? `${Number(formatEther(batchFeeWei)).toFixed(6)} ETH` : '—'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCsvInput((s) => !s)}
                  className="px-2 py-1 bg-dark-700 hover:bg-dark-600 rounded text-white"
                >
                  {showCsvInput ? 'Close CSV' : 'Paste CSV'}
                </button>
                <label className="px-2 py-1 bg-dark-700 hover:bg-dark-600 rounded text-white cursor-pointer">
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) onCsvFile(f)
                      e.currentTarget.value = ''
                    }}
                  />
                </label>
              </div>
            </div>

            {showCsvInput && (
              <div className="space-y-2">
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="identifier,amount\n+15551234567,0.01\n@alice,0.02"
                  className="w-full h-24 bg-dark-800/50 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white"
                />
                <div className="flex justify-end">
                  <button
                    onClick={onCsvImport}
                    className="px-3 py-1 bg-dark-700 hover:bg-dark-600 rounded text-white text-sm"
                  >
                    Import
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-3">
                  <input
                    value={row.identifier}
                    onChange={(e) => updateRow(row.id, 'identifier', e.target.value)}
                    placeholder="Recipient identifier (phone or username)"
                    className="col-span-7 bg-dark-800/50 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={row.amount}
                    onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                    placeholder="Amount (ETH)"
                    type="number"
                    min="0"
                    step="0.0001"
                    className="col-span-4 bg-dark-800/50 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white"
                  />
                  <button
                    onClick={() => removeRow(row.id)}
                    className="col-span-1 text-sm px-3 py-2 bg-dark-700 rounded-lg text-white hover:bg-dark-600"
                    aria-label="Remove row"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={addRow}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-white text-sm"
              >
                + Add recipient
              </button>
              <button
                onClick={onSubmit}
                disabled={loading || !allInputsValid}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white text-sm disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Send Batch'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}



