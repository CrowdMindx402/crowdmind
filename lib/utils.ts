/**
 * Utility functions for the CrowdMind application
 */

/**
 * Format status for consistent display
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Active',
    'FUNDED': 'Funded',
    'EXECUTING': 'Executing',
    'EXECUTED': 'Executed',
    'FAILED': 'Failed',
    'PENDING': 'Pending',
    'CONFIRMED': 'Confirmed',
  };
  return statusMap[status] || status;
}

/**
 * Format action type for consistent display
 */
export function formatActionType(actionType: string): string {
  const actionMap: Record<string, string> = {
    'BUY_TOKEN': 'Buy Token',
    'DONATE': 'Donate',
    'MINT_NFT': 'Mint NFT',
    'DEPLOY_TOKEN': 'Deploy Token',
    'FUND_COMPUTE': 'Fund Compute',
    'JUPITER_SWAP': 'Jupiter Swap',
    'CUSTOM': 'Custom',
  };
  return actionMap[actionType] || actionType;
}

/**
 * Format transaction type for consistent display
 */
export function formatTransactionType(type: string): string {
  const typeMap: Record<string, string> = {
    'PAYMENT': 'Payment',
    'EXECUTION': 'Execution',
    'REFUND': 'Refund',
  };
  return typeMap[type] || type;
}

/**
 * Format chain name for consistent display
 */
export function formatChain(chain: string): string {
  const chainMap: Record<string, string> = {
    'SOLANA': 'Solana',
    'BASE': 'Base',
  };
  return chainMap[chain] || chain;
}

/**
 * Format a wallet address for display
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format a number as USD currency
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Calculate percentage progress
 */
export function calculateProgress(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerUrl(chain: 'SOLANA' | 'BASE', hash: string): string {
  if (chain === 'SOLANA') {
    return `https://solscan.io/tx/${hash}`;
  } else {
    return `https://basescan.org/tx/${hash}`;
  }
}

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Validate Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await sleep(delayMs * Math.pow(2, attempt - 1));
      }
    }
  }
  
  throw lastError!;
}

