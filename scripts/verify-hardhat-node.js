#!/usr/bin/env node

/**
 * Hardhat Node Verification Script
 * 
 * This script checks if a Hardhat node is running properly by:
 * 1. Attempting to connect to the node
 * 2. Checking network information
 * 3. Verifying accounts are available
 * 4. Checking blockchain state
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function verifyHardhatNode() {
  console.log('=== Hardhat Node Verification ===');
  
  try {
    // Attempt to connect to the node
    console.log('\nChecking connection to Hardhat node...');
    
    // Get the provider
    const provider = ethers.provider;
    if (!provider) {
      throw new Error('Failed to get Hardhat provider. Make sure Hardhat is properly configured.');
    }
    
    // Check network
    console.log('Checking network...');
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId.toString() !== '31337') {
      console.warn('\n⚠️ WARNING: Connected to non-Hardhat network. Expected Chain ID 31337.');
      console.warn('This may cause issues with local development. Make sure you are running:');
      console.warn('npx hardhat node');
      process.exit(1);
    } else {
      console.log('✅ Correct network detected: Hardhat (Chain ID: 31337)');
    }
    
    // Check accounts
    console.log('\nChecking available accounts...');
    const signers = await ethers.getSigners();
    console.log(`Found ${signers.length} accounts`);
    
    if (signers.length === 0) {
      throw new Error('No accounts available. Hardhat node may not be running properly.');
    }
    
    // Display first few accounts with balances
    console.log('\nAccount information:');
    for (let i = 0; i < Math.min(3, signers.length); i++) {
      const address = await signers[i].getAddress();
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.utils && ethers.utils.formatEther 
        ? ethers.utils.formatEther(balance) 
        : ethers.formatEther ? ethers.formatEther(balance) 
        : balance.toString() + ' wei';
      console.log(`Account #${i}: ${address} (Balance: ${balanceInEth} ETH)`);
    }
    
    if (signers.length > 3) {
      console.log(`... and ${signers.length - 3} more accounts`);
    }
    
    // Check blockchain state
    console.log('\nChecking blockchain state...');
    const blockNumber = await provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);
    
    // Check JSON-RPC endpoint
    console.log('\nChecking JSON-RPC endpoints...');
    try {
      const blockTimestamp = (await provider.getBlock(blockNumber)).timestamp;
      const date = new Date(blockTimestamp * 1000);
      console.log(`Latest block timestamp: ${date.toLocaleString()}`);
      console.log('✅ JSON-RPC endpoint is responding properly');
    } catch (error) {
      console.error('❌ Error querying JSON-RPC endpoint:', error.message);
      throw new Error('JSON-RPC endpoint not responding correctly. Hardhat node may have issues.');
    }
    
    // Check configuration paths
    console.log('\nChecking project configuration...');
    const configPaths = [
      { path: path.join(__dirname, '../hardhat.config.js'), name: 'Hardhat configuration' },
      { path: path.join(__dirname, '../config/contract-addresses.json'), name: 'Contract addresses config' }
    ];
    
    for (const { path: configPath, name } of configPaths) {
      if (fs.existsSync(configPath)) {
        console.log(`✅ ${name} found at: ${configPath}`);
      } else {
        console.warn(`⚠️ ${name} not found at: ${configPath}`);
      }
    }
    
    // All checks passed
    console.log('\n✅ Hardhat node verification completed successfully!');
    console.log('The Hardhat node is running properly and ready for development.');
    
    return true;
  } catch (error) {
    console.error('\n❌ Hardhat node verification failed!');
    console.error(`Error: ${error.message}`);
    
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure Hardhat node is running in a separate terminal:');
    console.log('   npx hardhat node');
    console.log('2. Check your network configuration in hardhat.config.js');
    console.log('3. Verify no other process is using port 8545');
    console.log('4. Restart the Hardhat node and try again');
    
    return false;
  }
}

// Run as standalone script or export for use in other scripts
if (require.main === module) {
  verifyHardhatNode()
    .then(isRunning => {
      process.exit(isRunning ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
} else {
  module.exports = verifyHardhatNode;
} 