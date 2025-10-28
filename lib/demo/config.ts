/**
 * Demo mode configuration
 */

export const DEMO_MODE = true; // Set to true for public demo

export const DEMO_CONFIG = {
  // Auto-approve all payments
  AUTO_APPROVE_PAYMENTS: true,
  
  // Simulate transaction delays
  SIMULATE_DELAYS: true,
  
  // Show demo banner
  SHOW_DEMO_BANNER: true,
  
  // Allow test wallet generation
  ALLOW_TEST_WALLETS: true,
  
  // Auto-generate transaction hashes
  AUTO_GENERATE_TX_HASH: true,
};

export function isDemoMode(): boolean {
  return DEMO_MODE === true;
}

