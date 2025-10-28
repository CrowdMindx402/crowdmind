/**
 * Seed script to populate the database with sample proposals
 * Run with: npx ts-node scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional)
  await prisma.transaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.proposal.deleteMany();

  // Create sample proposals
  const proposals = [
    {
      title: 'Support Open-Source Backend Development',
      description: 'Fund the open-sourcing of backend infrastructure and developer tools that power decentralized applications. These funds will support creating public APIs, SDKs, and developer resources available to everyone.',
      actionType: 'DONATE',
      actionParams: JSON.stringify({
        chain: 'BASE',
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        message: 'Supporting open AI for everyone',
      }),
      goalAmount: 500,
      currentAmount: 375,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    },
    {
      title: 'Buy BONK Tokens for Community Treasury',
      description: 'Purchase BONK tokens to build a community-owned treasury. These tokens will be used for future governance, rewards, and community initiatives. Join us in building a fun, engaging meme economy!',
      actionType: 'BUY_TOKEN',
      actionParams: JSON.stringify({
        chain: 'SOLANA',
        tokenMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
        slippageBps: 50,
      }),
      goalAmount: 250,
      currentAmount: 180,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
    },
    {
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
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
    },
    {
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
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days
    },
    {
      title: 'Deploy Community Governance Token',
      description: 'Launch a decentralized governance token on Base network. Token holders will vote on future proposals, treasury management, and protocol upgrades. This is your chance to shape the future of CrowdMind!',
      actionType: 'DEPLOY_TOKEN',
      actionParams: JSON.stringify({
        chain: 'BASE',
        name: 'CrowdMind Governance',
        symbol: 'CMGOV',
        initialSupply: 1000000,
      }),
      goalAmount: 600,
      currentAmount: 125,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    {
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
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days
    },
  ];

  for (const proposal of proposals) {
    await prisma.proposal.create({
      data: proposal,
    });
  }

  console.log(`✅ Created ${proposals.length} sample proposals`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

