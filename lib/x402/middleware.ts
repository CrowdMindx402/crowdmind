import { NextRequest, NextResponse } from 'next/server';
import { x402Protocol } from './protocol';
import type { ChainType } from '@/types';

/**
 * Middleware to handle x402 payment verification
 */
export async function requirePayment(
  request: NextRequest,
  proposalId: string,
  requiredAmount: number,
  chain: ChainType
): Promise<NextResponse | null> {
  const { chain: proofChain, transactionHash } = x402Protocol.parsePaymentProof(request.headers);

  if (!proofChain || !transactionHash) {
    // No payment proof provided, return 402 with instructions
    const instructions = x402Protocol.generatePaymentInstructions(
      proposalId,
      chain,
      requiredAmount
    );
    return new NextResponse(JSON.stringify(instructions), {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': `x402 realm="CrowdMind", currency="USDC"`,
      },
    });
  }

  if (proofChain !== chain) {
    return NextResponse.json(
      { error: 'Invalid payment chain' },
      { status: 400 }
    );
  }

  // Verify the payment
  const verification = await x402Protocol.verifyPayment(
    proofChain,
    transactionHash,
    requiredAmount,
    '' // Recipient address will be fetched by the protocol
  );

  if (!verification.verified) {
    return NextResponse.json(
      { error: 'Payment verification failed', details: verification.error },
      { status: 402 }
    );
  }

  // Payment verified, allow the request to proceed
  return null;
}

/**
 * Helper to create x402 response
 */
export function createPaymentRequiredResponse(
  proposalId: string,
  chain: ChainType,
  amount: number
): NextResponse {
  const instructions = x402Protocol.generatePaymentInstructions(proposalId, chain, amount);
  return new NextResponse(JSON.stringify(instructions), {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'WWW-Authenticate': `x402 realm="CrowdMind", currency="USDC"`,
    },
  });
}

