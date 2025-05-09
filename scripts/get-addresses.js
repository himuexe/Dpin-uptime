// Get Contract Addresses Script
// This script retrieves the addresses of deployed contracts from the network

const hre = require("hardhat");

async function main() {
  // Try to get contract addresses from the network
  try {
    // Get the network deployment artifacts
    const contracts = [
      "UptimeToken",
      "WebsiteRegistry",
      "NodeRegistry",
      "StatusReport",
      "ReputationSystem", 
      "ConsensusEngine",
      "RewardDistribution"
    ];

    for (const contractName of contracts) {
      try {
        const Contract = await hre.ethers.getContractFactory(contractName);
        const deployedContract = await hre.ethers.getContractAt(
          contractName,
          (await hre.deployments?.get?.(contractName))?.address ||
          (await Contract.getDeployedContract?.())?.address
        );
        
        if (deployedContract) {
          console.log(`${contractName}: ${await deployedContract.getAddress()}`);
        } else {
          // Fallback for older Hardhat versions or different deployment approaches
          // Try to read the artifact to get the last deployed address
          const deployments = await hre.artifacts.readArtifact(contractName);
          if (deployments.networks && Object.keys(deployments.networks).length > 0) {
            const networkId = Object.keys(deployments.networks)[0];
            console.log(`${contractName}: ${deployments.networks[networkId].address}`);
          } else {
            console.log(`${contractName}: Contract not found on network`);
          }
        }
      } catch (err) {
        console.log(`${contractName}: Failed to get address - ${err.message}`);
      }
    }
  } catch (error) {
    console.error("Error retrieving contract addresses:", error);

    // Fallback method - manually listing the most likely hardhat deployment addresses
    // This is a last resort if we can't get the actual addresses
    console.log("\nFalling back to default Hardhat deployment addresses:");
    console.log("UptimeToken: 0x5FbDB2315678afecb367f032d93F642f64180aa3");
    console.log("WebsiteRegistry: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    console.log("NodeRegistry: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    console.log("StatusReport: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
    console.log("ReputationSystem: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");
    console.log("ConsensusEngine: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707");
    console.log("RewardDistribution: 0x0165878A594ca255338adfa4d48449f69242Eb8F");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 