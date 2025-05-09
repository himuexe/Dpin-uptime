#!/usr/bin/env node

/**
 * Deploy and Sync Script
 * 
 * This script deploys all contracts to Hardhat network and syncs the addresses
 * across all components of the application.
 */

const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Import verification script
const verifyHardhatNode = require('./verify-hardhat-node');

// File paths
const CONFIG_DIR = path.join(__dirname, '../config');
const CONFIG_ADDRESSES_PATH = path.join(CONFIG_DIR, 'contract-addresses.json');
const FRONTEND_DIR = path.join(__dirname, '../frontend/src/contracts');
const FRONTEND_ADDRESSES_PATH = path.join(FRONTEND_DIR, 'contract-addresses.js');
const NODE_CLIENT_ENV_PATH = path.join(__dirname, '../node-client/.env.example');

// Helper function to execute a command
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executing command: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Command stderr: ${stderr}`);
      }
      console.log(`Command stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Helper function to ensure compatibility with different ethers versions
async function waitForDeployment(contract) {
  console.log('Waiting for deployment...');
  try {
    // For ethers v5 and below
    if (typeof contract.deployed === 'function') {
      console.log('Using contract.deployed()');
      return await contract.deployed();
    }
    // For ethers v6+
    if (typeof contract.waitForDeployment === 'function') {
      console.log('Using contract.waitForDeployment()');
      return await contract.waitForDeployment();
    }
    console.log('Using fallback deployment method');
    // If neither method exists, just return the contract
    return contract;
  } catch (error) {
    console.error(`Error waiting for deployment: ${error.message}`);
    throw error;
  }
}

// Helper function to get contract address safely
function getContractAddress(contract) {
  try {
    if (contract.address) {
      return contract.address;
    } else if (contract.target) {
      return contract.target;
    } else {
      console.warn('Contract address not found using standard properties, attempting JSON conversion');
      const contractJson = JSON.stringify(contract);
      const contractObj = JSON.parse(contractJson);
      return contractObj.address || contractObj.target || 'unknown';
    }
  } catch (error) {
    console.error(`Error getting contract address: ${error.message}`);
    return 'unknown';
  }
}

// Helper function to ensure directories exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Helper function to create default config if it doesn't exist
function ensureConfigExists() {
  ensureDirectoryExists(CONFIG_DIR);
  ensureDirectoryExists(FRONTEND_DIR);
  
  if (!fs.existsSync(CONFIG_ADDRESSES_PATH)) {
    console.log(`Creating default config at: ${CONFIG_ADDRESSES_PATH}`);
    const defaultConfig = {
      development: {},
      testnet: {},
      mainnet: {}
    };
    fs.writeFileSync(CONFIG_ADDRESSES_PATH, JSON.stringify(defaultConfig, null, 2));
  }
}

// Helper function to display deployment summary
function displayDeploymentSummary(addresses) {
  console.log('\n=== Deployment Summary ===');
  console.log('Contract Addresses:');
  for (const [contract, address] of Object.entries(addresses)) {
    console.log(`- ${contract}: ${address}`);
  }
}

async function main() {
  console.log('=== DePIN Uptime Platform - Deployment and Synchronization ===');
  
  try {
    // Ensure configuration directories exist
    ensureConfigExists();
    
    // Step 1: Verify Hardhat node is running
    console.log('\nStep 1: Verifying Hardhat node...');
    const isNodeRunning = await verifyHardhatNode();
    
    if (!isNodeRunning) {
      throw new Error('Hardhat node verification failed. Please start the node and try again.');
    }
    
    // Step 2: Get signers and verify balance
    console.log('\nStep 2: Preparing deployment account...');
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with account: ${deployer.address}`);
    
    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    // Fix formatEther to work with different ethers versions
    const balanceInEth = ethers.utils && ethers.utils.formatEther 
      ? ethers.utils.formatEther(balance) 
      : ethers.formatEther ? ethers.formatEther(balance) 
      : balance.toString() + ' wei';
    console.log(`Account balance: ${balanceInEth} ETH`);

    // Create the minimum required amount
    const minRequiredAmount = ethers.utils && ethers.utils.parseEther
      ? ethers.utils.parseEther("0.1")
      : ethers.parseEther
        ? ethers.parseEther("0.1")
        : ethers.BigNumber
          ? ethers.BigNumber.from("100000000000000000")  // 0.1 ETH in wei
          : "100000000000000000";  // Fallback to string

    // Check if balance is sufficient (compatible with different ethers versions)
    const isBalanceSufficient = typeof balance.lt === 'function'
      ? balance.lt(minRequiredAmount) === false
      : (balance >= minRequiredAmount);

    if (!isBalanceSufficient) {
      throw new Error('Insufficient funds for deployment. Account needs at least 0.1 ETH.');
    }
    
    // Step 3: Deploy all contracts
    console.log('\nStep 3: Deploying contracts...');
    
    // Deploy UptimeToken
    console.log('\nDeploying UptimeToken...');
    const UptimeToken = await ethers.getContractFactory("UptimeToken");
    const uptimeToken = await UptimeToken.deploy();
    await waitForDeployment(uptimeToken);
    console.log(`UptimeToken deployed to: ${getContractAddress(uptimeToken)}`);
    
    // Deploy WebsiteRegistry
    console.log('\nDeploying WebsiteRegistry...');
    const WebsiteRegistry = await ethers.getContractFactory("WebsiteRegistry");
    const websiteRegistry = await WebsiteRegistry.deploy();
    await waitForDeployment(websiteRegistry);
    console.log(`WebsiteRegistry deployed to: ${getContractAddress(websiteRegistry)}`);
    
    // Deploy NodeRegistry
    console.log('\nDeploying NodeRegistry...');
    const NodeRegistry = await ethers.getContractFactory("NodeRegistry");
    const minimumStake = ethers.utils && ethers.utils.parseEther
      ? ethers.utils.parseEther("100")
      : ethers.parseEther
        ? ethers.parseEther("100")
        : ethers.BigNumber.from("100000000000000000000");
    const nodeRegistry = await NodeRegistry.deploy(minimumStake);
    await waitForDeployment(nodeRegistry);
    console.log(`NodeRegistry deployed to: ${getContractAddress(nodeRegistry)}`);
    
    // Deploy StatusReport
    console.log('\nDeploying StatusReport...');
    const StatusReport = await ethers.getContractFactory("StatusReport");

    // StatusReport doesn't take any constructor parameters
    console.log('Deploying StatusReport with no constructor parameters');
    let statusReport;
    try {
      statusReport = await StatusReport.deploy();
      await waitForDeployment(statusReport);
      console.log(`StatusReport deployed to: ${getContractAddress(statusReport)}`);
    } catch (error) {
      console.error(`StatusReport deployment failed: ${error.message}`);
      throw error;
    }
    
    // Deploy ReputationSystem
    console.log('\nDeploying ReputationSystem...');
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    // Minimum reputation for rewards - 30 (out of 100)
    const minReputationForRewards = 30;
    const reputationSystem = await ReputationSystem.deploy(minReputationForRewards);
    await waitForDeployment(reputationSystem);
    console.log(`ReputationSystem deployed to: ${getContractAddress(reputationSystem)}`);
    
    // Deploy ConsensusEngine
    console.log('\nDeploying ConsensusEngine...');
    const ConsensusEngine = await ethers.getContractFactory("ConsensusEngine");
    // Consensus parameters
    const minReportsForConsensus = 3; // Minimum number of reports needed for consensus
    const consensusThreshold = 66; // 66% agreement required (out of 100)
    const consensusTimeWindow = 3600; // 1 hour time window for reports

    // Log constructor arguments for debugging
    console.log('ConsensusEngine constructor arguments:');
    console.log(`StatusReport address: ${getContractAddress(statusReport)}`);
    console.log(`ReputationSystem address: ${getContractAddress(reputationSystem)}`);
    console.log(`minReportsForConsensus: ${minReportsForConsensus}`);
    console.log(`consensusThreshold: ${consensusThreshold}`);
    console.log(`consensusTimeWindow: ${consensusTimeWindow}`);

    const consensusEngine = await ConsensusEngine.deploy(
      getContractAddress(statusReport),
      getContractAddress(reputationSystem),
      minReportsForConsensus,
      consensusThreshold,
      consensusTimeWindow
    );
    await waitForDeployment(consensusEngine);
    console.log(`ConsensusEngine deployed to: ${getContractAddress(consensusEngine)}`);
    
    // Deploy RewardDistribution
    console.log('\nDeploying RewardDistribution...');
    const RewardDistribution = await ethers.getContractFactory("RewardDistribution");

    // Define reward parameters
    const baseRewardAmount = 10; // Base reward tokens per report
    const reputationMultiplier = 5; // 5% adjustment per reputation point difference from 50

    // Log constructor arguments for debugging
    console.log('RewardDistribution constructor arguments:');
    console.log(`UptimeToken address: ${getContractAddress(uptimeToken)}`);
    console.log(`ReputationSystem address: ${getContractAddress(reputationSystem)}`);
    console.log(`ConsensusEngine address: ${getContractAddress(consensusEngine)}`);
    console.log(`baseRewardAmount: ${baseRewardAmount}`);
    console.log(`reputationMultiplier: ${reputationMultiplier}`);

    // Execute deployment with the exact 5 parameters from the constructor
    const rewardDistribution = await RewardDistribution.deploy(
      getContractAddress(uptimeToken),        // _tokenAddress
      getContractAddress(reputationSystem),   // _reputationSystemAddress
      getContractAddress(consensusEngine),    // _consensusEngineAddress
      baseRewardAmount,                       // _baseRewardAmount
      reputationMultiplier                    // _reputationMultiplier
    );
    await waitForDeployment(rewardDistribution);
    console.log(`RewardDistribution deployed to: ${getContractAddress(rewardDistribution)}`);
    
    // Step 4: Verify contract deployments
    console.log('\nStep 4: Verifying contract deployments...');
    
    // Create the addresses object
    const addresses = {};
    // Only include contracts that were successfully deployed
    if (uptimeToken) addresses.UptimeToken = getContractAddress(uptimeToken);
    if (websiteRegistry) addresses.WebsiteRegistry = getContractAddress(websiteRegistry);
    if (nodeRegistry) addresses.NodeRegistry = getContractAddress(nodeRegistry);
    if (statusReport) addresses.StatusReport = getContractAddress(statusReport);
    if (reputationSystem) addresses.ReputationSystem = getContractAddress(reputationSystem);
    if (consensusEngine) addresses.ConsensusEngine = getContractAddress(consensusEngine);
    if (rewardDistribution) addresses.RewardDistribution = getContractAddress(rewardDistribution);
    
    // Display deployment summary
    displayDeploymentSummary(addresses);
    
    // Check code exists at deployment addresses
    for (const [name, address] of Object.entries(addresses)) {
      try {
        console.log(`Verifying ${name} at ${address}...`);
        const code = await ethers.provider.getCode(address);
        
        if (code === '0x') {
          console.warn(`⚠️ No contract code found at ${name} address: ${address}`);
        } else {
          console.log(`✅ ${name} deployment verified at ${address}`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not verify ${name} at ${address}: ${error.message}`);
      }
    }
    
    // Step 5: Create and update address configurations
    console.log('\nStep 5: Updating contract addresses in configurations...');
    
    // Update config/contract-addresses.json
    try {
      console.log('\nUpdating contract addresses in config...');
      const configAddresses = JSON.parse(fs.readFileSync(CONFIG_ADDRESSES_PATH, 'utf8'));
      configAddresses.development = addresses;
      fs.writeFileSync(CONFIG_ADDRESSES_PATH, JSON.stringify(configAddresses, null, 2));
      console.log('✅ Config addresses updated');
    } catch (error) {
      console.error('Error updating config addresses:', error);
      throw new Error(`Failed to update config addresses: ${error.message}`);
    }
    
    // Update frontend/src/contracts/contract-addresses.js
    try {
      console.log('\nUpdating contract addresses in frontend...');
      ensureDirectoryExists(FRONTEND_DIR);
      
      const frontendAddressesContent = `/**
 * This file contains the addresses of the deployed contracts.
 * THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.
 * Last updated: ${new Date().toISOString()}
 * Environment: development
 */

const CONTRACT_ADDRESSES = {
  UptimeToken: '${addresses.UptimeToken}',
  WebsiteRegistry: '${addresses.WebsiteRegistry}',
  NodeRegistry: '${addresses.NodeRegistry}',
  StatusReport: '${addresses.StatusReport}',
  ReputationSystem: '${addresses.ReputationSystem}',
  ConsensusEngine: '${addresses.ConsensusEngine}',
  RewardDistribution: '${addresses.RewardDistribution}'
};

export default CONTRACT_ADDRESSES;`;
      fs.writeFileSync(FRONTEND_ADDRESSES_PATH, frontendAddressesContent);
      console.log('✅ Frontend addresses updated');
    } catch (error) {
      console.error('Error updating frontend addresses:', error);
      throw new Error(`Failed to update frontend addresses: ${error.message}`);
    }
    
    // Step 6: Sync ABIs
    console.log('\nStep 6: Syncing ABIs across components...');
    
    try {
      await runCommand('node scripts/sync-abis.js');
      console.log('✅ ABIs synchronized successfully');
    } catch (error) {
      console.error('Error syncing ABIs:', error);
      throw new Error(`Failed to sync ABIs: ${error.message}`);
    }
    
    // Step 7: Update node-client .env.example with contract addresses
    try {
      console.log('\nStep 7: Updating node-client configuration example...');
      
      // Read existing .env.example file
      let envContent = '';
      if (fs.existsSync(NODE_CLIENT_ENV_PATH)) {
        envContent = fs.readFileSync(NODE_CLIENT_ENV_PATH, 'utf8');
      }
      
      // Create or update contract address variables
      const envLines = envContent.split('\n');
      const addressVars = {
        NODE_REGISTRY_ADDRESS: addresses.NodeRegistry,
        STATUS_REPORT_ADDRESS: addresses.StatusReport,
        WEBSITE_REGISTRY_ADDRESS: addresses.WebsiteRegistry,
        REPUTATION_SYSTEM_ADDRESS: addresses.ReputationSystem,
        REWARD_DISTRIBUTION_ADDRESS: addresses.RewardDistribution
      };
      
      // Replace or add address lines
      for (const [varName, address] of Object.entries(addressVars)) {
        const varLine = `${varName}=${address}`;
        const varIndex = envLines.findIndex(line => line.startsWith(`${varName}=`));
        
        if (varIndex >= 0) {
          envLines[varIndex] = varLine;
        } else {
          envLines.push(varLine);
        }
      }
      
      // Write updated .env.example file
      fs.writeFileSync(NODE_CLIENT_ENV_PATH, envLines.join('\n'));
      console.log('✅ Node client configuration updated');
    } catch (error) {
      console.error('Error updating node client configuration:', error);
      console.warn('Node client configuration not updated. You will need to manually update the addresses.');
    }
    
    // Step 8: Verify configuration
    console.log('\nStep 8: Verifying final configuration...');
    
    try {
      await runCommand('node scripts/check-configuration.js');
      console.log('✅ Configuration verified successfully');
    } catch (error) {
      console.error('Error verifying configuration:', error);
      console.warn('Configuration verification failed. Please check the configuration manually.');
    }
    
    console.log('\n=== Deployment and Synchronization Complete ===');
    console.log('Contract addresses have been updated in all components.');
    console.log('ABIs have been synchronized across all components.');
    console.log('\nNext Steps:');
    console.log('1. Start the frontend: cd frontend && npm run dev');
    console.log('2. Set up a node client: cd node-client && cp .env.example .env');
    console.log('3. Test the application with MetaMask connected to Hardhat (Chain ID: 31337)');
    
  } catch (error) {
    console.error("\n❌ ERROR: Deployment and synchronization failed!");
    console.error(`Error: ${error.message}`);
    
    // Provide helpful troubleshooting information
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure Hardhat node is running in a separate terminal:');
    console.log('   npx hardhat node');
    console.log('2. Check that your Hardhat configuration is correct:');
    console.log('   - networks.hardhat and networks.localhost should be properly configured');
    console.log('   - required compiler version should match contract requirements');
    console.log('3. Ensure all dependencies are installed:');
    console.log('   npm install');
    console.log('4. Check for contract compilation errors:');
    console.log('   npx hardhat compile');
    console.log('5. Run the verification script to check Hardhat node:');
    console.log('   node scripts/verify-hardhat-node.js');
    
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 