import { createConfig, configureChains } from 'wagmi'
import { mainnet, sepolia, localhost } from 'wagmi/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'

// Define Morph Holesky Testnet
const morphHolesky = {
  id: 2810,
  name: 'Morph Holesky Testnet',
  network: 'morph-holesky-testnet',
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
      name: 'Morph Holesky Explorer',
      url: 'https://explorer-holesky.morphl2.io',
    },
  },
  testnet: true,
}

// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, localhost, morphHolesky],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === 2810) {
          return {
            http: 'https://rpc-quicknode-holesky.morphl2.io',
            webSocket: 'wss://rpc-quicknode-holesky.morphl2.io',
          }
        }
        return null
      },
    }),
    publicProvider(),
  ]
)

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id'

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
    new MetaMaskConnector({
      chains,
      options: {
        shimDisconnect: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
        metadata: {
          name: 'Smart Wallet Hackathon',
          description: 'Smart Wallet DApp',
          url: 'https://localhost:3000',
          icons: ['https://avatars.githubusercontent.com/u/37784886']
        }
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}