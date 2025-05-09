# DePIN Uptime Platform Setup Guide

This guide provides step-by-step instructions for setting up and testing the DePIN Uptime Platform. Follow these instructions carefully to ensure all components work correctly together.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v16+)
- NPM (v8+)
- Git
- MetaMask or another Ethereum wallet browser extension

## 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-repo/dpin-uptime.git
cd dpin-uptime

# Install dependencies for the main project
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install node-client dependencies
cd node-client
npm install
cd ..
```

## 2. Start the Hardhat Node

Open a new terminal window and start the Hardhat local node:

```bash
# From the project root
npm run node
```

Keep this terminal open. The Hardhat node must remain running for all subsequent steps.

You should see output similar to:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
...
```

## 3. Verify Hardhat Node is Running

```bash
# From the project root
npm run verify:node
```

This script checks if the Hardhat node is running correctly and displays information about the network, accounts, and blockchain state.

## 4. Deploy Smart Contracts

```bash
# From the project root
npm run deploy
```

This script:
1. Deploys all contracts to the Hardhat network
2. Synchronizes contract addresses across all components
3. Updates ABIs in the frontend and node-client
4. Verifies the configuration is correct

After successful deployment, you'll see a list of deployed contract addresses and a verification of the complete configuration.

## 5. Start the Frontend

Open a new terminal window:

```bash
# From the project root
cd frontend
npm run dev
```

This will start the frontend development server, typically at http://localhost:5173. Open this URL in your browser.

## 6. Configure MetaMask

1. Install MetaMask browser extension if you haven't already
2. Open MetaMask and create or import a wallet
3. Add the Hardhat network to MetaMask:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545/
   - Chain ID: 31337
   - Currency Symbol: ETH
4. Connect your MetaMask to the Hardhat network
5. Import a test account using its private key:
   - Click on your account icon > Import Account
   - Enter the private key for the first account from the Hardhat node output:
     `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## 7. Set Up the Node Client

```bash
# From the project root
cd node-client
cp .env.example .env
```

Edit the `.env` file to update any configuration as needed. The contract addresses should already be set correctly by the deployment script.

## 8. Test the Complete Workflow

To verify that all components work correctly together, run the end-to-end workflow test:

```bash
# From the project root
npm run test:workflow
```

This script:
1. Verifies the Hardhat node is running
2. Redeploys contracts if needed
3. Registers a test website
4. Registers a node client
5. Submits a website status report
6. Verifies the report was recorded on-chain

If everything is working correctly, you'll see "End-to-End Workflow Test Completed Successfully!" at the end.

## 9. Manual Testing

### Register a Website

1. Open the frontend in your browser
2. Connect your MetaMask wallet
3. Navigate to the "Website Owner" section
4. Fill out the website registration form with:
   - Name: Your website name
   - URL: A valid URL (e.g., https://example.com)
   - Description: Brief description of the website
   - Check Frequency: How often the website should be checked (in minutes)
5. Click "Register Website" and confirm the transaction in MetaMask
6. Wait for the transaction to be confirmed
7. The new website should appear in your dashboard

### Register a Node

1. Navigate to the "Node Operator" section
2. Fill out the node registration form with:
   - Name: Your node name
   - Endpoint: The URL where your node can be reached
3. Click "Register Node" and confirm the transaction in MetaMask
4. Wait for the transaction to be confirmed
5. Note your assigned Node ID for use with the node client

### Run the Node Client

```bash
# From the project root
cd node-client

# Register your node (if not done through the frontend)
node index.js register --name "MyNode" --endpoint "http://localhost:3001"

# Start checking websites
node index.js start --interval 5 --node-id YOUR_NODE_ID
```

Replace `YOUR_NODE_ID` with the ID assigned to your node.

## Troubleshooting

### Hardhat Node Issues

- **Error**: Cannot connect to Hardhat node
  - Make sure the Hardhat node is running in a separate terminal
  - Check that the node is running on the default port (8545)
  - Restart the node with `npm run node`

### Contract Deployment Issues

- **Error**: Contract deployment fails
  - Verify Hardhat node is running: `npm run verify:node`
  - Check for compilation errors: `npx hardhat compile`
  - Delete the `artifacts` and `cache` directories and compile again

### MetaMask Connection Issues

- **Error**: Cannot connect MetaMask to Hardhat network
  - Verify Hardhat node is running
  - Check that network configuration is correct (Chain ID: 31337)
  - Try adding the network again or restart your browser

### Frontend Issues

- **Error**: Contract function call fails
  - Check contract addresses: `npm run check:config`
  - Verify MetaMask is connected to the Hardhat network
  - Ensure ABIs are up to date: `npm run sync:abis`

### Node Client Issues

- **Error**: Node client cannot connect to contracts
  - Check .env file for correct contract addresses
  - Verify private key is correctly set
  - Make sure Hardhat node is running
  - Test with `node index.js status --node-id YOUR_NODE_ID`

## Advanced: Customizing the Platform

### Modify Contract Parameters

If you need to modify contract parameters, edit:
- `scripts/deploy-and-sync.js` to change deployment parameters
- Then redeploy with `npm run deploy`

### Update ABIs After Contract Changes

If you modify and recompile the contracts, synchronize the ABIs:

```bash
# From the project root
npm run sync:abis
```

### Validate Contract Interfaces

To check if frontend services correctly align with contract interfaces:

```bash
# From the project root
npm run verify:interfaces
```

This helps identify any mismatches between frontend calls and contract methods.

## Development Workflow

1. Make changes to contracts, frontend, or node client
2. Redeploy contracts if necessary: `npm run deploy`
3. Synchronize ABIs: `npm run sync:abis`
4. Verify configuration: `npm run check:config`
5. Run the end-to-end test: `npm run test:workflow`
6. Test manually through the frontend and node client

Follow this workflow to maintain integration between all components.

## Next Steps

Once your local development environment is working correctly, you can:

1. Deploy to a public testnet for wider testing
2. Implement additional features
3. Enhance the frontend UI
4. Expand node client capabilities
5. Add more comprehensive testing

For any issues, check the troubleshooting section or create an issue in the GitHub repository. 