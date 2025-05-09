#!/usr/bin/env node

/**
 * Update Contract Addresses Script
 * 
 * Manually update contract addresses in the configuration files.
 * This script is useful after using the standard deploy.js script.
 * 
 * Usage:
 *   node scripts/update-addresses.js \
 *     --uptime-token 0x123... \
 *     --website-registry 0x456... \
 *     --node-registry 0x789... \
 *     --status-report 0xabc... \
 *     --reputation-system 0xdef... \
 *     --consensus-engine 0x123... \
 *     --reward-distribution 0x456...
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// File paths
const CONFIG_ADDRESSES_PATH = path.join(__dirname, '../config/contract-addresses.json');
const FRONTEND_ADDRESSES_PATH = path.join(__dirname, '../frontend/src/contracts/contract-addresses.js');
const NODE_CLIENT_ENV_PATH = path.join(__dirname, '../node-client/.env');

// Command line options
program
  .option('--uptime-token <address>', 'UptimeToken contract address')
  .option('--website-registry <address>', 'WebsiteRegistry contract address')
  .option('--node-registry <address>', 'NodeRegistry contract address')
  .option('--status-report <address>', 'StatusReport contract address')
  .option('--reputation-system <address>', 'ReputationSystem contract address')
  .option('--consensus-engine <address>', 'ConsensusEngine contract address')
  .option('--reward-distribution <address>', 'RewardDistribution contract address')
  .parse(process.argv);

const options = program.opts();

console.log('=== DePIN Uptime Platform - Update Addresses ===');

// Check if any addresses were provided
const hasAddresses = Object.values(options).some(value => value !== undefined);
if (!hasAddresses) {
  console.error('Error: No addresses provided. Use --help to see the available options.');
  process.exit(1);
}

// Create the addresses object with only the provided addresses
const addresses = {
  UptimeToken: options['uptimeToken'],
  WebsiteRegistry: options['websiteRegistry'],
  NodeRegistry: options['nodeRegistry'],
  StatusReport: options['statusReport'],
  ReputationSystem: options['reputationSystem'], 
  ConsensusEngine: options['consensusEngine'],
  RewardDistribution: options['rewardDistribution']
};

// Log the addresses being used
console.log('Using the following addresses:');
for (const [contract, address] of Object.entries(addresses)) {
  if (address) {
    console.log(`- ${contract}: ${address}`);
  }
}

// Update config/contract-addresses.json
if (fs.existsSync(CONFIG_ADDRESSES_PATH)) {
  try {
    console.log('\nUpdating config/contract-addresses.json...');
    const configAddresses = JSON.parse(fs.readFileSync(CONFIG_ADDRESSES_PATH, 'utf8'));
    
    // Only update the provided addresses
    for (const [contract, address] of Object.entries(addresses)) {
      if (address) {
        configAddresses.development[contract] = address;
      }
    }
    
    fs.writeFileSync(CONFIG_ADDRESSES_PATH, JSON.stringify(configAddresses, null, 2));
    console.log('Config addresses updated successfully');
  } catch (error) {
    console.error(`Error updating config addresses: ${error.message}`);
  }
} else {
  console.warn(`Config addresses file not found: ${CONFIG_ADDRESSES_PATH}`);
}

// Update frontend/src/contracts/contract-addresses.js
if (fs.existsSync(FRONTEND_ADDRESSES_PATH)) {
  try {
    console.log('\nUpdating frontend/src/contracts/contract-addresses.js...');
    
    // Read the current content to get the existing addresses
    const currentContent = fs.readFileSync(FRONTEND_ADDRESSES_PATH, 'utf8');
    const currentAddressesMatch = currentContent.match(/const CONTRACT_ADDRESSES = ({[\s\S]*?});/);
    let currentAddresses = {};
    
    if (currentAddressesMatch && currentAddressesMatch[1]) {
      try {
        // Parse the object from the JavaScript file
        currentAddresses = eval(`(${currentAddressesMatch[1]})`);
      } catch (error) {
        console.error('Error parsing frontend addresses:', error);
      }
    }
    
    // Merge the current addresses with the provided ones
    for (const [contract, address] of Object.entries(addresses)) {
      if (address) {
        currentAddresses[contract] = address;
      }
    }
    
    // Create the new content
    const frontendAddressesContent = `/**
 * This file contains the addresses of the deployed contracts.
 * THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.
 * Last updated: ${new Date().toISOString()}
 * Environment: development
 */

const CONTRACT_ADDRESSES = {
  UptimeToken: '${currentAddresses.UptimeToken || ''}',
  WebsiteRegistry: '${currentAddresses.WebsiteRegistry || ''}',
  NodeRegistry: '${currentAddresses.NodeRegistry || ''}',
  StatusReport: '${currentAddresses.StatusReport || ''}',
  ReputationSystem: '${currentAddresses.ReputationSystem || ''}',
  ConsensusEngine: '${currentAddresses.ConsensusEngine || ''}',
  RewardDistribution: '${currentAddresses.RewardDistribution || ''}'
};

export default CONTRACT_ADDRESSES;`;
    
    fs.writeFileSync(FRONTEND_ADDRESSES_PATH, frontendAddressesContent);
    console.log('Frontend addresses updated successfully');
  } catch (error) {
    console.error(`Error updating frontend addresses: ${error.message}`);
  }
} else {
  console.warn(`Frontend addresses file not found: ${FRONTEND_ADDRESSES_PATH}`);
}

// Update node-client/.env
if (fs.existsSync(NODE_CLIENT_ENV_PATH)) {
  try {
    console.log('\nUpdating node-client/.env...');
    
    // Read the current .env content
    const envContent = fs.readFileSync(NODE_CLIENT_ENV_PATH, 'utf8');
    
    // Update the address variables
    let updatedEnvContent = envContent;
    
    if (addresses.NodeRegistry) {
      updatedEnvContent = updatedEnvContent.replace(
        /NODE_REGISTRY_ADDRESS=.*/,
        `NODE_REGISTRY_ADDRESS=${addresses.NodeRegistry}`
      );
    }
    
    if (addresses.StatusReport) {
      updatedEnvContent = updatedEnvContent.replace(
        /STATUS_REPORT_ADDRESS=.*/,
        `STATUS_REPORT_ADDRESS=${addresses.StatusReport}`
      );
    }
    
    if (addresses.WebsiteRegistry) {
      updatedEnvContent = updatedEnvContent.replace(
        /WEBSITE_REGISTRY_ADDRESS=.*/,
        `WEBSITE_REGISTRY_ADDRESS=${addresses.WebsiteRegistry}`
      );
    }
    
    if (addresses.ReputationSystem) {
      updatedEnvContent = updatedEnvContent.replace(
        /REPUTATION_SYSTEM_ADDRESS=.*/,
        `REPUTATION_SYSTEM_ADDRESS=${addresses.ReputationSystem}`
      );
    }
    
    if (addresses.RewardDistribution) {
      updatedEnvContent = updatedEnvContent.replace(
        /REWARD_DISTRIBUTION_ADDRESS=.*/,
        `REWARD_DISTRIBUTION_ADDRESS=${addresses.RewardDistribution}`
      );
    }
    
    // Write the updated content
    fs.writeFileSync(NODE_CLIENT_ENV_PATH, updatedEnvContent);
    console.log('Node client .env updated successfully');
  } catch (error) {
    console.error(`Error updating node client .env: ${error.message}`);
  }
} else {
  console.warn(`Node client .env file not found: ${NODE_CLIENT_ENV_PATH}`);
}

console.log('\n=== Update Complete ===');
console.log('Remember to run "node scripts/sync-abis.js" to ensure ABIs are up to date.');
console.log('Then run "node scripts/check-configuration.js" to verify the configuration.'); 