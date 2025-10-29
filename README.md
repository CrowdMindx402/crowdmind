# CrowdMind Backend

> **Open-source backend for AI-powered crowdfunding with x402 protocol support**

## 🎯 What This Is

This is the **backend-only** repository for CrowdMind, focusing on:
- **x402 Protocol Implementation** (HTTP 402 Payment Required)
- **Solana Blockchain Integration**
- **AI Agent Autonomous Execution**
- **Demo Mode** (fully functional without database)

**Note**: Frontend UI is proprietary and not included in this repository.

## 🚀 Quick Start (Demo Mode)

No wallet or database needed! Run with one command:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` - everything works!

## 🏗️ Architecture

```
crowdmind-backend/
├── lib/
│   ├── blockchain/      # Solana integration
│   ├── x402/           # HTTP 402 protocol
│   ├── agent/           # AI execution logic
│   └── demo/            # Demo mode infrastructure
├── app/api/             # Next.js API routes
├── scripts/              # Seed & monitor scripts
└── prisma/              # Database schema
```

## 📡 API Endpoints

### Proposals
- `GET /api/proposals` - List all proposals
- `POST /api/proposals` - Create proposal
- `GET /api/proposals/[id]` - Get proposal details
- `POST /api/proposals/[id]/pay` - Get x402 payment instructions
- `POST /api/proposals/[id]/verify` - Verify payment
- `POST /api/proposals/[id]/execute` - Execute via x402 protocol

### Transactions
- `GET /api/transactions` - List all transactions
- `GET /api/agent/status` - Get agent status & balances

## 🔑 x402 Protocol

CrowdMind implements the **HTTP 402 Payment Required** standard:

1. **Proposal Creation** - Define action with funding goal
2. **x402 Payment Instructions** - Server returns payment details
3. **Payment Verification** - On-chain transaction verification
4. **Autonomous Execution** - AI agent executes when funded

All transactions are transparent and verified on-chain.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Database**: SQLite with Prisma ORM
- **Blockchain**: Solana Web3.js
- **Protocol**: x402 Payment Standard
- **Framework**: Next.js 14 (API routes only)

## 📦 Installation (Production)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Solana wallet keys
   ```

3. **Initialize database**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. **Run server**
   ```bash
   npm run dev
   ```

## 🎮 Demo Mode

Demo mode is **enabled by default** for easy testing:

- ✅ All features work without real funds
- ✅ No database setup required
- ✅ No Solana wallet needed
- ✅ Perfect for demos and testing

Toggle in `lib/demo/config.ts`:
```typescript
export const DEMO_MODE = true; // Set to false for production
```

## 📄 License

MIT License - See [LICENSE](./LICENSE) file.

**Note**: Frontend remains proprietary. Only backend is open-source.

## 🤝 Contributing

Contributions welcome! Focus areas:
- x402 protocol enhancements
- Solana integration improvements
- AI agent decision-making
- Demo mode features

## 📞 Support

- **Issues**: GitHub Issues
- **Demo**: Visit your local deployment
- **Docs**: See inline code documentation

---

**Built with ❤️ for decentralized autonomous crowdfunding**

