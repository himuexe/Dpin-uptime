// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");

async function main() {
  console.log("==== DePIN Uptime Platform Deployment ====");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Deploy UptimeToken
  console.log("\nDeploying UptimeToken...");
  const UptimeToken = await ethers.getContractFactory("UptimeToken");
  const uptimeToken = await UptimeToken.deploy();
  console.log(`UptimeToken deployed to: ${uptimeToken.address}`);
  
  // Deploy WebsiteRegistry
  console.log("\nDeploying WebsiteRegistry...");
  const WebsiteRegistry = await ethers.getContractFactory("WebsiteRegistry");
  const websiteRegistry = await WebsiteRegistry.deploy();
  console.log(`WebsiteRegistry deployed to: ${websiteRegistry.address}`);
  
  // Deploy NodeRegistry
  console.log("\nDeploying NodeRegistry...");
  const NodeRegistry = await ethers.getContractFactory("NodeRegistry");
  const minimumStake = ethers.parseEther("100");
  const nodeRegistry = await NodeRegistry.deploy(minimumStake);
  console.log(`NodeRegistry deployed to: ${nodeRegistry.address}`);
  
  // Deploy StatusReport
  console.log("\nDeploying StatusReport...");
  const StatusReport = await ethers.getContractFactory("StatusReport");
  const statusReport = await StatusReport.deploy(websiteRegistry.address, nodeRegistry.address);
  console.log(`StatusReport deployed to: ${statusReport.address}`);
  
  // Deploy ReputationSystem
  console.log("\nDeploying ReputationSystem...");
  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  // Minimum reputation for rewards - 30 (out of 100)
  const minReputationForRewards = 30;
  const reputationSystem = await ReputationSystem.deploy(minReputationForRewards);
  console.log(`ReputationSystem deployed to: ${reputationSystem.address}`);
  
  // Deploy ConsensusEngine
  console.log("\nDeploying ConsensusEngine...");
  const ConsensusEngine = await ethers.getContractFactory("ConsensusEngine");
  // Consensus parameters
  const minReportsForConsensus = 3; // Minimum number of reports needed for consensus
  const consensusThreshold = 66; // 66% agreement required (out of 100)
  const consensusTimeWindow = 3600; // 1 hour time window for reports
  const consensusEngine = await ConsensusEngine.deploy(
    statusReport.address,
    reputationSystem.address,
    minReportsForConsensus,
    consensusThreshold,
    consensusTimeWindow
  );
  console.log(`ConsensusEngine deployed to: ${consensusEngine.address}`);
  
  // Deploy RewardDistribution
  console.log("\nDeploying RewardDistribution...");
  const RewardDistribution = await ethers.getContractFactory("RewardDistribution");
  const rewardDistribution = await RewardDistribution.deploy(
    uptimeToken.address,
    nodeRegistry.address,
    reputationSystem.address,
    consensusEngine.address
  );
  console.log(`RewardDistribution deployed to: ${rewardDistribution.address}`);
  
  // Print the deployment summary
  console.log("\n==== Deployment Summary ====");
  console.log(`UptimeToken: ${uptimeToken.address}`);
  console.log(`WebsiteRegistry: ${websiteRegistry.address}`);
  console.log(`NodeRegistry: ${nodeRegistry.address}`);
  console.log(`StatusReport: ${statusReport.address}`);
  console.log(`ReputationSystem: ${reputationSystem.address}`);
  console.log(`ConsensusEngine: ${consensusEngine.address}`);
  console.log(`RewardDistribution: ${rewardDistribution.address}`);
  
  console.log("\nDeployment complete! To use these contracts:");
  console.log("1. Update config/contract-addresses.json with these addresses");
  console.log("2. Run 'node scripts/sync-abis.js' to sync the ABIs");
  console.log("3. Run 'node scripts/check-configuration.js' to verify the configuration");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 