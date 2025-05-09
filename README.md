# DePIN Uptime Platform

A decentralized website uptime monitoring platform leveraging blockchain technology.

## Project Overview

The DePIN Uptime Platform is a decentralized solution for website uptime monitoring that uses blockchain technology to ensure transparency, reliability, and incentivization. The platform allows:

- Website owners to register their sites for monitoring
- Node operators to run validator nodes that check website status
- A consensus mechanism to validate reports from multiple nodes
- Token-based incentives for honest reporting
- Reputation system to track validator reliability

## Project Structure

- `/contracts` - Smart contracts for the platform (Solidity)
- `/frontend` - React/Vite frontend application
- `/node-client` - Node.js client for website uptime checking
- `/scripts` - Deployment and utility scripts
- `/config` - Configuration files for contract addresses

## Quick Start

For detailed setup instructions, see the [SETUP.md](SETUP.md) guide.

### Prerequisites

- Node.js (v16+)
- NPM (v8+)
- MetaMask or similar Ethereum wallet
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-repo/dpin-uptime.git
cd dpin-uptime
npm install
```

### Launch the Platform

1. Start a local Hardhat node:
   ```bash
   npm run node
   ```

2. Deploy contracts and sync configuration:
   ```bash
   npm run deploy
   ```

3. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Set up the node client:
   ```bash
   cd node-client
   npm install
   cp .env.example .env
   ```

### Test the Workflow

To verify all components are working correctly:
```bash
npm run test:workflow
```

## Available Scripts

### Core Scripts

- `npm run node` - Start a local Hardhat node
- `npm run deploy` - Deploy contracts and sync configuration
- `npm run test` - Run contract tests
- `npm run test:workflow` - Run end-to-end workflow test

### Utility Scripts

- `npm run verify:node` - Verify Hardhat node is running correctly
- `npm run verify:interfaces` - Validate frontend service and contract interfaces
- `npm run sync:abis` - Synchronize contract ABIs across components
- `npm run sync:addresses` - Synchronize contract addresses across components
- `npm run check:config` - Check configuration of all components

## Troubleshooting

See [SETUP.md](SETUP.md) for a comprehensive troubleshooting guide.

Common issues:
- Hardhat node not running
- MetaMask not connected to the correct network
- Contract address mismatch between components
- ABI synchronization issues

## Development Workflow

1. Start the Hardhat node: `npm run node`
2. Deploy contracts: `npm run deploy`
3. Start the frontend: `cd frontend && npm run dev`
4. Set up the node client: See node-client README

After making changes to contracts:
1. Redeploy: `npm run deploy`
2. Or sync ABIs manually: `npm run sync:abis`

## License

MIT
