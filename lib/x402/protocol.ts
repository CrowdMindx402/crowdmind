import type { ChainType, X402PaymentInstructions } from '@/types';
import { getBlockchainClient } from '@/lib/blockchain';

export class X402Protocol {
  private domain: string;
  private timeoutSeconds: number;

  constructor() {
    this.domain = process.env.X402_DOMAIN || 'http://localhost:3000';
    this.timeoutSeconds = parseInt(process.env.X402_PAYMENT_TIMEOUT_SECONDS || '600', 10);
  }

  /**
   * Generate x402 payment instructions for a proposal
   */
  generatePaymentInstructions(
    proposalId: string,
    chain: ChainType,
    amount: number,
    memo?: string
  ): X402PaymentInstructions {
    const client = getBlockchainClient(chain);
    const recipientAddress = client.getWalletAddress();

    const expiresAt = new Date(Date.now() + this.timeoutSeconds * 1000).toISOString();

    return {
      statusCode: 402,
      message: 'Payment Required',
      paymentInstructions: {
        chain,
        recipientAddress,
        amount,
        currency: 'USDC',
        memo: memo || `Payment for proposal ${proposalId}`,
        expiresAt,
      },
      verificationUrl: `${this.domain}/api/proposals/${proposalId}/verify`,
    };
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(
    chain: ChainType,
    transactionHash: string,
    expectedAmount: number,
    recipientAddress: string
  ): Promise<{
    verified: boolean;
    actualAmount?: number;
    error?: string;
  }> {
    try {
      const client = getBlockchainClient(chain);
      
      // First, check transaction status
      const status = await client.getTransactionStatus(transactionHash);
      
      if (status === 'not_found') {
        return {
          verified: false,
          error: 'Transaction not found',
        };
      }

      if (status === 'failed') {
        return {
          verified: false,
          error: 'Transaction failed',
        };
      }

      // Verify the payment details
      const verified = await client.verifyUSDCPayment(
        transactionHash,
        expectedAmount,
        recipientAddress
      );

      if (verified) {
        return {
          verified: true,
          actualAmount: expectedAmount,
        };
      } else {
        return {
          verified: false,
          error: 'Payment verification failed - amount or recipient mismatch',
        };
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create HTTP 402 response
   */
  createHTTP402Response(instructions: X402PaymentInstructions): Response {
    return new Response(JSON.stringify(instructions), {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': `x402 realm="${this.domain}", currency="USDC"`,
      },
    });
  }

  /**
   * Parse x402 payment proof from request
   */
  parsePaymentProof(headers: Headers): {
    chain?: ChainType;
    transactionHash?: string;
  } {
    const authHeader = headers.get('Authorization') || headers.get('x-payment-proof');
    
    if (!authHeader) {
      return {};
    }

    // Expected format: "x402 chain=SOLANA txHash=..."
    // or JSON in x-payment-proof header
    try {
      if (authHeader.startsWith('x402 ')) {
        const parts = authHeader.slice(5).split(' ');
        const parsed: any = {};
        
        for (const part of parts) {
          const [key, value] = part.split('=');
          if (key && value) {
            parsed[key] = value;
          }
        }

        return {
          chain: parsed.chain as ChainType,
          transactionHash: parsed.txHash,
        };
      } else {
        // Try parsing as JSON
        const parsed = JSON.parse(authHeader);
        return {
          chain: parsed.chain,
          transactionHash: parsed.transactionHash || parsed.txHash,
        };
      }
    } catch (error) {
      console.error('Error parsing payment proof:', error);
      return {};
    }
  }
}

export const x402Protocol = new X402Protocol();

