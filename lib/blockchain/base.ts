import { ethers } from 'ethers';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

export class BaseClient {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private usdcAddress: string;
  private usdcContract: ethers.Contract;

  constructor() {
    const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    const privateKey = process.env.BASE_WALLET_PRIVATE_KEY;
    if (!privateKey || privateKey === '') {
      // Create a random wallet for development/testing
      this.wallet = ethers.Wallet.createRandom().connect(this.provider);
      console.warn('⚠️ BASE_WALLET_PRIVATE_KEY not configured, using generated wallet');
    } else {
      try {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
      } catch (error) {
        this.wallet = ethers.Wallet.createRandom().connect(this.provider);
        console.error('Invalid BASE_WALLET_PRIVATE_KEY format, using generated wallet');
      }
    }
    
    this.usdcAddress = process.env.BASE_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    this.usdcContract = new ethers.Contract(this.usdcAddress, ERC20_ABI, this.wallet);
  }

  getWalletAddress(): string {
    return this.wallet.address;
  }

  async getBalance(): Promise<number> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return parseFloat(ethers.formatEther(balance));
  }

  async getUSDCBalance(): Promise<number> {
    try {
      const balance = await this.usdcContract.balanceOf(this.wallet.address);
      return parseFloat(ethers.formatUnits(balance, 6)); // USDC has 6 decimals
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
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        return false;
      }

      // Check if transaction was successful
      if (receipt.status !== 1) {
        return false;
      }

      // Parse Transfer events
      const usdcInterface = new ethers.Interface(ERC20_ABI);
      
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== this.usdcAddress.toLowerCase()) {
          continue;
        }

        try {
          const parsed = usdcInterface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });

          if (parsed && parsed.name === 'Transfer') {
            const to = parsed.args[1];
            const amount = parsed.args[2];
            
            if (to.toLowerCase() === recipientAddress.toLowerCase()) {
              const usdcAmount = parseFloat(ethers.formatUnits(amount, 6));
              
              // Allow 1% tolerance for amount verification
              if (Math.abs(usdcAmount - expectedAmount) / expectedAmount < 0.01) {
                return true;
              }
            }
          }
        } catch (e) {
          // Not a Transfer event or parsing failed, continue
          continue;
        }
      }

      return false;
    } catch (error) {
      console.error('Error verifying Base payment:', error);
      return false;
    }
  }

  async sendUSDC(recipientAddress: string, amount: number): Promise<string> {
    try {
      const amountInSmallestUnit = ethers.parseUnits(amount.toString(), 6);
      
      const tx = await this.usdcContract.transfer(recipientAddress, amountInSmallestUnit);
      const receipt = await tx.wait();
      
      return receipt.hash;
    } catch (error) {
      console.error('Error sending USDC on Base:', error);
      throw error;
    }
  }

  async sendETH(recipientAddress: string, amount: number): Promise<string> {
    try {
      const tx = await this.wallet.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(amount.toString()),
      });
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error sending ETH on Base:', error);
      throw error;
    }
  }

  async getTransactionStatus(txHash: string): Promise<'confirmed' | 'finalized' | 'failed' | 'not_found'> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return 'not_found';
      }

      if (receipt.status === 1) {
        // On Base, we consider it finalized after a few confirmations
        const currentBlock = await this.provider.getBlockNumber();
        const confirmations = currentBlock - receipt.blockNumber;
        
        if (confirmations >= 10) {
          return 'finalized';
        }
        return 'confirmed';
      }

      return 'failed';
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return 'not_found';
    }
  }

  async deployERC20Token(
    name: string,
    symbol: string,
    initialSupply: number
  ): Promise<string> {
    // This is a placeholder - in production, you'd deploy an actual ERC20 contract
    throw new Error('ERC20 deployment not implemented yet');
  }
}

export const baseClient = new BaseClient();

