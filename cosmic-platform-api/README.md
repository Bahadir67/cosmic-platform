# cosmic-platform-api

Cosmic Platform - Api Repository

## 🌌 Overview

Api layer of the Cosmic Platform - a federated social platform treating content as living entities in a cosmic ecosystem.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Development
pnpm dev
```

## 📁 Project Structure

```
cosmic-platform-api/
├── src/           # Source code
├── tests/         # Test files  
├── docs/          # Documentation
└── README.md      # This file
```

## 🛠️ Technology Stack


- **Runtime**: Node.js 18+
- **Framework**: Fastify + TypeScript
- **Database**: PostgreSQL + Prisma
- **Authentication**: JWT
- **AI**: Claude API (Aether)
- **Testing**: Jest

## 🔧 Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Setup database
pnpm prisma:migrate
pnpm prisma:generate

# Start development server
pnpm dev
```

## 📊 API Documentation

API documentation will be available at `/docs` when the server is running.


## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Add tests
4. Submit pull request

## 📜 License

MIT License - see LICENSE file for details

## 🌟 Related Repositories

- [cosmic-platform-api](../cosmic-platform-api) - Backend API
- [cosmic-platform-web](../cosmic-platform-web) - Frontend App  
- [cosmic-platform-shared](../cosmic-platform-shared) - Shared Types
- [cosmic-platform-docs](../cosmic-platform-docs) - Documentation

---

🌌 **Cosmic Platform** - Every mind is a universe. Every share is a trace.
