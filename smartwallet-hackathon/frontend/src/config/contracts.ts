// Contract addresses deployed on Morph Testnet
export const CONTRACT_ADDRESSES = {
  USER_REGISTRY: "0x88bcb19a8984f6877996f6dbbcfba8df01a76b25",
  WALLET_FACTORY: "0x7900f6ddb4363d104147077eba8012e36ebd69e1",
  SMART_WALLET_IMPL: "0x990ec214cadf9eba4809c7277414a5e179066ced",
  SAMPLE_SMART_WALLET: "0x990ec214cadf9eba4809c7277414a5e179066ced",
  PAYMENT_PROCESSOR: "0x56705c4c5c455a6aa4a0d0ace5c561ac71727e68",
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 2810,
  name: "Morph Testnet",
  rpcUrl: "https://rpc-quicknode-holesky.morphl2.io",
  blockExplorer: "https://explorer-holesky.morphl2.io",
} as const;

// Deployment info
export const DEPLOYMENT_INFO = {
  deployerAddress: "0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38",
  deployedAt: 1754125712,
  deploymentFee: "1000000000000000", // wei
  reservedUsernames: 8,
} as const;
