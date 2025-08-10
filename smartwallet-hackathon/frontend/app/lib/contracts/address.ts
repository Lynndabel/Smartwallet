// Smart Contract Addresses for Morph Testnet
// Update these addresses after deployment

// Attempt to load addresses from on-chain broadcast file, fallback to static
type Addresses = {
  USER_REGISTRY: `0x${string}`
  SMART_WALLET: `0x${string}`
  WALLET_FACTORY: `0x${string}`
  SMART_WALLET_IMPLEMENTATION: `0x${string}`
  PAYMENT_PROCESSOR: `0x${string}`
}

let DYNAMIC_ADDRESSES: Partial<Addresses> | undefined
// Only attempt to load broadcast files on the server to avoid bundling issues
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let broadcast
    try {
      // Prefer most recent deployment
      broadcast = require('../../../../contracts/broadcast/Deploy.s.sol/2810/run-latest.json')
    } catch (_e2) {
      // Fallback to a pinned run file (older)
      broadcast = require('../../../../contracts/broadcast/Deploy.s.sol/2810/run-1754611209.json')
    }
    const txs: Array<{ contractName?: string; contractAddress?: string }> = broadcast?.transactions || []
    const map = new Map<string, string>()
    for (const tx of txs) {
      if (tx.contractName && tx.contractAddress) {
        map.set(tx.contractName, tx.contractAddress)
      }
    }
    DYNAMIC_ADDRESSES = {
      USER_REGISTRY: map.get('UserRegistry') as `0x${string}` | undefined,
      SMART_WALLET: map.get('SmartWallet') as `0x${string}` | undefined,
      WALLET_FACTORY: map.get('WalletFactory') as `0x${string}` | undefined,
      SMART_WALLET_IMPLEMENTATION: map.get('SmartWallet') as `0x${string}` | undefined,
      PAYMENT_PROCESSOR: map.get('PaymentProcessor') as `0x${string}` | undefined,
    }
  } catch (_e) {
    // ignore; fall back to static
  }
}

// Fallback static addresses (sourced from contracts/deployments/morph-testnet.json); also used on the client
// If the network resets and these change, update this block.
const STATIC_ADDRESSES: Addresses = {
  // Provided from your latest deployment output
  USER_REGISTRY: (DYNAMIC_ADDRESSES?.USER_REGISTRY || '0x7efe7119b06dfc39571a58bf1d98c13bd450a03d') as `0x${string}`,
  SMART_WALLET: (DYNAMIC_ADDRESSES?.SMART_WALLET || '0xe2fcd58f285573fdd61a53675b96cdc65be1a893') as `0x${string}`,
  WALLET_FACTORY: (DYNAMIC_ADDRESSES?.WALLET_FACTORY || '0xf4c5ba414332e0c19be234633f2a6868a4ae6eb3') as `0x${string}`,
  // If the implementation differs, update this field; using the same as sample for now
  SMART_WALLET_IMPLEMENTATION: (DYNAMIC_ADDRESSES?.SMART_WALLET_IMPLEMENTATION || '0xe2fcd58f285573fdd61a53675b96cdc65be1a893') as `0x${string}`,
  PAYMENT_PROCESSOR: (DYNAMIC_ADDRESSES?.PAYMENT_PROCESSOR || '0x1e5f3ad74cce2a20270810ee2e40fb858d81ceb9') as `0x${string}`,
}

export const CONTRACT_ADDRESSES: Addresses = STATIC_ADDRESSES
  
  // Network configuration
  export const MORPH_TESTNET_CONFIG = {
    id: 2810,
    name: 'Morph Testnet',
    network: 'morph-testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: ['https://rpc-holesky.morphl2.io'],
        webSocket: ['wss://rpc-holesky.morphl2.io'],
      },
      public: {
        http: ['https://rpc-holesky.morphl2.io'],
        webSocket: ['wss://rpc-holesky.morphl2.io'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Morph Explorer',
        url: 'https://explorer-holesky.morphl2.io',
      },
    },
    testnet: true,
  }
  
  // Token addresses (add as needed)
  export const TOKEN_ADDRESSES = {
    USDC: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F' as `0x${string}`,
    USDT: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9' as `0x${string}`,
    DAI: '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844' as `0x${string}`,
  } as const
  
  // Contract deployment info
  export const DEPLOYMENT_INFO = {
    network: 'morph-testnet',
    deployedAt: '2024-01-01T00:00:00Z',
    deployer: '0x0000000000000000000000000000000000000000',
    version: '1.0.0',
  } as const
  
  // Utility function to get contract address with type safety
  export function getContractAddress(contractName: keyof Addresses): `0x${string}` {
    const address = CONTRACT_ADDRESSES[contractName]
    if (!address) {
      throw new Error(`Contract address not found for ${String(contractName)}`)
    }
    return address
  }
  
  // Utility function to get token address
  export function getTokenAddress(tokenSymbol: keyof typeof TOKEN_ADDRESSES): `0x${string}` {
    const address = TOKEN_ADDRESSES[tokenSymbol]
    if (!address) {
      throw new Error(`Token address not found for ${tokenSymbol}`)
    }
    return address
  }
  
  // Check if running on correct network
  export function isCorrectNetwork(chainId: number): boolean {
    return chainId === MORPH_TESTNET_CONFIG.id
  }
  
  // Get explorer URL for address
  export function getExplorerUrl(address: string, type: 'address' | 'tx' = 'address'): string {
    const baseUrl = MORPH_TESTNET_CONFIG.blockExplorers.default.url
    return `${baseUrl}/${type}/${address}`
  }