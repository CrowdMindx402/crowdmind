import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
} from '@solana/spl-token';
import bs58 from 'bs58';

export class SolanaClient {
  private connection: Connection;
  private wallet: Keypair;
  private usdcMint: PublicKey;

  constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');

    const privateKeyString = process.env.SOLANA_WALLET_PRIVATE_KEY;
    if (!privateKeyString || privateKeyString === '') {
      // Create a dummy keypair for development/testing
      this.wallet = Keypair.generate();
      console.warn('⚠️ SOLANA_WALLET_PRIVATE_KEY not configured, using generated keypair');
    } else {
      try {
        const privateKeyBytes = bs58.decode(privateKeyString);
        this.wallet = Keypair.fromSecretKey(privateKeyBytes);
      } catch (error) {
        this.wallet = Keypair.generate();
        console.error('Invalid SOLANA_WALLET_PRIVATE_KEY format, using generated keypair');
      }
    }

    this.usdcMint = new PublicKey(
      process.env.USDC_MINT_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    );
  }

  getWalletAddress(): string {
    return this.wallet.publicKey.toBase58();
  }

  async getBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  async getUSDCBalance(): Promise<number> {
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        this.usdcMint,
        this.wallet.publicKey
      );
      const account = await getAccount(this.connection, tokenAccount);
      return Number(account.amount) / 1e6; // USDC has 6 decimals
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      return 0;
    }
  }

  async verifyUSDCPayment(
    transactionHash: string,
    expectedAmount: number,
    recipientAddress: string
  ): Promise<boolean> {
    try {
      const signature = transactionHash;
      const tx = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || !tx.meta) {
        return false;
      }

      // Check if transaction was successful
      if (tx.meta.err) {
        return false;
      }

      // Verify recipient and amount in token transfers
      const recipient = new PublicKey(recipientAddress);
      const recipientTokenAccount = await getAssociatedTokenAddress(
        this.usdcMint,
        recipient
      );

      // Parse transaction for token transfers
      const postTokenBalances = tx.meta.postTokenBalances || [];
      const preTokenBalances = tx.meta.preTokenBalances || [];

      for (let i = 0; i < postTokenBalances.length; i++) {
        const postBalance = postTokenBalances[i];
        const preBalance = preTokenBalances.find((pre) => pre.accountIndex === postBalance.accountIndex);

        if (postBalance.owner === recipient.toBase58()) {
          const amountReceived = preBalance
            ? Number(postBalance.uiTokenAmount.amount) - Number(preBalance.uiTokenAmount.amount)
            : Number(postBalance.uiTokenAmount.amount);

          const usdcAmount = amountReceived / 1e6;
          
          // Allow 1% tolerance for amount verification
          if (Math.abs(usdcAmount - expectedAmount) / expectedAmount < 0.01) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error verifying Solana payment:', error);
      return false;
    }
  }

  async sendUSDC(recipientAddress: string, amount: number): Promise<string> {
    try {
      const recipient = new PublicKey(recipientAddress);
      
      const senderTokenAccount = await getAssociatedTokenAddress(
        this.usdcMint,
        this.wallet.publicKey
      );
      
      const recipientTokenAccount = await getAssociatedTokenAddress(
        this.usdcMint,
        recipient
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          this.wallet.publicKey,
          Math.floor(amount * 1e6), // Convert to smallest unit (6 decimals)
          [],
          undefined
        )
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.wallet],
        {
          commitment: 'confirmed',
        }
      );

      return signature;
    } catch (error) {
      console.error('Error sending USDC on Solana:', error);
      throw error;
    }
  }

  async executeJupiterSwap(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<string> {
    // Jupiter swap implementation would go here
    // This is a placeholder - in production, you'd use Jupiter API
    throw new Error('Jupiter swap not implemented yet');
  }

  async getTransactionStatus(signature: string): Promise<'confirmed' | 'finalized' | 'failed' | 'not_found'> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      
      if (!status || !status.value) {
        return 'not_found';
      }

      if (status.value.err) {
        return 'failed';
      }

      if (status.value.confirmationStatus === 'finalized') {
        return 'finalized';
      }

      if (status.value.confirmationStatus === 'confirmed') {
        return 'confirmed';
      }

      return 'not_found';
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return 'not_found';
    }
  }
}

export const solanaClient = new SolanaClient();

