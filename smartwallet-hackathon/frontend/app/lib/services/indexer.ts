'use client'

import { Address, decodeEventLog, Hex, parseAbiItem } from 'viem'
import { publicClient } from '@/lib/contracts/contracts'

// ABI fragments for decoding events
const paymentSentAbi = parseAbiItem(
  'event PaymentSent(address indexed from, address indexed to, uint256 amount, string identifier)'
)
const paymentReceivedAbi = parseAbiItem(
  'event PaymentReceived(address indexed from, address indexed to, uint256 amount)'
)

export type IndexedTx = {
  id: string
  type: 'sent' | 'received'
  amount: bigint
  token: 'ETH' | Address
  identifier?: string
  from: Address
  to: Address
  timestamp: number
  txHash: Hex
}

export async function fetchIndexedTransactions(
  userEOA: Address,
  smartWalletAddress: Address,
  fromBlock?: bigint
): Promise<IndexedTx[]> {
  // Fetch PaymentSent by EOA (sender) from this smart wallet contract
  const sentLogs = await publicClient.getLogs({
    address: smartWalletAddress,
    event: paymentSentAbi,
    args: { from: userEOA },
    fromBlock,
  })

  // Fetch PaymentReceived to user's wallet (recipient) from this smart wallet contract
  const receivedLogs = await publicClient.getLogs({
    address: smartWalletAddress,
    event: paymentReceivedAbi,
    args: { to: smartWalletAddress },
    fromBlock,
  })

  const sentTxs: IndexedTx[] = sentLogs.map((log, i) => {
    const decoded = decodeEventLog({
      abi: [paymentSentAbi],
      data: log.data,
      topics: log.topics,
    })
    const { from, to, amount, identifier } = decoded.args as any
    return {
      id: `sent-${log.transactionHash}-${i}`,
      type: 'sent',
      amount,
      token: 'ETH', // token sends are separate events; extend later
      identifier,
      from,
      to,
      timestamp: 0, // fill below with real block timestamps
      txHash: log.transactionHash!,
    }
  })

  const recvTxs: IndexedTx[] = receivedLogs.map((log, i) => {
    const decoded = decodeEventLog({
      abi: [paymentReceivedAbi],
      data: log.data,
      topics: log.topics,
    })
    const { from, to, amount } = decoded.args as any
    return {
      id: `recv-${log.transactionHash}-${i}`,
      type: 'received',
      amount,
      token: 'ETH',
      from,
      to,
      timestamp: 0,
      txHash: log.transactionHash!,
    }
  })

  const all = [...sentTxs, ...recvTxs]

  // Enrich with real block timestamps
  const uniqueBlockHashes = Array.from(new Set([
    ...sentLogs.map(l => l.blockHash).filter(Boolean),
    ...receivedLogs.map(l => l.blockHash).filter(Boolean),
  ])) as Hex[]

  const blockMap = new Map<Hex, number>()
  for (const bh of uniqueBlockHashes) {
    const block = await publicClient.getBlock({ blockHash: bh })
    blockMap.set(bh, Number(block.timestamp) * 1000)
  }

  // Assign timestamps based on the original logs order
  sentLogs.forEach((log, i) => {
    const ts = blockMap.get(log.blockHash!) || 0
    sentTxs[i].timestamp = ts
  })
  receivedLogs.forEach((log, i) => {
    const ts = blockMap.get(log.blockHash!) || 0
    recvTxs[i].timestamp = ts
  })

  all.sort((a, b) => b.timestamp - a.timestamp)
  return all
}


