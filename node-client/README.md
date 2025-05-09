# DePIN Uptime Node Client

A command-line client for the DePIN Uptime Platform that checks website status and reports to the blockchain.

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following content:
   ```
   # Ethereum node RPC URL (Hardhat local node)
   RPC_URL=http://localhost:8545

   # Private key for the node operator account (this is a Hardhat test account private key)
   PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

   # Contract addresses (using default Hardhat deployment addresses)
   NODE_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   STATUS_REPORT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
   WEBSITE_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
   REPUTATION_SYSTEM_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
   REWARD_DISTRIBUTION_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

   # Node settings
   NODE_NAME=DePINTestNode
   NODE_ENDPOINT=http://localhost:3001
   NODE_ID=0

   # Monitoring settings
   CHECK_INTERVAL=5
   TIMEOUT_MS=5000
   LOG_LEVEL=info
   ```

## Usage

### Register a Node

Register your node with the NodeRegistry contract:

```
node index.js register --name MyNode --endpoint http://mynode.example.com
```

If you've set the `NODE_NAME` and `NODE_ENDPOINT` in your .env file, you can simply run:

```
node index.js register
```

### Check a Website

Check the status of a specific website:

```
node index.js check --website-id 0 --node-id 0
```

### Start Automatic Checking

Start automatic checking of all active websites:

```
node index.js start --interval 5 --node-id 0
```

### Get Node Status

Get the current status and statistics of your node:

```
node index.js status --node-id 0
```

## Status Codes

The client uses the following status codes for website monitoring:

- 0: Unknown - Status unknown or not reported
- 1: Online - Website is online and responding
- 2: Offline - Website is offline or not responding
- 3: Degraded - Website is responding but with issues

## Logs

Logs are written to both the console and a file called `node-client.log` in the root directory.

## Testing

Before running the client, make sure to:

1. Have a local Hardhat node running (`npx hardhat node`)
2. Deploy the contracts to the local node (`npx hardhat run scripts/deploy.js --network localhost`)
3. Register at least one website using the DePIN Uptime Platform frontend

## Troubleshooting

If you encounter errors:

1. Make sure your Hardhat node is running
2. Verify that the contract addresses in your .env file match the deployed contract addresses
3. Check the node-client.log file for detailed error messages
4. Ensure your node has been registered and has a valid NODE_ID 