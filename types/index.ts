export type ChainType = 'SOLANA' | 'BASE';

export type ProposalStatus = 'ACTIVE' | 'FUNDED' | 'EXECUTING' | 'EXECUTED' | 'FAILED';

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export type TransactionType = 'PAYMENT' | 'EXECUTION' | 'REFUND';

export type ActionType = 
  | 'BUY_TOKEN'
  | 'DONATE'
  | 'MINT_NFT'
  | 'DEPLOY_TOKEN'
  | 'FUND_COMPUTE'
  | 'JUPITER_SWAP'
  | 'CUSTOM';

export interface ProposalActionParams {
  BUY_TOKEN: {
    tokenMint: string;
    chain: ChainType;
    slippageBps?: number;
  };
  DONATE: {
    recipientAddress: string;
    chain: ChainType;
    message?: string;
  };
  MINT_NFT: {
    name: string;
    symbol: string;
    uri: string;
    chain: ChainType;
  };
  DEPLOY_TOKEN: {
    name: string;
    symbol: string;
    initialSupply: number;
    chain: ChainType;
  };
  FUND_COMPUTE: {
    provider: string;
    amount: number;
    duration?: string;
  };
  JUPITER_SWAP: {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippageBps?: number;
  };
  CUSTOM: {
    description: string;
    [key: string]: any;
  };
}

export interface X402PaymentInstructions {
  statusCode: 402;
  message: string;
  paymentInstructions: {
    chain: ChainType;
    recipientAddress: string;
    amount: number;
    currency: string;
    memo?: string;
    expiresAt: string;
  };
  verificationUrl: string;
}

export interface ExecutionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  receipt?: any;
  timestamp: string;
}

export interface AgentDecision {
  proposalId: string;
  shouldExecute: boolean;
  reason: string;
  confidence: number;
}

