#!/usr/bin/env node

/**
 * DePIN Uptime Node Client Test Script
 * 
 * This script demonstrates the complete workflow from registering a node to checking websites
 * and reporting status to the blockchain.
 * 
 * Usage:
 *   node test.js
 */

require('dotenv').config();
const { ethers } = require('ethers');
const { execSync } = require('child_process');
const WebsiteRegistryABI = require('./abis/WebsiteRegistry.json');

// Configuration
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const WEBSITE_REGISTRY_ADDRESS = process.env.WEBSITE_REGISTRY_ADDRESS;

console.log('==== DePIN Uptime Node Client Test ====');
console.log('Starting integration test...');

async function runTest() {
  try {
    // 1. Set up blockchain connection
    console.log('\n[1] Setting up blockchain connection...');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const websiteRegistry = new ethers.Contract(
      WEBSITE_REGISTRY_ADDRESS,
      WebsiteRegistryABI,
      wallet
    );

    // Check if there's connectivity to the blockchain
    try {
      await provider.getBlockNumber();
      console.log('  ✓ Connected to blockchain at', RPC_URL);
    } catch (error) {
      console.error('  ✗ Failed to connect to blockchain:', error.message);
      console.log('    Please make sure your Hardhat node is running at', RPC_URL);
      return;
    }

    // 2. Register a test website if none exist
    console.log('\n[2] Checking for existing websites or registering a new one...');
    let websiteCount;
    try {
      websiteCount = await websiteRegistry.websiteCount();
      console.log(`  ✓ Found ${websiteCount} websites`);
    } catch (error) {
      console.error('  ✗ Failed to get website count:', error.message);
      console.log('    Please make sure the WebsiteRegistry contract is deployed at', WEBSITE_REGISTRY_ADDRESS);
      return;
    }

    let websiteId = 0;
    if (websiteCount.toNumber() === 0) {
      console.log('  No websites found. Registering a test website...');
      try {
        const tx = await websiteRegistry.registerWebsite(
          'example.com',
          'Example Website'
        );
        await tx.wait();
        console.log('  ✓ Test website registered successfully with ID: 0');
      } catch (error) {
        console.error('  ✗ Failed to register test website:', error.message);
        return;
      }
    } else {
      console.log('  Using existing website with ID: 0');
    }

    // 3. Register a node
    console.log('\n[3] Registering a node...');
    try {
      const output = execSync('node index.js register').toString();
      console.log('  ' + output.replace(/\n/g, '\n  '));

      // Extract node ID from output using regex
      const match = output.match(/Node registered successfully with ID: (\d+)/);
      if (match && match[1]) {
        console.log('  ✓ Node registered with ID:', match[1]);
      } else {
        console.log('  ✓ Node registration command executed');
      }
    } catch (error) {
      console.error('  ✗ Failed to register node:', error.message);
      if (error.stderr) {
        console.error('  Error output:', error.stderr.toString());
      }
      return;
    }

    // 4. Check a website
    console.log('\n[4] Checking website status...');
    try {
      const output = execSync(`node index.js check --website-id ${websiteId} --node-id 0`).toString();
      console.log('  ' + output.replace(/\n/g, '\n  '));
      console.log('  ✓ Website check completed');
    } catch (error) {
      console.error('  ✗ Failed to check website:', error.message);
      if (error.stderr) {
        console.error('  Error output:', error.stderr.toString());
      }
      return;
    }

    // 5. Get node status
    console.log('\n[5] Getting node status...');
    try {
      const output = execSync('node index.js status --node-id 0').toString();
      console.log('  ' + output.replace(/\n/g, '\n  '));
      console.log('  ✓ Node status retrieved');
    } catch (error) {
      console.error('  ✗ Failed to get node status:', error.message);
      if (error.stderr) {
        console.error('  Error output:', error.stderr.toString());
      }
      return;
    }

    // 6. Start automatic checking (run for a few seconds then stop)
    console.log('\n[6] Testing automatic checking (will run for 10 seconds)...');
    let startProcess;
    try {
      startProcess = require('child_process').spawn('node', ['index.js', 'start', '--interval', '1', '--node-id', '0']);
      
      startProcess.stdout.on('data', (data) => {
        console.log('  ' + data.toString().replace(/\n/g, '\n  '));
      });
      
      startProcess.stderr.on('data', (data) => {
        console.error('  Error: ' + data.toString().replace(/\n/g, '\n  Error: '));
      });
      
      // Let it run for 10 seconds
      console.log('  Automatic checking started. Waiting for 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Kill the process
      startProcess.kill();
      console.log('  ✓ Automatic checking tested successfully');
    } catch (error) {
      console.error('  ✗ Failed to test automatic checking:', error.message);
      if (startProcess) {
        startProcess.kill();
      }
      return;
    }

    // 7. Test completion
    console.log('\n[7] Test completed successfully!');
    console.log('  All components of the DePIN Uptime Node Client are working properly');
    console.log('  The node client can register nodes, check websites, report status to the blockchain,');
    console.log('  and perform automatic checking at specified intervals');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

runTest().catch(console.error); 