# DePIN Uptime Platform: Developer Guide

This guide provides detailed information for developers working on the DePIN Uptime Platform, including architecture, APIs, development environment setup, and contribution guidelines.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Smart Contract Development](#smart-contract-development)
4. [Frontend Development](#frontend-development)
5. [Node Client Development](#node-client-development)
6. [API Documentation](#api-documentation)
7. [Testing](#testing)
8. [Contribution Guidelines](#contribution-guidelines)
9. [Troubleshooting](#troubleshooting)

## Architecture Overview

The DePIN Uptime Platform consists of three main components:

1. **Smart Contracts**: Solidity contracts deployed on Ethereum blockchain
2. **Frontend Application**: React web application for user interactions
3. **Node Client**: CLI application for validator nodes

### Component Relationships

![Architecture Diagram](../Presentation/Architecture.png)

The platform implements a decentralized architecture where:

- Smart contracts store all monitoring data and handle token rewards
- Frontend provides interfaces for website owners and node operators
- Node client runs on validator nodes to check websites and report statuses

For a more detailed technical architecture overview, see [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md).

## Development Environment Setup

### Prerequisites

- Node.js v16+
- NPM v8+
- Git
- MetaMask or another Ethereum wallet
- Code editor (VSCode recommended)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/dpin-uptime.git
   cd dpin-uptime
   ```

2. Install root project dependencies:
   ```bash
   npm install
   ```

3. Set up Hardhat for local blockchain development:
   ```bash
   npm run node
   ```
   This starts a local Hardhat node on port 8545.

4. Deploy contracts to the local node (in a new terminal):
   ```bash
   npm run deploy
   ```

5. Set up frontend and node-client components:
   ```bash
   # Frontend setup
   cd frontend
   npm install
   npm run dev
   
   # Node client setup
   cd ../node-client
   npm install
   cp .env.example .env
   ```

6. Verify the setup by running the end-to-end workflow test:
   ```bash
   cd ..
   npm run test:workflow
   ```

### Project Structure

```
dpin-uptime/
├── contracts/            # Smart contract source files
│   ├── ConsensusEngine.sol
│   ├── NodeRegistry.sol
│   ├── ReputationSystem.sol
│   ├── RewardDistribution.sol
│   ├── StatusReport.sol
│   ├── UptimeToken.sol
│   └── WebsiteRegistry.sol
├── frontend/             # Frontend application
│   ├── public/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── contracts/    # Contract ABIs and addresses
│       ├── pages/        # Page components
│       ├── services/     # Service layer for API/contract interactions
│       ├── App.jsx       # Main application component
│       └── main.jsx      # Application entry point
├── node-client/          # CLI client for validators
│   ├── commands/         # Command implementations
│   ├── contracts/        # Contract interfaces
│   ├── services/         # Service layer
│   ├── utils/            # Utility functions
│   └── index.js          # Entry point
├── scripts/              # Deployment and utility scripts
├── test/                 # Test files
├── hardhat.config.js     # Hardhat configuration
└── package.json          # Project dependencies
```

## Smart Contract Development

The smart contracts are written in Solidity and deployed using Hardhat.

### Contract Structure

The platform uses a modular design with the following key contracts:

1. **WebsiteRegistry**: Manages website registrations
2. **NodeRegistry**: Manages validator node registrations
3. **StatusReport**: Stores website status reports
4. **ConsensusEngine**: Processes reports for consensus
5. **ReputationSystem**: Tracks validator reliability
6. **RewardDistribution**: Handles token rewards
7. **UptimeToken**: ERC-20 token implementation

### Development Workflow

1. Make changes to contract files in the `contracts/` directory
2. Compile the contracts:
   ```bash
   npx hardhat compile
   ```
3. Run contract tests:
   ```bash
   npx hardhat test
   ```
4. Deploy to a local Hardhat node:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Extending Smart Contracts

When adding new functionality to smart contracts:

1. Ensure backwards compatibility when possible
2. Add comprehensive tests for new features
3. Document all public functions with NatSpec comments
4. Update ABIs in the frontend and node client
5. Consider gas optimization for frequent operations

## Frontend Development

The frontend is built with React, Vite, and Material UI.

### Setup for Frontend Development

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Key Frontend Components

The main components of the frontend include:

- **Web3Provider**: Manages blockchain connection
- **Pages**: Home, Dashboard, WebsiteOwner, NodeOperator
- **Components**: Reusable UI elements
- **Services**: Contract interaction and business logic

### Adding New Features

When adding features to the frontend:

1. Create new components in the `src/components/` directory
2. Add new pages in the `src/pages/` directory
3. Update routing in `App.jsx` if necessary
4. Add service methods in appropriate service files
5. Follow the established design patterns and styling

### Contract Interaction

The frontend interacts with smart contracts through service layers:

```javascript
// Example service method in src/services/websiteService.js
async function registerWebsite(name, url, description, checkFrequency) {
  const { contract, signer } = await getContractWithSigner('WebsiteRegistry');
  const tx = await contract.registerWebsite(url, name);
  const receipt = await tx.wait();
  return receipt;
}
```

### Styling Guidelines

The frontend uses Material UI with a custom theme:

1. Use the theme colors and components for consistency
2. Apply responsive design principles
3. Follow accessibility guidelines
4. Use styled components for custom styling

## Node Client Development

The node client is a CLI application for validator nodes.

### Setup for Node Client Development

1. Navigate to the node-client directory:
   ```bash
   cd node-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a development `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your local development settings.

### Command Structure

The node client uses Commander.js for command parsing:

```javascript
// Example command definition
program
  .command('check')
  .description('Check a specific website status')
  .requiredOption('--website-id <id>', 'Website ID to check')
  .requiredOption('--node-id <id>', 'Node ID to use for checking')
  .action(async (options) => {
    // Command implementation
  });
```

### Adding New Commands

To add a new command to the node client:

1. Create a new file in the `commands/` directory
2. Define the command using Commander.js
3. Implement the command logic
4. Register the command in `index.js`
5. Add tests for the command
6. Document the command in the README.md

### Background Service Mode

The node client can run in background service mode:

```javascript
// Example background service implementation
async function startMonitoring(nodeId, interval) {
  // Load active websites
  const websites = await websiteService.getActiveWebsites();
  
  // Set up checking interval
  setInterval(async () => {
    for (const website of websites) {
      try {
        const status = await checkWebsite(website.url);
        await reportService.submitReport(website.id, nodeId, status);
      } catch (error) {
        logger.error(`Error checking website ${website.id}: ${error.message}`);
      }
    }
  }, interval * 60 * 1000);
}
```

## API Documentation

### Smart Contract APIs

#### WebsiteRegistry Contract

```solidity
// Register a new website
function registerWebsite(string calldata url, string calldata name) external returns (uint256)

// Update website information
function updateWebsite(uint256 websiteId, string calldata url, string calldata name, bool active) external

// Set website active status
function setWebsiteActive(uint256 websiteId, bool active) external

// Get websites by owner
function getWebsitesByOwner(address owner) external view returns (uint256[] memory)

// Get website details
function getWebsiteDetails(uint256 websiteId) external view returns (
    string memory url,
    string memory name,
    address owner,
    bool active,
    uint256 registrationTime,
    uint256 lastCheckTime
)
```

#### NodeRegistry Contract

```solidity
// Register a new node
function registerNode(string calldata name, string calldata endpoint) external returns (uint256)

// Update node information
function updateNode(uint256 nodeId, string calldata name, string calldata endpoint, bool active) external

// Set node active status
function setNodeActive(uint256 nodeId, bool active) external

// Record a new report submission
function recordReport(uint256 nodeId) external

// Get nodes by owner
function getNodesByOwner(address owner) external view returns (uint256[] memory)

// Get node details
function getNodeDetails(uint256 nodeId) external view returns (
    string memory name,
    string memory endpoint,
    address owner,
    bool active,
    uint256 registrationTime,
    uint256 lastReportTime,
    uint256 reportsSubmitted
)
```

#### StatusReport Contract

```solidity
// Submit a new status report
function submitReport(
    uint256 websiteId,
    uint256 nodeId,
    Status status,
    uint256 responseTime,
    string calldata statusMessage
) external returns (uint256)

// Get the latest report for a website
function getLatestReport(uint256 websiteId) external view returns (
    uint256 reportId,
    Status status,
    uint256 responseTime,
    uint256 timestamp,
    string memory statusMessage
)

// Get recent reports for a website
function getRecentReports(uint256 websiteId, uint256 count) external view returns (uint256[] memory)
```

### Frontend Service APIs

The frontend provides service layers that abstract contract interactions:

#### WebsiteService

```javascript
// Register a new website
async function registerWebsite(name, url, description, checkFrequency) { ... }

// Get websites owned by the current user
async function getMyWebsites() { ... }

// Update a website's information
async function updateWebsite(websiteId, name, url, description, active) { ... }

// Get website details
async function getWebsiteDetails(websiteId) { ... }

// Get website statistics
async function getWebsiteStats(websiteId) { ... }
```

#### NodeService

```javascript
// Register a new node
async function registerNode(name, endpoint) { ... }

// Get nodes owned by the current user
async function getMyNodes() { ... }

// Update a node's information
async function updateNode(nodeId, name, endpoint, active) { ... }

// Get node details
async function getNodeDetails(nodeId) { ... }

// Get node statistics
async function getNodeStats(nodeId) { ... }
```

#### ReportService

```javascript
// Get the latest status for a website
async function getLatestStatus(websiteId) { ... }

// Get historical status reports
async function getStatusHistory(websiteId, timeRange) { ... }

// Get consensus status across all validators
async function getConsensusStatus(websiteId) { ... }
```

### Node Client APIs

The node client provides APIs for validator operations:

#### WebsiteService

```javascript
// Get all active websites
async function getActiveWebsites() { ... }

// Get website details
async function getWebsiteDetails(websiteId) { ... }
```

#### ReportService

```javascript
// Submit a status report
async function submitReport(websiteId, nodeId, status, responseTime, message) { ... }

// Get recent reports submitted by a node
async function getNodeReports(nodeId, count) { ... }
```

#### StatusChecker

```javascript
// Check a website's status
async function checkWebsite(url, timeout) { ... }

// Parse the HTTP response
function parseStatus(response, responseTime) { ... }
```

## Testing

The project uses various testing methodologies for different components.

### Smart Contract Testing

Contract tests are written using Hardhat's testing framework:

```javascript
// Example contract test
describe("WebsiteRegistry", function() {
  let websiteRegistry;
  let owner, user;
  
  beforeEach(async function() {
    const WebsiteRegistry = await ethers.getContractFactory("WebsiteRegistry");
    [owner, user] = await ethers.getSigners();
    websiteRegistry = await WebsiteRegistry.deploy();
    await websiteRegistry.deployed();
  });
  
  it("Should register a website", async function() {
    await websiteRegistry.connect(user).registerWebsite("https://example.com", "Example Site");
    const websites = await websiteRegistry.getWebsitesByOwner(user.address);
    expect(websites.length).to.equal(1);
  });
});
```

Run contract tests with:

```bash
npx hardhat test
```

### Frontend Testing

Frontend tests use React Testing Library and Jest:

```javascript
// Example frontend component test
import { render, screen } from '@testing-library/react';
import WebsiteList from './WebsiteList';

test('renders a list of websites', async () => {
  const websites = [
    { id: 1, name: 'Example Site', url: 'https://example.com', active: true }
  ];
  
  render(<WebsiteList websites={websites} />);
  
  expect(screen.getByText('Example Site')).toBeInTheDocument();
  expect(screen.getByText('https://example.com')).toBeInTheDocument();
  expect(screen.getByRole('switch')).toBeChecked();
});
```

Run frontend tests with:

```bash
cd frontend
npm test
```

### Node Client Testing

Node client tests use Mocha and Chai:

```javascript
// Example node client test
const { expect } = require('chai');
const { checkWebsite } = require('../utils/statusChecker');

describe('Status Checker', function() {
  it('should check a website and return online status', async function() {
    const result = await checkWebsite('https://example.com', 5000);
    expect(result.status).to.be.oneOf([1, 3]); // Online or Degraded
    expect(result.responseTime).to.be.a('number');
  });
});
```

Run node client tests with:

```bash
cd node-client
npm test
```

### End-to-End Testing

The project includes end-to-end workflow tests:

```bash
npm run test:workflow
```

This executes a complete workflow from contract deployment to status reporting.

## Contribution Guidelines

### Code Style and Standards

- **Smart Contracts**: Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **JavaScript**: Use ESLint with Airbnb configuration
- **React**: Follow functional component patterns with hooks
- **Documentation**: Use JSDoc for code documentation

### Pull Request Process

1. Fork the repository and create a feature branch
2. Make your changes and add appropriate tests
3. Ensure all tests pass: `npm run test:all`
4. Update documentation for your changes
5. Submit a pull request with a clear description
6. Wait for code review and address any feedback

### Commit Message Format

Use conventional commit format:

```
type(scope): short description

Longer description with details if needed.

Fixes #123 (issue reference)
```

Types: feat, fix, docs, style, refactor, perf, test, chore

### Branch Naming

Use descriptive branch names with the following format:

```
type/short-description
```

Examples:
- `feat/add-email-notifications`
- `fix/resolve-contract-error`
- `docs/update-api-docs`

## Troubleshooting

### Common Development Issues

#### Smart Contract Deployment Failures

**Problem**: Contracts fail to deploy to local Hardhat node.

**Solutions**:
1. Ensure Hardhat node is running: `npm run node`
2. Check for compilation errors: `npx hardhat compile`
3. Verify account has sufficient ETH: `npx hardhat accounts`
4. Delete artifacts and cache: `rm -rf artifacts cache`

#### Frontend Contract Connection Issues

**Problem**: Frontend cannot connect to contracts.

**Solutions**:
1. Verify contract addresses match in `frontend/src/contracts/config.js`
2. Check that MetaMask is connected to correct network
3. Confirm ABIs are up to date: `npm run sync:abis`
4. Check browser console for errors

#### Node Client Configuration Problems

**Problem**: Node client fails to connect to contracts.

**Solutions**:
1. Verify .env file contains correct contract addresses
2. Check that private key is valid
3. Ensure Hardhat node is running
4. Validate RPC URL is accessible

### Development Tools

#### Contract Interaction via Hardhat Console

For direct contract interaction:

```bash
npx hardhat console --network localhost

# Example interaction
> const WebsiteRegistry = await ethers.getContractFactory("WebsiteRegistry")
> const websiteRegistry = await WebsiteRegistry.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3")
> await websiteRegistry.registerWebsite("https://example.com", "Example")
```

#### Frontend Debugging

Use React Developer Tools browser extension for component debugging.

For contract interaction debugging:

```javascript
// Add debug logging to services
async function registerWebsite(...args) {
  console.log('Registering website with args:', args);
  try {
    const result = await actualImplementation(...args);
    console.log('Registration result:', result);
    return result;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
```

#### Node Client Logging

Increase log detail level in `.env`:

```
LOG_LEVEL=debug
```

This will provide more verbose output in `node-client.log`.

## Conclusion

This developer guide provides a comprehensive overview of developing for the DePIN Uptime Platform. By following the guidelines and using the provided tools, you can contribute effectively to the project's continued development.

For further assistance, refer to the project's GitHub issues page or join the community discussion forums. Happy coding! 