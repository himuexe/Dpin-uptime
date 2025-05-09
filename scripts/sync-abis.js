#!/usr/bin/env node

/**
 * Sync ABIs Script
 * 
 * This script copies the ABIs from the Hardhat artifacts to the frontend.
 * Run this script after compiling contracts with Hardhat.
 * 
 * Usage:
 *   node scripts/sync-abis.js
 */

const fs = require('fs');
const path = require('path');

// File paths
const ARTIFACTS_DIR = path.join(__dirname, '../artifacts/contracts');
const FRONTEND_ABIS_DIR = path.join(__dirname, '../frontend/src/contracts/abis');
const NODE_CLIENT_ABIS_DIR = path.join(__dirname, '../node-client/abis');

// List of contracts to sync
const CONTRACTS = [
  'UptimeToken.sol/UptimeToken',
  'WebsiteRegistry.sol/WebsiteRegistry',
  'NodeRegistry.sol/NodeRegistry',
  'StatusReport.sol/StatusReport',
  'ReputationSystem.sol/ReputationSystem',
  'ConsensusEngine.sol/ConsensusEngine',
  'RewardDistribution.sol/RewardDistribution'
];

console.log('=== DePIN Uptime Platform - ABI Synchronization ===');

// Create directories if they don't exist
if (!fs.existsSync(FRONTEND_ABIS_DIR)) {
  fs.mkdirSync(FRONTEND_ABIS_DIR, { recursive: true });
  console.log(`Created directory: ${FRONTEND_ABIS_DIR}`);
}

if (!fs.existsSync(NODE_CLIENT_ABIS_DIR)) {
  fs.mkdirSync(NODE_CLIENT_ABIS_DIR, { recursive: true });
  console.log(`Created directory: ${NODE_CLIENT_ABIS_DIR}`);
}

// Sync ABIs
let successCount = 0;
let failureCount = 0;

for (const contract of CONTRACTS) {
  try {
    // Path to the artifact JSON file
    const artifactPath = path.join(ARTIFACTS_DIR, `${contract}.json`);
    
    if (!fs.existsSync(artifactPath)) {
      console.error(`Artifact not found: ${artifactPath}`);
      failureCount++;
      continue;
    }
    
    // Read the artifact JSON file
    const artifactJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Extract only the ABI
    const abi = artifactJson.abi;
    
    // Get the contract name without the path
    const contractName = contract.split('/')[1];
    
    // Write ABI to frontend directory
    const frontendAbiPath = path.join(FRONTEND_ABIS_DIR, `${contractName}.json`);
    fs.writeFileSync(frontendAbiPath, JSON.stringify(abi, null, 2));
    
    // Write ABI to node-client directory
    const nodeClientAbiPath = path.join(NODE_CLIENT_ABIS_DIR, `${contractName}.json`);
    fs.writeFileSync(nodeClientAbiPath, JSON.stringify(abi, null, 2));
    
    console.log(`Synced ABI for ${contractName}`);
    successCount++;
  } catch (error) {
    console.error(`Error syncing ABI for ${contract}: ${error.message}`);
    failureCount++;
  }
}

console.log('\nSynchronization complete:');
console.log(`- Success: ${successCount} contracts`);
console.log(`- Failure: ${failureCount} contracts`);

if (failureCount === 0) {
  console.log('\nAll ABIs synchronized successfully!');
} else {
  console.error('\nSome ABIs failed to synchronize. Check the logs above.');
  process.exit(1);
} 