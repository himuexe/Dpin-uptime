# DePIN Uptime Platform: Deployment and Operations Guide

This guide provides detailed instructions for deploying and operating the DePIN Uptime Platform in various environments.

## Table of Contents

1. [Overview](#overview)
2. [Deployment Environments](#deployment-environments)
   - [Local Development](#local-development)
   - [Testnet Deployment](#testnet-deployment)
   - [Production Deployment](#production-deployment)
3. [Infrastructure Requirements](#infrastructure-requirements)
4. [Deployment Process](#deployment-process)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)
6. [Backup and Recovery](#backup-and-recovery)
7. [Upgrade Procedures](#upgrade-procedures)
8. [Security Considerations](#security-considerations)

## Overview

The DePIN Uptime Platform consists of three main components that need to be deployed and maintained:

1. **Smart Contracts**: Solidity contracts deployed to the Ethereum blockchain
2. **Frontend Application**: React/Vite application served as a web app
3. **Node Client**: Node.js application for validator nodes

Each component has specific deployment requirements and processes.

## Deployment Environments

### Local Development

The local development environment uses Hardhat's local Ethereum node for blockchain functionality.

#### Prerequisites

- Node.js v16+
- NPM v8+
- Git

#### Deployment Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/dpin-uptime.git
   cd dpin-uptime
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Hardhat local node:
   ```bash
   npm run node
   ```

4. In a new terminal, deploy contracts to the local node:
   ```bash
   npm run deploy
   ```

5. Start the frontend development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. Set up the node client:
   ```bash
   cd ../node-client
   npm install
   cp .env.example .env
   ```

7. Edit the `.env` file to use the Hardhat node and deployed contract addresses
   (The deployment script should automatically update these addresses)

8. Run the end-to-end workflow test:
   ```bash
   cd ..
   npm run test:workflow
   ```

### Testnet Deployment

Deploying to an Ethereum testnet (Goerli, Sepolia) allows for realistic testing with multiple users.

#### Prerequisites

- An Ethereum account with testnet ETH
- Access to a testnet RPC endpoint (Infura, Alchemy, etc.)
- VPS or cloud hosting for the frontend

#### Deployment Steps

1. Configure the Hardhat network settings in `hardhat.config.js`:
   ```javascript
   module.exports = {
     networks: {
       goerli: {
         url: "https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID",
         accounts: [process.env.PRIVATE_KEY]
       }
     }
   };
   ```

2. Create a `.env` file in the project root with your deployment keys:
   ```
   PRIVATE_KEY=your_ethereum_private_key
   INFURA_PROJECT_ID=your_infura_project_id
   ```

3. Deploy contracts to the testnet:
   ```bash
   npx hardhat run scripts/deploy.js --network goerli
   ```

4. Update the frontend contract configuration in `frontend/src/contracts/config.js`
   (The deployment script should handle this automatically)

5. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

6. Deploy the frontend to your hosting service (Netlify, Vercel, AWS, etc.)
   Most services support direct deployment from a GitHub repository.

7. Configure the node client `.env` file with testnet settings:
   ```
   RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=your_ethereum_private_key
   NODE_REGISTRY_ADDRESS=deployed_contract_address
   STATUS_REPORT_ADDRESS=deployed_contract_address
   WEBSITE_REGISTRY_ADDRESS=deployed_contract_address
   REPUTATION_SYSTEM_ADDRESS=deployed_contract_address
   REWARD_DISTRIBUTION_ADDRESS=deployed_contract_address
   ```

8. Distribute the node client to validators with appropriate configuration.

### Production Deployment

For production deployment, you'll deploy to Ethereum mainnet or a high-performance L2 solution.

#### Prerequisites

- An Ethereum account with sufficient ETH for deployment gas
- RPC endpoint with high reliability and performance
- Robust hosting infrastructure for the frontend

#### Deployment Steps

1. Configure the Hardhat network settings for mainnet:
   ```javascript
   module.exports = {
     networks: {
       mainnet: {
         url: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
         accounts: [process.env.PRIVATE_KEY],
         gasPrice: 50000000000 // 50 gwei
       }
     }
   };
   ```

2. Create deployment keys safely guarded for mainnet deployment:
   ```
   PRIVATE_KEY=your_ethereum_private_key
   INFURA_PROJECT_ID=your_infura_project_id
   ```

3. Deploy contracts to mainnet (consider using a multi-sig wallet for management):
   ```bash
   npx hardhat run scripts/deploy.js --network mainnet
   ```

4. Record the deployed contract addresses securely for future reference.

5. Update the frontend configuration to use mainnet addresses.

6. Build and deploy the frontend to enterprise-grade hosting:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

7. Deploy to a CDN-backed hosting service with high availability.

8. Configure a production-ready node client distribution with mainnet settings.

## Infrastructure Requirements

### Smart Contracts

For optimal performance and reliability, your infrastructure should include:

| Component | Recommendation |
|-----------|----------------|
| Ethereum RPC | Dedicated node or premium service (Infura, Alchemy) |
| Gas Strategy | Dynamic gas pricing strategy for efficient transactions |
| Contract Management | Multi-sig wallet for admin operations |

### Frontend Hosting

Production-ready frontend hosting should provide:

| Feature | Recommendation |
|---------|----------------|
| CDN | Global CDN for fast content delivery |
| HTTPS | Secure HTTPS with proper certification |
| Scaling | Auto-scaling based on traffic |
| Redundancy | Multiple region deployment |
| Monitoring | Uptime and performance monitoring |

### Node Client Infrastructure

For validator nodes running the node client:

| Component | Minimum Specs | Recommended Specs |
|-----------|---------------|------------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 50 GB SSD | 100+ GB SSD |
| Network | 100 Mbps | 1 Gbps |
| Uptime | 99% | 99.9%+ |

## Deployment Process

For a streamlined deployment process, follow these steps:

### 1. Pre-Deployment Checklist

- [ ] Review all code and run automated tests
- [ ] Perform security audit of smart contracts
- [ ] Prepare contract parameters for deployment
- [ ] Secure wallet with sufficient funds for deployment
- [ ] Set up appropriate backup mechanisms
- [ ] Configure monitoring tools

### 2. Contract Deployment Sequence

Smart contracts should be deployed in the correct order to maintain dependencies:

1. **UptimeToken**
2. **NodeRegistry**
3. **WebsiteRegistry**
4. **StatusReport**
5. **ReputationSystem**
6. **RewardDistribution**
7. **ConsensusEngine**

After deployment, initialize contracts with appropriate configurations:

```javascript
// Example initialization
await nodeRegistry.setMinimumStake(ethers.utils.parseEther("10"));
await reputationSystem.setInitialReputation(100);
await rewardDistribution.setRewardRate(ethers.utils.parseEther("0.01"));
```

### 3. Configuration Synchronization

Ensure all components have correct contract addresses and network settings:

```bash
# Run the configuration sync script
node scripts/sync-config.js --network mainnet
```

This script should:
- Update frontend contract addresses
- Generate node client configuration templates
- Verify all components can connect to contracts

### 4. Frontend Deployment

Deploy the frontend using a CI/CD pipeline for consistency:

1. Set environment variables for the build
2. Run the build process
3. Execute automated testing on the build
4. Deploy to staging for verification
5. Deploy to production on approval

### 5. Node Client Distribution

For validators to run the node client:

1. Package the node client with deployment-specific configuration
2. Create documentation for validator onboarding
3. Set up a distribution mechanism (download page, npm package, etc.)
4. Provide verification tools for validators to check their setup

## Monitoring and Maintenance

### System Monitoring

Implement comprehensive monitoring for all components:

| Component | Monitoring Metrics |
|-----------|-------------------|
| Smart Contracts | Transaction counts, gas usage, event emissions |
| Frontend | Traffic, errors, load times, user engagement |
| Node Client | Reports submitted, reputation scores, response times |
| Blockchain | Network status, gas prices, confirmation times |

Use monitoring tools like:
- Prometheus and Grafana for metrics collection and visualization
- EthGasStation for gas price monitoring
- Blockchain explorers for transaction verification
- Server monitoring for infrastructure

### Alerting System

Set up alerts for critical issues:

1. **Smart Contract Alerts**:
   - Failed transactions
   - Unusual transaction patterns
   - High gas consumption

2. **Frontend Alerts**:
   - Server errors
   - High response times
   - Connection failures

3. **Node Client Alerts**:
   - Reporting failures
   - Network connectivity issues
   - Reputation score drops

### Regular Maintenance Tasks

Schedule routine maintenance:

| Task | Frequency | Description |
|------|-----------|-------------|
| Contract Auditing | Quarterly | Review contract activity and performance |
| Frontend Updates | Monthly | Apply security patches and feature updates |
| Node Client Updates | Bi-weekly | Distribute client updates to validators |
| Database Cleanup | Weekly | Remove expired or redundant data |
| Performance Review | Monthly | Analyze system performance and optimize |

## Backup and Recovery

### Smart Contract Backups

Smart contracts on the blockchain are immutable, but consider:

1. **Contract Code Archiving**:
   - Store verified contract source code in multiple locations
   - Keep deployment transaction records
   - Document contract ABI and interfaces

2. **State Management**:
   - For upgradeable contracts, create state migration paths
   - Document contract state recovery procedures

### Frontend Backups

Implement robust backup strategies for the frontend:

1. **Code Repository**:
   - Use version control with regular backups
   - Archive releases with tags

2. **Configuration Backups**:
   - Back up environment files securely
   - Document environment variables

3. **User Data**:
   - If storing off-chain user data, implement database backups
   - Create data recovery procedures

### Recovery Procedures

Document and test recovery procedures for different scenarios:

1. **Frontend Failure**:
   - Roll back to previous stable version
   - Deploy from backup to alternate hosting

2. **Node Client Issues**:
   - Provide recovery procedures for validators
   - Create diagnostics tools for troubleshooting

3. **Contract Interaction Failures**:
   - Document fallback options for contract methods
   - Create retry mechanisms with escalating gas prices

## Upgrade Procedures

### Smart Contract Upgrades

For contract upgrades, follow these steps:

1. **For Non-Upgradeable Contracts**:
   - Deploy new contract version
   - Migrate state if possible
   - Update references in other contracts
   - Update frontend and node client configuration

2. **For Upgradeable Contracts (using proxy pattern)**:
   - Deploy new implementation contract
   - Update proxy to point to new implementation
   - Verify state preservation
   - Run integration tests

### Frontend Upgrades

Use a phased rollout approach for frontend upgrades:

1. Deploy to staging environment
2. Perform QA testing
3. Roll out to a small percentage of users
4. Monitor for issues
5. Gradually increase rollout percentage
6. Complete deployment

### Node Client Upgrades

For node client updates:

1. Develop and test new version
2. Distribute to a test group of validators
3. Monitor performance and report submission
4. Fix any identified issues
5. Announce update to all validators with clear upgrade instructions
6. Set a transition period where both versions are supported
7. Complete transition to new version

## Security Considerations

### Contract Security

Implement strong security measures for contract management:

1. **Admin Access**:
   - Use multi-signature wallets for admin functions
   - Implement time-locks for critical operations
   - Log all administrative actions

2. **Rate Limiting**:
   - Implement rate limiting for report submissions
   - Prevent spam attacks with minimum intervals

3. **Access Controls**:
   - Clearly defined roles and permissions
   - Function-level access restrictions

### Frontend Security

Protect the frontend with:

1. **HTTPS Enforcement**:
   - SSL/TLS certification
   - HTTP to HTTPS redirection
   - HSTS headers

2. **API Security**:
   - Input validation
   - Rate limiting
   - CORS configuration

3. **Dependency Management**:
   - Regular dependency updates
   - Vulnerability scanning
   - SRI hash verification

### Node Client Security

Secure validator operations with:

1. **Private Key Management**:
   - Secure storage of private keys
   - Key rotation procedures
   - Hardware security module support (optional)

2. **Authentication**:
   - Strong validation of nodes
   - Signature verification for reports
   - Tamper-evident logging

3. **Network Security**:
   - Firewall configuration
   - DDoS protection
   - Connection encryption

## Conclusion

Proper deployment and operations management is crucial for the success of the DePIN Uptime Platform. Following the procedures outlined in this guide will help ensure a secure, reliable, and maintainable system across all environments from development to production.

Remember to adapt these guidelines to your specific organizational needs and infrastructure capabilities. Regular reviews of the deployment and operations procedures will help identify improvements and maintain system health over time. 