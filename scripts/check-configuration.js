#!/usr/bin/env node

/**
 * Check Configuration Script
 * 
 * This script verifies that contract ABIs and addresses are correctly configured
 * across all components of the application.
 */

const fs = require('fs');
const path = require('path');

// File paths
const CONFIG_ADDRESSES = path.join(__dirname, '../config/contract-addresses.json');
const FRONTEND_ADDRESSES = path.join(__dirname, '../frontend/src/contracts/contract-addresses.js');
const FRONTEND_ABIS_DIR = path.join(__dirname, '../frontend/src/contracts/abis');
const ARTIFACTS_DIR = path.join(__dirname, '../artifacts/contracts');

// List of contracts to check
const CONTRACTS = [
  'UptimeToken',
  'WebsiteRegistry',
  'NodeRegistry',
  'StatusReport',
  'ReputationSystem',
  'ConsensusEngine',
  'RewardDistribution'
];

console.log('=== DePIN Uptime Platform - Configuration Check ===');

// Check if configuration files exist
if (!fs.existsSync(CONFIG_ADDRESSES)) {
  console.error(`Configuration file not found: ${CONFIG_ADDRESSES}`);
  process.exit(1);
}

if (!fs.existsSync(FRONTEND_ADDRESSES)) {
  console.error(`Frontend addresses file not found: ${FRONTEND_ADDRESSES}`);
  process.exit(1);
}

// Read configuration files
const configAddresses = JSON.parse(fs.readFileSync(CONFIG_ADDRESSES, 'utf8'));
const frontendAddressesContent = fs.readFileSync(FRONTEND_ADDRESSES, 'utf8');

// Extract frontend addresses from JavaScript file
const frontendAddressesMatch = frontendAddressesContent.match(/const CONTRACT_ADDRESSES = ({[\s\S]*?});/);
let frontendAddresses = {};
if (frontendAddressesMatch && frontendAddressesMatch[1]) {
  try {
    // Parse the object from the JavaScript file (this is a hack, but works for simple objects)
    frontendAddresses = eval(`(${frontendAddressesMatch[1]})`);
  } catch (error) {
    console.error('Error parsing frontend addresses:', error);
  }
}

console.log('\n=== Checking Contract Addresses ===');

// Compare addresses
const developmentAddresses = configAddresses.development;
let addressMismatchCount = 0;

for (const contract of CONTRACTS) {
  const configAddress = developmentAddresses[contract];
  const frontendAddress = frontendAddresses[contract];
  
  if (configAddress !== frontendAddress) {
    console.error(`Address mismatch for ${contract}:`);
    console.error(`- Config: ${configAddress}`);
    console.error(`- Frontend: ${frontendAddress}`);
    addressMismatchCount++;
  } else {
    console.log(`✓ ${contract} address matches: ${configAddress}`);
  }
}

console.log('\n=== Checking Contract ABIs ===');

// Check if ABIs exist and match
let abiMismatchCount = 0;

for (const contract of CONTRACTS) {
  const frontendAbiPath = path.join(FRONTEND_ABIS_DIR, `${contract}.json`);
  const artifactPath = path.join(ARTIFACTS_DIR, `${contract}.sol/${contract}.json`);
  
  if (!fs.existsSync(frontendAbiPath)) {
    console.error(`Frontend ABI not found for ${contract}: ${frontendAbiPath}`);
    abiMismatchCount++;
    continue;
  }
  
  if (!fs.existsSync(artifactPath)) {
    console.error(`Artifact not found for ${contract}: ${artifactPath}`);
    abiMismatchCount++;
    continue;
  }
  
  try {
    const frontendAbi = JSON.parse(fs.readFileSync(frontendAbiPath, 'utf8'));
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const artifactAbi = artifact.abi;
    
    // Quick check: compare function names and input parameter counts
    const frontendFunctions = frontendAbi
      .filter(item => item.type === 'function')
      .map(item => ({ 
        name: item.name, 
        inputs: item.inputs ? item.inputs.length : 0,
        types: item.inputs ? item.inputs.map(i => i.type) : []
      }));
    
    const artifactFunctions = artifactAbi
      .filter(item => item.type === 'function')
      .map(item => ({ 
        name: item.name, 
        inputs: item.inputs ? item.inputs.length : 0,
        types: item.inputs ? item.inputs.map(i => i.type) : []
      }));
    
    // Check for function discrepancies
    const frontendFunctionMap = new Map(frontendFunctions.map(f => [f.name, f]));
    const artifactFunctionMap = new Map(artifactFunctions.map(f => [f.name, f]));
    
    let hasMismatch = false;
    
    // Check functions in artifacts but not in frontend
    for (const [name, func] of artifactFunctionMap.entries()) {
      if (!frontendFunctionMap.has(name)) {
        console.error(`Function exists in artifact but not in frontend ABI: ${name}`);
        hasMismatch = true;
      } else {
        const frontendFunc = frontendFunctionMap.get(name);
        if (frontendFunc.inputs !== func.inputs) {
          console.error(`Function parameter count mismatch for ${name}:`);
          console.error(`- Frontend: ${frontendFunc.inputs} inputs (${frontendFunc.types.join(', ')})`);
          console.error(`- Artifact: ${func.inputs} inputs (${func.types.join(', ')})`);
          hasMismatch = true;
        }
      }
    }
    
    // Check functions in frontend but not in artifacts
    for (const [name, func] of frontendFunctionMap.entries()) {
      if (!artifactFunctionMap.has(name)) {
        console.error(`Function exists in frontend ABI but not in artifact: ${name}`);
        hasMismatch = true;
      }
    }
    
    if (hasMismatch) {
      abiMismatchCount++;
    } else {
      console.log(`✓ ${contract} ABI matches`);
    }
  } catch (error) {
    console.error(`Error comparing ABIs for ${contract}:`, error);
    abiMismatchCount++;
  }
}

console.log('\n=== Configuration Check Summary ===');
console.log(`- Address mismatches: ${addressMismatchCount}`);
console.log(`- ABI mismatches: ${abiMismatchCount}`);

if (addressMismatchCount === 0 && abiMismatchCount === 0) {
  console.log('\n✅ All configurations are correct!');
} else {
  console.error('\n❌ Configuration issues detected. Please fix the issues above.');
  process.exit(1);
} 