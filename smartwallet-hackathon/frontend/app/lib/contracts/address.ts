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
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const broadcast = require('../../../../contracts/broadcast/Deploy.s.sol/2810/run-1754611209.json')
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

const STATIC_ADDRESSES: Addresses = {
  USER_REGISTRY: (DYNAMIC_ADDRESSES?.USER_REGISTRY || '0x88bcb19a8984f6877996f6dbbcfba8df01a76b25') as `0x${string}`,
  SMART_WALLET: (DYNAMIC_ADDRESSES?.SMART_WALLET || '0x990ec214cadf9eba4809c7277414a5e179066ced') as `0x${string}`,
  WALLET_FACTORY: (DYNAMIC_ADDRESSES?.WALLET_FACTORY || '0x7900f6ddb4363d104147077eba8012e36ebd69e1') as `0x${string}`,
  SMART_WALLET_IMPLEMENTATION: (DYNAMIC_ADDRESSES?.SMART_WALLET_IMPLEMENTATION || '0x990ec214cadf9eba4809c7277414a5e179066ced') as `0x${string}`,
  PAYMENT_PROCESSOR: (DYNAMIC_ADDRESSES?.PAYMENT_PROCESSOR || '0x56705c4c5c455a6aa4a0d0ace5c561ac71727e68') as `0x${string}`,
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
        http: ['https://rpc-quicknode-holesky.morphl2.io'],
        webSocket: ['wss://rpc-quicknode-holesky.morphl2.io'],
      },
      public: {
        http: ['https://rpc-quicknode-holesky.morphl2.io'],
        webSocket: ['wss://rpc-quicknode-holesky.morphl2.io'],
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