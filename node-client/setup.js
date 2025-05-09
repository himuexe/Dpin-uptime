#!/usr/bin/env node

/**
 * DePIN Uptime Node Client Setup Script
 * 
 * This script creates a .env file with default settings for testing.
 * 
 * Usage:
 *   node setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ENV_FILE_PATH = path.join(__dirname, '.env');

// Default .env content
const ENV_CONTENT = `# Ethereum node RPC URL (Hardhat local node)
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
`;

console.log('==== DePIN Uptime Node Client Setup ====');

// Check if .env file already exists
if (fs.existsSync(ENV_FILE_PATH)) {
  console.log('.env file already exists. Do you want to overwrite it? (y/n)');
  // Since we can't take input in this context, we'll just create a backup
  const backupPath = `${ENV_FILE_PATH}.backup.${Date.now()}`;
  fs.copyFileSync(ENV_FILE_PATH, backupPath);
  console.log(`Created backup of existing .env file at ${backupPath}`);
}

// Create .env file
try {
  fs.writeFileSync(ENV_FILE_PATH, ENV_CONTENT);
  console.log('.env file created successfully');
} catch (error) {
  console.error('Failed to create .env file:', error.message);
  process.exit(1);
}

// Check for node_modules directory and install dependencies if not present
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('\nInstalling dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully');
  } catch (error) {
    console.error('Failed to install dependencies:', error.message);
    console.log('Please run "npm install" manually');
  }
}

console.log('\nSetup completed. You can now run:');
console.log('- node test.js - To test the node client');
console.log('- node index.js register - To register a node');
console.log('- node index.js check --website-id 0 --node-id 0 - To check a website');
console.log('- node index.js start - To start automatic checking');
console.log('- node index.js status --node-id 0 - To get node status');
console.log('\nMake sure your Hardhat node is running and contracts are deployed before testing.'); 