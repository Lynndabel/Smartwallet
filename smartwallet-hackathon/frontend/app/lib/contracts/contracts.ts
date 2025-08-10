// lib/contracts.ts
import { createPublicClient, createWalletClient, http, custom, Address } from 'viem'
import { UserRegistryABI, SmartWalletABI, WalletFactoryABI, ERC20ABI, PaymentProcessorABI } from './abis'
import { 
  CONTRACT_ADDRESSES, 
  MORPH_TESTNET_CONFIG, 
  getContractAddress,
  getExplorerUrl 
} from './address' // Import your config

// Create the chain object for viem
export const morphTestnetChain = MORPH_TESTNET_CONFIG

// Public client for reading
export const publicClient = createPublicClient({
  chain: morphTestnetChain,
  transport: http(),
})

// Wallet client for writing (when connected)
declare global {
  interface Window {
    ethereum?: any
  }
}

export const getWalletClient = () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    return createWalletClient({
      chain: morphTestnetChain,
      transport: custom(window.ethereum),
    })
  }
  return null
}

// Contract interaction service
export class SmartWalletService {
  
  // === USER REGISTRY METHODS ===
  
  async registerUser(
    identifier: string, 
    identifierType: 'phone' | 'username', 
    walletAddress: Address,
    account: Address
  ) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const { request } = await publicClient.simulateContract({
      address: getContractAddress('USER_REGISTRY'),
      abi: UserRegistryABI,
      functionName: 'registerUser',
      args: [identifier, identifierType, walletAddress],
      account,
    })

    return await walletClient.writeContract(request)
  }

  async getWalletByIdentifier(identifier: string): Promise<Address> {
    return await publicClient.readContract({
      address: getContractAddress('USER_REGISTRY'),
      abi: UserRegistryABI,
      functionName: 'getWallet',
      args: [identifier],
    }) as Address
  }

  async getIdentifiersByWallet(walletAddress: Address): Promise<string[]> {
    return await publicClient.readContract({
      address: getContractAddress('USER_REGISTRY'),
      abi: UserRegistryABI,
      functionName: 'getIdentifiers',
      args: [walletAddress],
    }) as string[]
  }

  async isIdentifierAvailable(identifier: string): Promise<boolean> {
    return await publicClient.readContract({
      address: getContractAddress('USER_REGISTRY'),
      abi: UserRegistryABI,
      functionName: 'isAvailable',
      args: [identifier],
    }) as boolean
  }

  // === WALLET FACTORY METHODS ===
  
  async getDeploymentFee(): Promise<bigint> {
    return await publicClient.readContract({
      address: getContractAddress('WALLET_FACTORY'),
      abi: WalletFactoryABI,
      functionName: 'deploymentFee',
    }) as bigint
  }

  async createWallet(account: Address) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const fee = await this.getDeploymentFee()
    const { request } = await publicClient.simulateContract({
      address: getContractAddress('WALLET_FACTORY'),
      abi: WalletFactoryABI,
      functionName: 'createWallet',
      account,
      value: fee,
    })

    return await walletClient.writeContract(request)
  }

  async createWalletWithIdentifier(
    identifier: string,
    identifierType: 'phone' | 'username',
    account: Address
  ) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const fee = await this.getDeploymentFee()
    const { request } = await publicClient.simulateContract({
      address: getContractAddress('WALLET_FACTORY'),
      abi: WalletFactoryABI,
      functionName: 'createWalletWithIdentifier',
      args: [identifier, identifierType],
      account,
      value: fee,
    })

    return await walletClient.writeContract(request)
  }

  async getUserWallet(userAddress: Address): Promise<Address> {
    return await publicClient.readContract({
      address: getContractAddress('WALLET_FACTORY'),
      abi: WalletFactoryABI,
      functionName: 'getWallet',
      args: [userAddress],
    }) as Address
  }

  async hasWallet(userAddress: Address): Promise<boolean> {
    return await publicClient.readContract({
      address: getContractAddress('WALLET_FACTORY'),
      abi: WalletFactoryABI,
      functionName: 'hasWallet',
      args: [userAddress],
    }) as boolean
  }

  // === SMART WALLET METHODS ===
  
  async getBalance(walletAddress: Address, userAddress: Address): Promise<bigint> {
    return await publicClient.readContract({
      address: walletAddress,
      abi: SmartWalletABI,
      functionName: 'getBalance',
      args: [userAddress],
    }) as bigint
  }

  // === PAYMENT PROCESSOR METHODS ===

  async getBatchPaymentFee(): Promise<bigint> {
    return await publicClient.readContract({
      address: getContractAddress('PAYMENT_PROCESSOR'),
      abi: PaymentProcessorABI,
      functionName: 'batchPaymentFee',
    }) as bigint
  }

  async processBatchPayment(
    recipients: string[],
    amounts: bigint[],
    token: Address | 'ETH',
    account: Address
  ) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const fee = await this.getBatchPaymentFee()
    const tokenAddr = token === 'ETH' ? ('0x0000000000000000000000000000000000000000' as Address) : (token as Address)

    const { request } = await publicClient.simulateContract({
      address: getContractAddress('PAYMENT_PROCESSOR'),
      abi: PaymentProcessorABI,
      functionName: 'processBatchPayment',
      args: [recipients, amounts, tokenAddr],
      account,
      value: fee,
    })

    return await walletClient.writeContract(request)
  }

  async getPaymentRequestFee(): Promise<bigint> {
    return await publicClient.readContract({
      address: getContractAddress('PAYMENT_PROCESSOR'),
      abi: PaymentProcessorABI,
      functionName: 'paymentRequestFee',
    }) as bigint
  }

  async createPaymentRequest(
    payer: Address,
    amount: bigint,
    token: Address | 'ETH',
    message: string,
    expirySeconds: number,
    account: Address
  ) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const fee = await this.getPaymentRequestFee()
    const tokenAddr = token === 'ETH' ? ('0x0000000000000000000000000000000000000000' as Address) : (token as Address)

    const { request } = await publicClient.simulateContract({
      address: getContractAddress('PAYMENT_PROCESSOR'),
      abi: PaymentProcessorABI,
      functionName: 'createPaymentRequest',
      args: [payer, amount, tokenAddr, message, BigInt(expirySeconds)],
      account,
      value: fee,
    })

    return await walletClient.writeContract(request)
  }

  async fulfillPaymentRequest(requestId: bigint, account: Address) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const { request } = await publicClient.simulateContract({
      address: getContractAddress('PAYMENT_PROCESSOR'),
      abi: PaymentProcessorABI,
      functionName: 'fulfillPaymentRequest',
      args: [requestId],
      account,
    })

    return await walletClient.writeContract(request)
  }

  async cancelPaymentRequest(requestId: bigint, account: Address) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const { request } = await publicClient.simulateContract({
      address: getContractAddress('PAYMENT_PROCESSOR'),
      abi: PaymentProcessorABI,
      functionName: 'cancelPaymentRequest',
      args: [requestId],
      account,
    })

    return await walletClient.writeContract(request)
  }

  async getScheduledPaymentFee(): Promise<bigint> {
    return await publicClient.readContract({
      address: getContractAddress('PAYMENT_PROCESSOR'),
      abi: PaymentProcessorABI,
      functionName: 'scheduledPaymentFee',
    }) as bigint
  }

  async createScheduledPayment(
    recipientIdentifier: string,
    amount: bigint,
    token: Address | 'ETH',
    frequencySeconds: number,
    totalExecutions: number,
    account: Address
  ) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const fee = await this.getScheduledPaymentFee()
    const tokenAddr = token === 'ETH' ? ('0x0000000000000000000000000000000000000000' as Address) : (token as Address)

    const { request } = await publicClient.simulateContract({
      address: getContractAddress('PAYMENT_PROCESSOR'),
      abi: PaymentProcessorABI,
      functionName: 'createScheduledPayment',
      args: [recipientIdentifier, amount, tokenAddr, BigInt(frequencySeconds), BigInt(totalExecutions)],
      account,
      value: fee,
    })

    return await walletClient.writeContract(request)
  }

  async executeScheduledPayment(scheduleId: bigint, account: Address) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const { request } = await publicClient.simulateContract({
      address: getContractAddress('PAYMENT_PROCESSOR'),
      abi: PaymentProcessorABI,
      functionName: 'executeScheduledPayment',
      args: [scheduleId],
      account,
    })

    return await walletClient.writeContract(request)
  }

  async cancelScheduledPayment(scheduleId: bigint, account: Address) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const { request } = await publicClient.simulateContract({
      address: getContractAddress('PAYMENT_PROCESSOR'),
      abi: PaymentProcessorABI,
      functionName: 'cancelScheduledPayment',
      args: [scheduleId],
      account,
    })

    return await walletClient.writeContract(request)
  }

  // === ERC20 HELPERS ===
  async approveToken(spender: Address, token: Address, amount: bigint, account: Address) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const { request } = await publicClient.simulateContract({
      address: token,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [spender, amount],
      account,
    })

    return await walletClient.writeContract(request)
  }

  async tokenBalanceOf(token: Address, owner: Address): Promise<bigint> {
    return await publicClient.readContract({
      address: token,
      abi: ERC20ABI,
      functionName: 'balanceOf',
      args: [owner],
    }) as bigint
  }
  async tokenDecimals(token: Address): Promise<number> {
    const dec = await publicClient.readContract({
      address: token,
      abi: ERC20ABI,
      functionName: 'decimals',
    }) as number
    return Number(dec)
  }
  async getTokenBalance(
    walletAddress: Address, 
    userAddress: Address, 
    tokenAddress: Address
  ): Promise<bigint> {
    return await publicClient.readContract({
      address: walletAddress,
      abi: SmartWalletABI,
      functionName: 'getTokenBalance',
      args: [userAddress, tokenAddress],
    }) as bigint
  }

  async sendPayment(
    walletAddress: Address,
    identifier: string,
    amount: bigint,
    account: Address
  ) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const { request } = await publicClient.simulateContract({
      address: walletAddress,
      abi: SmartWalletABI,
      functionName: 'sendPayment',
      args: [identifier, amount],
      account,
    })

    return await walletClient.writeContract(request)
  }

  async sendTokenPayment(
    walletAddress: Address,
    identifier: string,
    tokenAddress: Address,
    amount: bigint,
    account: Address
  ) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const { request } = await publicClient.simulateContract({
      address: walletAddress,
      abi: SmartWalletABI,
      functionName: 'sendTokenPayment',
      args: [identifier, tokenAddress, amount],
      account,
    })

    return await walletClient.writeContract(request)
  }

  async deposit(walletAddress: Address, amount: bigint, account: Address) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const { request } = await publicClient.simulateContract({
      address: walletAddress,
      abi: SmartWalletABI,
      functionName: 'deposit',
      value: amount,
      account,
    })

    return await walletClient.writeContract(request)
  }

  async withdraw(walletAddress: Address, amount: bigint, account: Address) {
    const walletClient = getWalletClient()
    if (!walletClient) throw new Error('Wallet not connected')

    const { request } = await publicClient.simulateContract({
      address: walletAddress,
      abi: SmartWalletABI,
      functionName: 'withdraw',
      args: [amount],
      account,
    })

    return await walletClient.writeContract(request)
  }

  async getSentPayments(walletAddress: Address, userAddress: Address) {
    return await publicClient.readContract({
      address: walletAddress,
      abi: SmartWalletABI,
      functionName: 'getSentPayments',
      args: [userAddress],
    })
  }

  async getReceivedPayments(walletAddress: Address, userAddress: Address) {
    return await publicClient.readContract({
      address: walletAddress,
      abi: SmartWalletABI,
      functionName: 'getReceivedPayments',
      args: [userAddress],
    })
  }

  async getRecentTransactions(
    walletAddress: Address, 
    userAddress: Address, 
    limit: number = 10
  ) {
    return await publicClient.readContract({
      address: walletAddress,
      abi: SmartWalletABI,
      functionName: 'getRecentTransactions',
      args: [userAddress, BigInt(limit)],
    })
  }

  // === UTILITY METHODS ===
  
  async estimateGas(
    contractAddress: Address,
    abi: any,
    functionName: string,
    args: any[],
    account: Address,
    value?: bigint
  ) {
    return await publicClient.estimateContractGas({
      address: contractAddress,
      abi,
      functionName,
      args,
      account,
      value,
    })
  }

  async waitForTransaction(hash: Address) {
    return await publicClient.waitForTransactionReceipt({ hash })
  }
}

// Export singleton instance
export const smartWalletService = new SmartWalletService()