/**
 * Mock blockchain client for demo mode
 * Simulates real blockchain operations without requiring actual wallets
 */

import type { ChainType } from '@/types';

class MockBlockchainClient {
  private demoWallets = {
    SOLANA: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    BASE: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4',
  };

  private demoBalances = {
    SOLANA: { native: 2.5, usdc: 1250.75 },
    BASE: { native: 0.15, usdc: 890.50 },
  };

  getWalletAddress(chain: ChainType): string {
    return this.demoWallets[chain];
  }

  async getBalance(chain: ChainType): Promise<number> {
    await this.simulateDelay();
    return this.demoBalances[chain].native;
  }

  async getUSDCBalance(chain: ChainType): Promise<number> {
    await this.simulateDelay();
    return this.demoBalances[chain].usdc;
  }

  async verifyUSDCPayment(
    chain: ChainType,
    transactionHash: string,
    expectedAmount: number,
    recipientAddress: string
  ): Promise<boolean> {
    await this.simulateDelay();
    // In demo mode, all transactions are valid
    return true;
  }

  async sendUSDC(
    chain: ChainType,
    recipientAddress: string,
    amount: number
  ): Promise<string> {
    await this.simulateDelay();
    // Generate realistic-looking transaction hash
    return this.generateMockTxHash(chain);
  }

  async getTransactionStatus(txHash: string): Promise<'confirmed' | 'finalized' | 'failed' | 'not_found'> {
    await this.simulateDelay();
    return 'confirmed';
  }

  generateMockTxHash(chain: ChainType): string {
    if (chain === 'SOLANA') {
      // Solana transaction hash format (base58, 88 chars typical)
      return this.generateRandomBase58(88);
    } else {
      // Base/EVM transaction hash format (0x + 64 hex chars)
      return '0x' + this.generateRandomHex(64);
    }
  }

  generateMockAddress(chain: ChainType): string {
    if (chain === 'SOLANA') {
      // Solana public key format (base58, 44 chars)
      return this.generateRandomBase58(44);
    } else {
      // EVM address format (0x + 40 hex chars)
      return '0x' + this.generateRandomHex(40);
    }
  }

  private generateRandomBase58(length: number): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateRandomHex(length: number): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async simulateDelay(): Promise<void> {
    // Simulate network delay (50-200ms)
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));
  }

  // Update balances for realistic demo (deduct when sending)
  async updateBalance(chain: ChainType, amount: number, isDeduction: boolean = false) {
    if (isDeduction) {
      this.demoBalances[chain].usdc -= amount;
    } else {
      this.demoBalances[chain].usdc += amount;
    }
  }
}

export const mockBlockchainClient = new MockBlockchainClient();

