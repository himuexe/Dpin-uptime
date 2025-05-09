#!/usr/bin/env node

/**
 * Sync Contract Addresses Script
 * 
 * This script synchronizes contract addresses across all project components
 * using the centralized config/contract-addresses.json file as the source of truth.
 * 
 * Usage:
 *   node scripts/sync-addresses.js [--env <environment>] [--deploy]
 * 
 * Options:
 *   --env <environment>   Specify the environment (development, test, production)
 *   --deploy              Deploy contracts first, then update addresses
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
let environment = 'development';
const shouldDeploy = args.includes('--deploy');

// Get environment from arguments
const envIndex = args.indexOf('--env');
if (envIndex !== -1 && args[envIndex + 1]) {
  environment = args[envIndex + 1];
}

// File paths
const CONFIG_PATH = path.join(__dirname, '../config/contract-addresses.json');
const FRONTEND_SERVICES_ADDRESSES_PATH = path.join(__dirname, '../frontend/src/services/contractAddresses.js');
const FRONTEND_CONTRACTS_ADDRESSES_PATH = path.join(__dirname, '../frontend/src/contracts/contract-addresses.js');
const NODE_CLIENT_ENV_TEMPLATE_PATH = path.join(__dirname, '../node-client/setup.js');
const NODE_CLIENT_ENV_PATH = path.join(__dirname, '../node-client/.env');

console.log(`=== DePIN Uptime Platform - Contract Address Synchronization ===`);
console.log(`Environment: ${environment}`);

// Deploy contracts if requested
if (shouldDeploy) {
  console.log('\nDeploying contracts...');
  try {
    execSync('npx hardhat run scripts/deploy.js --network localhost', { stdio: 'inherit' });
    
    // Run get-addresses to update the central config
    console.log('\nGetting deployed contract addresses...');
    const output = execSync('npx hardhat run scripts/get-addresses.js --network localhost').toString();
    
    // Parse the output to extract addresses
    const addresses = {};
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [contract, address] = line.split(':').map(part => part.trim());
        if (contract && address && address.startsWith('0x')) {
          addresses[contract] = address;
        }
      }
    }
    
    // Update the config file with new addresses
    if (Object.keys(addresses).length > 0) {
      try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        config[environment] = {
          ...config[environment],
          ...addresses
        };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        console.log('Updated contract addresses in config file');
      } catch (error) {
        console.error('Error updating config file:', error.message);
      }
    }
  } catch (error) {
    console.error('Error deploying contracts:', error.message);
    process.exit(1);
  }
}

// Get addresses from config
let addresses = {};
try {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  addresses = config[environment] || {};
  
  // Validate addresses
  const missingAddresses = Object.entries(addresses)
    .filter(([, address]) => !address || !address.startsWith('0x'))
    .map(([contract]) => contract);
    
  if (missingAddresses.length > 0) {
    console.warn(`Warning: Missing or invalid addresses for: ${missingAddresses.join(', ')}`);
  }
} catch (error) {
  console.error(`Error reading config file: ${error.message}`);
  process.exit(1);
}

// Update frontend/src/services/contractAddresses.js
function updateFrontendServicesAddresses() {
  try {
    if (!fs.existsSync(FRONTEND_SERVICES_ADDRESSES_PATH)) {
      console.error(`Frontend services addresses file not found at: ${FRONTEND_SERVICES_ADDRESSES_PATH}`);
      return false;
    }
    
    // Read the current file
    let content = fs.readFileSync(FRONTEND_SERVICES_ADDRESSES_PATH, 'utf8');
    
    // Determine which address set to update based on environment
    let addressSetName;
    switch (environment) {
      case 'development':
        addressSetName = 'DEV_ADDRESSES';
        break;
      case 'test':
        addressSetName = 'TEST_ADDRESSES';
        break;
      case 'production':
        addressSetName = 'PROD_ADDRESSES';
        break;
      default:
        addressSetName = 'DEV_ADDRESSES';
    }
    
    // Update addresses in the appropriate section
    Object.entries(addresses).forEach(([contract, address]) => {
      const pattern = new RegExp(`(${addressSetName}\\s*=\\s*\\{[\\s\\S]*?${contract}:\\s*['"])([^'"]*)(["'][\\s\\S]*?\\})`, 'g');
      content = content.replace(pattern, `$1${address}$3`);
    });
    
    // Write back to file
    fs.writeFileSync(FRONTEND_SERVICES_ADDRESSES_PATH, content);
    console.log(`Updated ${FRONTEND_SERVICES_ADDRESSES_PATH}`);
    return true;
  } catch (error) {
    console.error(`Error updating frontend services addresses: ${error.message}`);
    return false;
  }
}

// Update frontend/src/contracts/contract-addresses.js
function updateFrontendContractsAddresses() {
  try {
    if (!fs.existsSync(FRONTEND_CONTRACTS_ADDRESSES_PATH)) {
      console.error(`Frontend contracts addresses file not found at: ${FRONTEND_CONTRACTS_ADDRESSES_PATH}`);
      return false;
    }
    
    // Generate new content
    const addressEntries = Object.entries(addresses)
      .map(([contract, address]) => `  ${contract}: '${address}'`)
      .join(',\n');
      
    const content = `/**
 * This file contains the addresses of the deployed contracts.
 * THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.
 * Last updated: ${new Date().toISOString()}
 * Environment: ${environment}
 */

const CONTRACT_ADDRESSES = {
${addressEntries}
};

export default CONTRACT_ADDRESSES;`;
    
    // Write to file
    fs.writeFileSync(FRONTEND_CONTRACTS_ADDRESSES_PATH, content);
    console.log(`Updated ${FRONTEND_CONTRACTS_ADDRESSES_PATH}`);
    return true;
  } catch (error) {
    console.error(`Error updating frontend contracts addresses: ${error.message}`);
    return false;
  }
}

// Update node-client/.env file
function updateNodeClientEnv() {
  try {
    // Create .env file if it doesn't exist
    if (!fs.existsSync(NODE_CLIENT_ENV_PATH)) {
      if (fs.existsSync(NODE_CLIENT_ENV_TEMPLATE_PATH)) {
        console.log(`Creating node client .env file from template`);
        execSync(`cd node-client && node setup.js`, { stdio: 'inherit' });
      } else {
        console.error(`Node client setup.js not found at: ${NODE_CLIENT_ENV_TEMPLATE_PATH}`);
        return false;
      }
    }
    
    // Read current .env file or create default content
    let content = fs.existsSync(NODE_CLIENT_ENV_PATH) 
      ? fs.readFileSync(NODE_CLIENT_ENV_PATH, 'utf8')
      : `# DePIN Uptime Node Client Environment Configuration\n\n`;
    
    // Update contract addresses
    const addressMappings = {
      'UptimeToken': 'UPTIME_TOKEN_ADDRESS',
      'WebsiteRegistry': 'WEBSITE_REGISTRY_ADDRESS',
      'NodeRegistry': 'NODE_REGISTRY_ADDRESS',
      'StatusReport': 'STATUS_REPORT_ADDRESS',
      'ReputationSystem': 'REPUTATION_SYSTEM_ADDRESS',
      'ConsensusEngine': 'CONSENSUS_ENGINE_ADDRESS',
      'RewardDistribution': 'REWARD_DISTRIBUTION_ADDRESS'
    };
    
    Object.entries(addresses).forEach(([contract, address]) => {
      const envVar = addressMappings[contract];
      if (envVar) {
        // Check if the variable exists in the file
        const pattern = new RegExp(`^${envVar}=.*$`, 'm');
        
        if (pattern.test(content)) {
          // Update existing variable
          content = content.replace(pattern, `${envVar}=${address}`);
        } else {
          // Add new variable
          content += `\n${envVar}=${address}`;
        }
      }
    });
    
    // Write back to file
    fs.writeFileSync(NODE_CLIENT_ENV_PATH, content);
    console.log(`Updated ${NODE_CLIENT_ENV_PATH}`);
    return true;
  } catch (error) {
    console.error(`Error updating node client .env: ${error.message}`);
    return false;
  }
}

// Run the synchronization
console.log('\nSynchronizing contract addresses across components...');
const frontendServicesUpdated = updateFrontendServicesAddresses();
const frontendContractsUpdated = updateFrontendContractsAddresses();
const nodeClientUpdated = updateNodeClientEnv();

// Summary
console.log('\nSynchronization Summary:');
console.log(`Frontend services addresses: ${frontendServicesUpdated ? 'SUCCESS' : 'FAILED'}`);
console.log(`Frontend contracts addresses: ${frontendContractsUpdated ? 'SUCCESS' : 'FAILED'}`);
console.log(`Node client .env: ${nodeClientUpdated ? 'SUCCESS' : 'FAILED'}`);

// Success or failure message
if (frontendServicesUpdated && frontendContractsUpdated && nodeClientUpdated) {
  console.log('\nContract addresses synchronized successfully across all components!');
} else {
  console.error('\nSynchronization completed with errors. Please check the logs above.');
  process.exit(1);
} 