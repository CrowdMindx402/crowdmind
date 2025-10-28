import { prisma } from '@/lib/db';
import { getBlockchainClient } from '@/lib/blockchain';
import type { 
  ActionType, 
  ProposalActionParams, 
  ExecutionResult,
  ChainType 
} from '@/types';

export class AgentExecutor {
  private autoExecute: boolean;

  constructor() {
    this.autoExecute = process.env.AGENT_AUTO_EXECUTE === 'true';
  }

  /**
   * Check if a proposal is ready for execution
   */
  async canExecuteProposal(proposalId: string): Promise<{
    ready: boolean;
    reason: string;
  }> {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return { ready: false, reason: 'Proposal not found' };
    }

    if (proposal.status !== 'ACTIVE' && proposal.status !== 'FUNDED') {
      return { ready: false, reason: `Proposal status is ${proposal.status}` };
    }

    // Check if goal amount is reached
    if (proposal.currentAmount < proposal.goalAmount) {
      return { 
        ready: false, 
        reason: `Current funding ${proposal.currentAmount} USDC is below goal ${proposal.goalAmount} USDC` 
      };
    }

    // Check deadline if set
    if (proposal.deadline && new Date() > proposal.deadline) {
      return { ready: false, reason: 'Deadline has passed' };
    }

    return { ready: true, reason: 'Proposal is ready for execution' };
  }

  /**
   * Execute a proposal based on its action type
   */
  async executeProposal(proposalId: string): Promise<ExecutionResult> {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
      });

      if (!proposal) {
        return {
          success: false,
          error: 'Proposal not found',
          timestamp: new Date().toISOString(),
        };
      }

      // Check if ready for execution
      const canExecute = await this.canExecuteProposal(proposalId);
      if (!canExecute.ready) {
        return {
          success: false,
          error: canExecute.reason,
          timestamp: new Date().toISOString(),
        };
      }

      // Update status to EXECUTING
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'EXECUTING' },
      });

      // Parse action parameters
      const actionParams = JSON.parse(proposal.actionParams);
      const actionType = proposal.actionType as ActionType;

      // Execute based on action type
      let result: ExecutionResult;

      switch (actionType) {
        case 'BUY_TOKEN':
          result = await this.executeBuyToken(proposalId, actionParams);
          break;
        case 'DONATE':
          result = await this.executeDonate(proposalId, actionParams);
          break;
        case 'JUPITER_SWAP':
          result = await this.executeJupiterSwap(proposalId, actionParams);
          break;
        case 'MINT_NFT':
          result = await this.executeMintNFT(proposalId, actionParams);
          break;
        case 'DEPLOY_TOKEN':
          result = await this.executeDeployToken(proposalId, actionParams);
          break;
        case 'FUND_COMPUTE':
          result = await this.executeFundCompute(proposalId, actionParams);
          break;
        default:
          result = {
            success: false,
            error: `Unsupported action type: ${actionType}`,
            timestamp: new Date().toISOString(),
          };
      }

      // Update proposal with execution result
      await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          status: result.success ? 'EXECUTED' : 'FAILED',
          executionTxHash: result.transactionHash,
          executionReceipt: JSON.stringify(result.receipt || {}),
        },
      });

      // Record transaction
      if (result.transactionHash) {
        await prisma.transaction.create({
          data: {
            proposalId,
            type: 'EXECUTION',
            chain: actionParams.chain || 'SOLANA',
            transactionHash: result.transactionHash,
            fromAddress: this.getAgentAddress(actionParams.chain || 'SOLANA'),
            toAddress: actionParams.recipientAddress || actionParams.tokenMint || 'N/A',
            amount: proposal.currentAmount,
            status: result.success ? 'CONFIRMED' : 'FAILED',
            metadata: JSON.stringify(result),
          },
        });
      }

      return result;
    } catch (error) {
      console.error('Error executing proposal:', error);
      
      // Update proposal status to FAILED
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'FAILED' },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async executeBuyToken(
    proposalId: string,
    params: ProposalActionParams['BUY_TOKEN']
  ): Promise<ExecutionResult> {
    // This would integrate with a DEX like Jupiter on Solana
    return {
      success: false,
      error: 'BUY_TOKEN execution not yet implemented',
      timestamp: new Date().toISOString(),
    };
  }

  private async executeDonate(
    proposalId: string,
    params: ProposalActionParams['DONATE']
  ): Promise<ExecutionResult> {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
      });

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      const client = getBlockchainClient(params.chain);
      const txHash = await client.sendUSDC(params.recipientAddress, proposal.currentAmount);

      return {
        success: true,
        transactionHash: txHash,
        receipt: {
          recipient: params.recipientAddress,
          amount: proposal.currentAmount,
          message: params.message,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async executeJupiterSwap(
    proposalId: string,
    params: ProposalActionParams['JUPITER_SWAP']
  ): Promise<ExecutionResult> {
    return {
      success: false,
      error: 'JUPITER_SWAP execution not yet implemented',
      timestamp: new Date().toISOString(),
    };
  }

  private async executeMintNFT(
    proposalId: string,
    params: ProposalActionParams['MINT_NFT']
  ): Promise<ExecutionResult> {
    return {
      success: false,
      error: 'MINT_NFT execution not yet implemented',
      timestamp: new Date().toISOString(),
    };
  }

  private async executeDeployToken(
    proposalId: string,
    params: ProposalActionParams['DEPLOY_TOKEN']
  ): Promise<ExecutionResult> {
    return {
      success: false,
      error: 'DEPLOY_TOKEN execution not yet implemented',
      timestamp: new Date().toISOString(),
    };
  }

  private async executeFundCompute(
    proposalId: string,
    params: ProposalActionParams['FUND_COMPUTE']
  ): Promise<ExecutionResult> {
    return {
      success: false,
      error: 'FUND_COMPUTE execution not yet implemented',
      timestamp: new Date().toISOString(),
    };
  }

  private getAgentAddress(chain: ChainType): string {
    const client = getBlockchainClient(chain);
    return client.getWalletAddress();
  }

  /**
   * Monitor all active proposals and auto-execute if enabled
   */
  async monitorAndExecute(): Promise<void> {
    if (!this.autoExecute) {
      return;
    }

    try {
      const activeProposals = await prisma.proposal.findMany({
        where: {
          status: { in: ['ACTIVE', 'FUNDED'] },
        },
      });

      for (const proposal of activeProposals) {
        const canExecute = await this.canExecuteProposal(proposal.id);
        
        if (canExecute.ready) {
          console.log(`Auto-executing proposal ${proposal.id}: ${proposal.title}`);
          await this.executeProposal(proposal.id);
        }
      }
    } catch (error) {
      console.error('Error monitoring proposals:', error);
    }
  }
}

export const agentExecutor = new AgentExecutor();

