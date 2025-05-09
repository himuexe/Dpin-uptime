#!/usr/bin/env node

/**
 * Contract Interface Validation Script
 * 
 * This script validates that frontend service method calls match the actual
 * contract interfaces. It helps identify parameter mismatches, incorrect function
 * names, and other interface issues.
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Configuration
const FRONTEND_SERVICES_DIR = path.join(__dirname, '../frontend/src/services');
const CONTRACT_ABIS_DIR = path.join(__dirname, '../frontend/src/contracts/abis');

// Helper to extract contract function signatures from ABIs
function extractContractFunctions(abiPath) {
  try {
    const abiContent = fs.readFileSync(abiPath, 'utf8');
    const abi = JSON.parse(abiContent);
    
    // Filter for function entries in the ABI
    const functions = abi.filter(entry => 
      entry.type === 'function'
    ).map(func => {
      const name = func.name;
      const inputs = func.inputs || [];
      const stateMutability = func.stateMutability;
      const paramTypes = inputs.map(input => input.type);
      
      return {
        name,
        signature: `${name}(${paramTypes.join(',')})`,
        paramCount: inputs.length,
        paramTypes,
        stateMutability,
        isView: stateMutability === 'view' || stateMutability === 'pure'
      };
    });
    
    return functions;
  } catch (error) {
    console.error(`Error extracting functions from ABI ${abiPath}:`, error.message);
    return [];
  }
}

// Helper to extract frontend service method calls from JavaScript files
function extractServiceMethodCalls(servicePath) {
  try {
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    const ast = parse(serviceContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    const contractCalls = [];
    
    traverse(ast, {
      CallExpression(path) {
        // Look for contract function calls like contract.functionName()
        if (
          path.node.callee.type === 'MemberExpression' &&
          path.node.callee.object &&
          path.node.callee.object.name === 'contract' ||
          (path.node.callee.object && 
           path.node.callee.object.name === 'this' && 
           path.node.callee.property && 
           path.node.callee.property.name === 'contract')
        ) {
          const functionName = path.node.callee.property.name;
          const args = path.node.arguments;
          
          contractCalls.push({
            name: functionName,
            paramCount: args.length,
            location: `${servicePath}:${path.node.loc.start.line}`
          });
        }
      }
    });
    
    return contractCalls;
  } catch (error) {
    console.error(`Error extracting method calls from ${servicePath}:`, error.message);
    return [];
  }
}

// Main validation function
async function validateInterfaces() {
  console.log('=== Contract Interface Validation ===');
  
  try {
    // Get all service files
    const serviceFiles = fs.readdirSync(FRONTEND_SERVICES_DIR)
      .filter(file => file.endsWith('Service.js'));
    
    // Get all ABI files
    const abiFiles = fs.readdirSync(CONTRACT_ABIS_DIR)
      .filter(file => file.endsWith('.json'));
    
    console.log(`Found ${serviceFiles.length} service files and ${abiFiles.length} ABI files`);
    
    // Process each service file
    let totalIssues = 0;
    
    // Extract all contract functions from ABIs
    const contractFunctions = {};
    for (const abiFile of abiFiles) {
      const contractName = abiFile.replace('.json', '');
      const abiPath = path.join(CONTRACT_ABIS_DIR, abiFile);
      contractFunctions[contractName] = extractContractFunctions(abiPath);
      console.log(`- ${contractName}: ${contractFunctions[contractName].length} functions found`);
    }
    
    // Check each service file for contract calls
    for (const serviceFile of serviceFiles) {
      console.log(`\nChecking ${serviceFile}...`);
      const servicePath = path.join(FRONTEND_SERVICES_DIR, serviceFile);
      
      // Determine which contract this service is likely using
      const contractName = serviceFile.replace('Service.js', '');
      const relatedContracts = Object.keys(contractFunctions).filter(name => 
        name.toLowerCase().includes(contractName.toLowerCase())
      );
      
      if (relatedContracts.length === 0) {
        console.warn(`⚠️ Could not determine which contract ${serviceFile} is using`);
        continue;
      }
      
      // Get service method calls
      const serviceCalls = extractServiceMethodCalls(servicePath);
      console.log(`Found ${serviceCalls.length} contract method calls`);
      
      // Check each call against the contract functions
      let serviceIssues = 0;
      
      for (const call of serviceCalls) {
        let found = false;
        let suggestions = [];
        
        for (const contractName of relatedContracts) {
          // Look for exact function name match
          const matchingFunctions = contractFunctions[contractName].filter(
            func => func.name === call.name
          );
          
          if (matchingFunctions.length > 0) {
            found = true;
            
            // Check parameter count mismatch
            const exactParamMatch = matchingFunctions.some(
              func => func.paramCount === call.paramCount
            );
            
            if (!exactParamMatch) {
              console.error(`❌ Function parameter count mismatch: ${call.name} at ${call.location}`);
              console.error(`   Service is calling with ${call.paramCount} parameters, but contract expects:`);
              
              matchingFunctions.forEach(func => {
                console.error(`   - ${func.signature} (${func.paramCount} parameters)`);
                suggestions.push(func.signature);
              });
              
              serviceIssues++;
              totalIssues++;
            }
          }
        }
        
        if (!found) {
          console.error(`❌ Function not found: ${call.name} at ${call.location}`);
          
          // Suggest similar function names
          for (const contractName of relatedContracts) {
            const similarFunctions = contractFunctions[contractName].filter(
              func => func.name.toLowerCase().includes(call.name.toLowerCase()) ||
                     call.name.toLowerCase().includes(func.name.toLowerCase())
            );
            
            if (similarFunctions.length > 0) {
              console.error(`   Possible alternatives in ${contractName}:`);
              similarFunctions.forEach(func => {
                console.error(`   - ${func.signature}`);
                suggestions.push(func.signature);
              });
            }
          }
          
          serviceIssues++;
          totalIssues++;
        }
      }
      
      if (serviceIssues === 0) {
        console.log(`✅ No interface issues found in ${serviceFile}`);
      } else {
        console.error(`Found ${serviceIssues} interface issues in ${serviceFile}`);
      }
    }
    
    // Final result
    if (totalIssues === 0) {
      console.log('\n✅ All contract interfaces match service calls!');
      return true;
    } else {
      console.error(`\n❌ Found ${totalIssues} interface mismatches that need to be fixed.`);
      return false;
    }
    
  } catch (error) {
    console.error('Error validating interfaces:', error.message);
    return false;
  }
}

// Run as standalone script or export for use in other scripts
if (require.main === module) {
  validateInterfaces()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
} else {
  module.exports = validateInterfaces;
} 