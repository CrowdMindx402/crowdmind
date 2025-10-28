import { solanaClient } from './solana';
import { baseClient } from './base';
import { mockBlockchainClient } from '@/lib/demo/mock-blockchain';
import { isDemoMode } from '@/lib/demo/config';
import type { ChainType } from '@/types';

export interface BlockchainClient {
  getWalletAddress(): string;
  getBalance(): Promise<number>;
  getUSDCBalance(): Promise<number>;
  verifyUSDCPayment(txHash: string, expectedAmount: number, recipientAddress: string): Promise<boolean>;
  sendUSDC(recipientAddress: string, amount: number): Promise<string>;
  getTransactionStatus(txHash: string): Promise<'confirmed' | 'finalized' | 'failed' | 'not_found'>;
}

// Demo mode wrapper
class DemoBlockchainClient implements BlockchainClient {
  constructor(private chain: ChainType, private realClient: any) {}

  getWalletAddress(): string {
    if (isDemoMode()) {
      return mockBlockchainClient.getWalletAddress(this.chain);
    }
    return this.realClient.getWalletAddress();
  }

  async getBalance(): Promise<number> {
    if (isDemoMode()) {
      return mockBlockchainClient.getBalance(this.chain);
    }
    return this.realClient.getBalance();
  }

  async getUSDCBalance(): Promise<number> {
    if (isDemoMode()) {
      return mockBlockchainClient.getUSDCBalance(this.chain);
    }
    return this.realClient.getUSDCBalance();
  }

  async verifyUSDCPayment(txHash: string, expectedAmount: number, recipientAddress: string): Promise<boolean> {
    if (isDemoMode()) {
      return mockBlockchainClient.verifyUSDCPayment(this.chain, txHash, expectedAmount, recipientAddress);
    }
    return this.realClient.verifyUSDCPayment(txHash, expectedAmount, recipientAddress);
  }

  async sendUSDC(recipientAddress: string, amount: number): Promise<string> {
    if (isDemoMode()) {
      const txHash = await mockBlockchainClient.sendUSDC(this.chain, recipientAddress, amount);
      await mockBlockchainClient.updateBalance(this.chain, amount, true);
      return txHash;
    }
    return this.realClient.sendUSDC(recipientAddress, amount);
  }

  async getTransactionStatus(txHash: string): Promise<'confirmed' | 'finalized' | 'failed' | 'not_found'> {
    if (isDemoMode()) {
      return mockBlockchainClient.getTransactionStatus(txHash);
    }
    return this.realClient.getTransactionStatus(txHash);
  }
}

export function getBlockchainClient(chain: ChainType): BlockchainClient {
  switch (chain) {
    case 'SOLANA':
      return new DemoBlockchainClient('SOLANA', solanaClient);
    case 'BASE':
      return new DemoBlockchainClient('BASE', baseClient);
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}

export { solanaClient, baseClient };

