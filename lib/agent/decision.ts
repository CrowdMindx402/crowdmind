import type { AgentDecision } from '@/types';
import { prisma } from '@/lib/db';

/**
 * AI Agent decision-making logic
 * This is a simple rule-based system, but could be enhanced with LLM integration
 */
export class AgentDecisionMaker {
  /**
   * Decide whether a proposal should be executed
   */
  async makeDecision(proposalId: string): Promise<AgentDecision> {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        payments: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    if (!proposal) {
      return {
        proposalId,
        shouldExecute: false,
        reason: 'Proposal not found',
        confidence: 0,
      };
    }

    // Check funding threshold
    const fundingRatio = proposal.currentAmount / proposal.goalAmount;
    
    if (fundingRatio < 1.0) {
      return {
        proposalId,
        shouldExecute: false,
        reason: `Funding at ${(fundingRatio * 100).toFixed(1)}% of goal`,
        confidence: 0,
      };
    }

    // Check deadline
    if (proposal.deadline && new Date() > proposal.deadline) {
      return {
        proposalId,
        shouldExecute: false,
        reason: 'Deadline has passed',
        confidence: 0,
      };
    }

    // Check number of contributors (diversity of support)
    const uniqueContributors = new Set(proposal.payments.map(p => p.payerAddress)).size;
    
    if (uniqueContributors < 3) {
      return {
        proposalId,
        shouldExecute: false,
        reason: 'Need at least 3 unique contributors for decentralization',
        confidence: 0.3,
      };
    }

    // Calculate confidence based on multiple factors
    let confidence = 0.5; // Base confidence

    // Higher confidence with more contributors
    confidence += Math.min(0.2, uniqueContributors * 0.02);

    // Higher confidence if significantly over-funded
    if (fundingRatio > 1.5) {
      confidence += 0.2;
    } else if (fundingRatio > 1.2) {
      confidence += 0.1;
    }

    // Lower confidence if action type is risky
    const riskyActions = ['DEPLOY_TOKEN', 'CUSTOM'];
    if (riskyActions.includes(proposal.actionType)) {
      confidence -= 0.1;
    }

    // Normalize confidence to 0-1 range
    confidence = Math.max(0, Math.min(1, confidence));

    const shouldExecute = confidence >= 0.6;

    return {
      proposalId,
      shouldExecute,
      reason: shouldExecute
        ? `Ready to execute with ${uniqueContributors} contributors and ${fundingRatio.toFixed(1)}x funding`
        : `Confidence ${(confidence * 100).toFixed(0)}% is below 60% threshold`,
      confidence,
    };
  }

  /**
   * Get recommendations for new proposals
   */
  async generateProposalRecommendations(): Promise<string[]> {
    // This is a placeholder for AI-generated proposal recommendations
    // Could integrate with OpenAI API or similar
    return [
      'Buy BONK tokens - Popular meme coin with community support',
      'Donate to open-source projects - Support public goods',
      'Launch AI compute cluster - Fund distributed AI infrastructure',
      'Create NFT collection - Mint commemorative NFTs for supporters',
    ];
  }

  /**
   * Analyze proposal viability
   */
  async analyzeProposal(proposalId: string): Promise<{
    viable: boolean;
    risks: string[];
    opportunities: string[];
  }> {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return {
        viable: false,
        risks: ['Proposal not found'],
        opportunities: [],
      };
    }

    const risks: string[] = [];
    const opportunities: string[] = [];

    // Analyze based on action type
    switch (proposal.actionType) {
      case 'BUY_TOKEN':
        risks.push('Market volatility', 'Liquidity risks', 'Smart contract vulnerabilities');
        opportunities.push('Potential price appreciation', 'Community engagement');
        break;
      case 'DONATE':
        opportunities.push('Positive social impact', 'Community goodwill');
        risks.push('Recipient verification needed');
        break;
      case 'DEPLOY_TOKEN':
        risks.push('Regulatory concerns', 'Technical complexity', 'Market saturation');
        opportunities.push('Token utility', 'Community building');
        break;
      default:
        risks.push('Unknown action type risks');
    }

    // Check funding feasibility
    if (proposal.goalAmount > 10000) {
      risks.push('High funding goal may be difficult to achieve');
    }

    if (proposal.deadline) {
      const daysUntilDeadline = (proposal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilDeadline < 7) {
        risks.push('Short deadline may limit participation');
      }
    }

    const viable = risks.length <= opportunities.length;

    return { viable, risks, opportunities };
  }
}

export const agentDecisionMaker = new AgentDecisionMaker();

