/**
 * Client-side storage for demo mode
 * Everything resets on page refresh - no database needed!
 */

export interface DemoProposal {
  id: string;
  title: string;
  description: string;
  actionType: string;
  actionParams: string;
  goalAmount: number;
  currentAmount: number;
  status: string;
  deadline: string | null;
  executionTxHash: string | null;
  executionReceipt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DemoPayment {
  id: string;
  proposalId: string;
  chain: string;
  amount: number;
  payerAddress: string;
  transactionHash: string;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
}

export interface DemoTransaction {
  id: string;
  proposalId: string | null;
  type: string;
  chain: string;
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  status: string;
  metadata: string | null;
  createdAt: string;
}

class DemoStorage {
  private proposals: Map<string, DemoProposal> = new Map();
  private payments: Map<string, DemoPayment> = new Map();
  private transactions: Map<string, DemoTransaction> = new Map();
  private initialized = false;

  constructor() {
    // Initialize with seed data immediately (server-side only)
    if (typeof window === 'undefined') {
      if (!this.initialized) {
        this.initializeSeedData();
      }
    }
  }

  // Force initialization (call this on first API access)
  ensureInitialized() {
    if (!this.initialized) {
      this.initializeSeedData();
    }
  }

  private initializeSeedData() {
    if (this.initialized) return;
    this.initialized = true;

    // Seed proposals - 12 diverse examples with realistic funding
    const seedProposals: DemoProposal[] = [
      {
        id: 'demo-1',
        title: 'Support Open-Source Backend Development',
        description: 'Fund the open-sourcing of backend infrastructure and developer tools that power decentralized applications. These funds will support creating public APIs, SDKs, and developer resources available to everyone.',
        actionType: 'DONATE',
        actionParams: JSON.stringify({
          chain: 'SOLANA',
          recipientAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          message: 'Open-source backend for everyone',
        }),
        goalAmount: 500,
        currentAmount: 375,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-2',
        title: 'Buy BONK Tokens for Community Treasury',
        description: 'Purchase BONK tokens to build a community-owned treasury. These tokens will be used for future governance, rewards, and community initiatives. Join us in building a fun, engaging meme economy!',
        actionType: 'BUY_TOKEN',
        actionParams: JSON.stringify({
          chain: 'SOLANA',
          tokenMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
          slippageBps: 50,
        }),
        goalAmount: 250,
        currentAmount: 180,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-3',
        title: 'Fund GPU Cluster for AI Research',
        description: 'Rent high-performance GPU compute time for running AI models and research. This will enable researchers and developers to experiment with large language models without needing expensive hardware.',
        actionType: 'FUND_COMPUTE',
        actionParams: JSON.stringify({
          provider: 'vast.ai',
          amount: 750,
          duration: '3 months',
        }),
        goalAmount: 750,
        currentAmount: 520,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-4',
        title: 'Launch CrowdMind Genesis NFT',
        description: 'Create a special NFT collection to commemorate the launch of CrowdMind. Early supporters will receive these NFTs as proof of participation. Each NFT represents a unique contribution to the ecosystem.',
        actionType: 'MINT_NFT',
        actionParams: JSON.stringify({
          chain: 'SOLANA',
          name: 'CrowdMind Genesis',
          symbol: 'CMIND',
          uri: 'https://example.com/metadata.json',
        }),
        goalAmount: 150,
        currentAmount: 95,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-5',
        title: 'Deploy Community Governance Token',
        description: 'Launch a decentralized governance token on Solana. Token holders will vote on future proposals, treasury management, and protocol upgrades. This is your chance to shape the future of CrowdMind!',
        actionType: 'DEPLOY_TOKEN',
        actionParams: JSON.stringify({
          chain: 'SOLANA',
          name: 'CrowdMind Governance',
          symbol: 'CMGOV',
          initialSupply: 1000000,
        }),
        goalAmount: 600,
        currentAmount: 125,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-6',
        title: 'Climate Action: Carbon Offset Fund',
        description: 'Support verified carbon offset projects to combat climate change. Every dollar funds tree planting, renewable energy, and carbon capture initiatives. Make a real environmental impact!',
        actionType: 'DONATE',
        actionParams: JSON.stringify({
          chain: 'SOLANA',
          recipientAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          message: 'For a sustainable future',
        }),
        goalAmount: 300,
        currentAmount: 45,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-7',
        title: 'Build Decentralized Social Media',
        description: 'Fund the development of a censorship-resistant social platform on Solana. This will create a space where users truly own their content and data. Join the Web3 revolution!',
        actionType: 'FUND_COMPUTE',
        actionParams: JSON.stringify({
          provider: 'runpod.io',
          amount: 400,
          duration: '2 months',
        }),
        goalAmount: 400,
        currentAmount: 280,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-8',
        title: 'Education Fund: Coding Bootcamp Scholarships',
        description: 'Provide full scholarships for underrepresented communities to attend blockchain development bootcamps. Investing in education today builds the decentralized future.',
        actionType: 'DONATE',
        actionParams: JSON.stringify({
          chain: 'SOLANA',
          recipientAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          message: 'Education for all',
        }),
        goalAmount: 850,
        currentAmount: 125,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-9',
        title: 'Launch Meme Token: CROWD',
        description: 'Deploy a community-driven meme token with fair launch mechanics. 50% of supply goes to contributors, 30% to liquidity, 20% to treasury. Let\'s make memes great again!',
        actionType: 'DEPLOY_TOKEN',
        actionParams: JSON.stringify({
          chain: 'SOLANA',
          name: 'CrowdToken',
          symbol: 'CROWD',
          initialSupply: 1000000000,
        }),
        goalAmount: 200,
        currentAmount: 55,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-10',
        title: 'Support Independent Journalists',
        description: 'Fund investigative journalism covering crypto, tech, and Web3. Independent media needs community support to remain unbiased and thorough.',
        actionType: 'DONATE',
        actionParams: JSON.stringify({
          chain: 'SOLANA',
          recipientAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          message: 'Truth matters',
        }),
        goalAmount: 175,
        currentAmount: 88,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-11',
        title: 'AI Art Generator Infrastructure',
        description: 'Build and host an AI art generation platform with open-source backend APIs. Free for everyone, no subscription required. Democratize creative AI tools!',
        actionType: 'FUND_COMPUTE',
        actionParams: JSON.stringify({
          provider: 'lambda-labs',
          amount: 950,
          duration: '6 months',
        }),
        goalAmount: 950,
        currentAmount: 320,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-12',
        title: 'Deploy AI Trading Bot Infrastructure',
        description: 'Fund the deployment of autonomous trading bot infrastructure on Solana. This will enable algorithmic trading strategies to execute trades automatically based on AI-driven market analysis and technical indicators.',
        actionType: 'FUND_COMPUTE',
        actionParams: JSON.stringify({
          chain: 'SOLANA',
          computeProvider: 'Akash Network',
          computeUnits: 1000,
          duration: 30,
        }),
        goalAmount: 800,
        currentAmount: 95,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        executionTxHash: null,
        executionReceipt: null,
        createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    seedProposals.forEach(p => this.proposals.set(p.id, p));
  }

  // Proposal operations
  async findProposals(filter?: { status?: string }): Promise<DemoProposal[]> {
    this.ensureInitialized();
    const all = Array.from(this.proposals.values());
    if (filter?.status) {
      return all.filter(p => p.status === filter.status);
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findProposal(id: string): Promise<DemoProposal | null> {
    this.ensureInitialized();
    return this.proposals.get(id) || null;
  }

  async createProposal(data: Omit<DemoProposal, 'id' | 'createdAt' | 'updatedAt'>): Promise<DemoProposal> {
    const proposal: DemoProposal = {
      ...data,
      id: 'demo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  async updateProposal(id: string, data: Partial<DemoProposal>): Promise<DemoProposal | null> {
    const proposal = this.proposals.get(id);
    if (!proposal) return null;
    
    const updated = { ...proposal, ...data, updatedAt: new Date().toISOString() };
    this.proposals.set(id, updated);
    return updated;
  }

  // Payment operations
  async findPayments(proposalId: string): Promise<DemoPayment[]> {
    return Array.from(this.payments.values())
      .filter(p => p.proposalId === proposalId && p.status === 'CONFIRMED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createPayment(data: Omit<DemoPayment, 'id' | 'createdAt'>): Promise<DemoPayment> {
    const payment: DemoPayment = {
      ...data,
      id: 'payment-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async findPaymentByTxHash(txHash: string): Promise<DemoPayment | null> {
    return Array.from(this.payments.values()).find(p => p.transactionHash === txHash) || null;
  }

  // Transaction operations
  async findTransactions(filter?: { proposalId?: string; type?: string }): Promise<DemoTransaction[]> {
    let all = Array.from(this.transactions.values());
    
    if (filter?.proposalId) {
      all = all.filter(t => t.proposalId === filter.proposalId);
    }
    if (filter?.type) {
      all = all.filter(t => t.type === filter.type);
    }
    
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTransaction(data: Omit<DemoTransaction, 'id' | 'createdAt'>): Promise<DemoTransaction> {
    const transaction: DemoTransaction = {
      ...data,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  // Statistics
  async getStatistics() {
    this.ensureInitialized();
    const proposals = Array.from(this.proposals.values());
    const payments = Array.from(this.payments.values()).filter(p => p.status === 'CONFIRMED');
    
    return {
      activeProposals: proposals.filter(p => p.status === 'ACTIVE').length,
      fundedProposals: proposals.filter(p => p.status === 'FUNDED').length,
      executedProposals: proposals.filter(p => p.status === 'EXECUTED').length,
      totalFundsRaised: payments.reduce((sum, p) => sum + p.amount, 0),
      totalTransactions: this.transactions.size,
    };
  }

  // Get contributor count for a proposal
  async getContributorCount(proposalId: string): Promise<number> {
    const payments = await this.findPayments(proposalId);
    const uniqueAddresses = new Set(payments.map(p => p.payerAddress));
    return uniqueAddresses.size;
  }
}

// Singleton instance with global persistence (server-side only, like Prisma)
const globalForDemoStorage = globalThis as unknown as {
  demoStorage: DemoStorage | undefined;
};

export const demoStorage = globalForDemoStorage.demoStorage ?? new DemoStorage();

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  globalForDemoStorage.demoStorage = demoStorage;
}

