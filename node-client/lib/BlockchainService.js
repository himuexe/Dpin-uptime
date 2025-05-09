const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// Smart contract ABIs
const NodeRegistryABI = require('../abis/NodeRegistry.json');
const StatusReportABI = require('../abis/StatusReport.json');
const WebsiteRegistryABI = require('../abis/WebsiteRegistry.json');
const ReputationSystemABI = require('../abis/ReputationSystem.json');
const RewardDistributionABI = require('../abis/RewardDistribution.json');

class BlockchainService {
  constructor(logger) {
    this.logger = logger;
    
    // Initialize ethers provider and signer
    this.initialize();
  }

  /**
   * Initialize ethers provider and signer
   */
  initialize() {
    try {
      // Get RPC URL and private key from environment variables
      const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
      const privateKey = process.env.PRIVATE_KEY;
      
      if (!privateKey) {
        throw new Error('Private key not found in environment variables');
      }
      
      // Create ethers provider and signer
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Get contract addresses from environment variables
      this.nodeRegistryAddress = process.env.NODE_REGISTRY_ADDRESS;
      this.statusReportAddress = process.env.STATUS_REPORT_ADDRESS;
      this.websiteRegistryAddress = process.env.WEBSITE_REGISTRY_ADDRESS;
      this.reputationSystemAddress = process.env.REPUTATION_SYSTEM_ADDRESS;
      this.rewardDistributionAddress = process.env.REWARD_DISTRIBUTION_ADDRESS;
      
      if (!this.nodeRegistryAddress || !this.statusReportAddress || !this.websiteRegistryAddress) {
        throw new Error('Contract addresses not found in environment variables');
      }
      
      // Create contract instances
      this.nodeRegistry = new ethers.Contract(
        this.nodeRegistryAddress,
        NodeRegistryABI,
        this.wallet
      );
      
      this.statusReport = new ethers.Contract(
        this.statusReportAddress,
        StatusReportABI,
        this.wallet
      );
      
      this.websiteRegistry = new ethers.Contract(
        this.websiteRegistryAddress,
        WebsiteRegistryABI,
        this.wallet
      );
      
      // Optional contracts
      if (this.reputationSystemAddress) {
        this.reputationSystem = new ethers.Contract(
          this.reputationSystemAddress,
          ReputationSystemABI,
          this.wallet
        );
      }
      
      if (this.rewardDistributionAddress) {
        this.rewardDistribution = new ethers.Contract(
          this.rewardDistributionAddress,
          RewardDistributionABI,
          this.wallet
        );
      }
      
      this.logger.info('BlockchainService initialized successfully');
    } catch (error) {
      this.logger.error(`Error initializing BlockchainService: ${error.message}`);
      throw error;
    }
  }

  /**
   * Register a new node with the NodeRegistry contract
   * @param {string} name - The name of the node
   * @param {string} endpoint - The endpoint URL of the node
   * @returns {Promise<{nodeId: number, tx: object}>} - The node ID and transaction information
   */
  async registerNode(name, endpoint) {
    try {
      const tx = await this.nodeRegistry.registerNode(name, endpoint);
      const receipt = await tx.wait();
      
      // Extract the node ID from the event
      const event = receipt.events.find(e => e.event === 'NodeRegistered');
      const nodeId = event ? event.args.nodeId.toNumber() : null;
      
      this.logger.info(`Node registered successfully with ID: ${nodeId}`);
      
      return {
        nodeId,
        tx: receipt
      };
    } catch (error) {
      this.logger.error(`Error registering node: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the details of a website
   * @param {number} websiteId - The ID of the website
   * @returns {Promise<object>} - The website details
   */
  async getWebsiteDetails(websiteId) {
    try {
      const details = await this.websiteRegistry.getWebsiteDetails(websiteId);
      
      return {
        url: details[0],
        name: details[1],
        owner: details[2],
        active: details[3],
        registrationTime: details[4].toNumber(),
        lastCheckTime: details[5].toNumber()
      };
    } catch (error) {
      this.logger.error(`Error getting website details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all active websites
   * @returns {Promise<Array<{id: number, url: string, name: string, owner: string, active: boolean}>>}
   */
  async getActiveWebsites() {
    try {
      // Get total website count
      const count = await this.websiteRegistry.websiteCount();
      const websites = [];
      
      // Iterate through all websites
      for (let i = 0; i < count; i++) {
        try {
          const details = await this.getWebsiteDetails(i);
          
          // Only include active websites
          if (details.active) {
            websites.push({
              id: i,
              ...details
            });
          }
        } catch (error) {
          this.logger.error(`Error getting details for website ${i}: ${error.message}`);
          // Continue to the next website
        }
      }
      
      return websites;
    } catch (error) {
      this.logger.error(`Error getting active websites: ${error.message}`);
      throw error;
    }
  }

  /**
   * Submit a status report for a website
   * @param {number} websiteId - The ID of the website
   * @param {number} nodeId - The ID of the node
   * @param {number} status - The status code (0: Unknown, 1: Online, 2: Offline, 3: Degraded)
   * @param {number} responseTime - The response time in milliseconds
   * @param {string} statusMessage - A message describing the status
   * @returns {Promise<{reportId: number, tx: object}>} - The report ID and transaction information
   */
  async submitStatusReport(websiteId, nodeId, status, responseTime, statusMessage) {
    try {
      const tx = await this.statusReport.submitReport(
        websiteId,
        nodeId,
        status,
        responseTime,
        statusMessage
      );
      
      const receipt = await tx.wait();
      
      // Extract the report ID from the event
      const event = receipt.events.find(e => e.event === 'ReportSubmitted');
      const reportId = event ? event.args.reportId.toNumber() : null;
      
      this.logger.info(`Status report submitted successfully with ID: ${reportId}`);
      
      return {
        reportId,
        tx: receipt
      };
    } catch (error) {
      this.logger.error(`Error submitting status report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the details of a node
   * @param {number} nodeId - The ID of the node
   * @returns {Promise<object>} - The node details
   */
  async getNodeDetails(nodeId) {
    try {
      const details = await this.nodeRegistry.getNodeDetails(nodeId);
      
      return {
        name: details[0],
        endpoint: details[1],
        owner: details[2],
        active: details[3],
        registrationTime: details[4].toNumber(),
        lastReportTime: details[5].toNumber(),
        reportsSubmitted: details[6].toNumber()
      };
    } catch (error) {
      this.logger.error(`Error getting node details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all reports submitted by a node
   * @param {number} nodeId - The ID of the node
   * @returns {Promise<Array<object>>} - Array of reports
   */
  async getReportsByNode(nodeId) {
    try {
      const reportIds = await this.statusReport.getReportsByNode(nodeId);
      const reports = [];
      
      for (const reportId of reportIds) {
        try {
          const details = await this.statusReport.getReportDetails(reportId);
          
          reports.push({
            id: reportId.toNumber(),
            websiteId: details[0].toNumber(),
            nodeId: details[1].toNumber(),
            status: details[2],
            responseTime: details[3].toNumber(),
            timestamp: details[4].toNumber(),
            statusMessage: details[5]
          });
        } catch (error) {
          this.logger.error(`Error getting details for report ${reportId}: ${error.message}`);
          // Continue to the next report
        }
      }
      
      return reports;
    } catch (error) {
      this.logger.error(`Error getting reports by node: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the reputation of a node (if ReputationSystem contract is available)
   * @param {number} nodeId - The ID of the node
   * @returns {Promise<object|null>} - The node reputation or null if not available
   */
  async getNodeReputation(nodeId) {
    if (!this.reputationSystem) {
      this.logger.warn('ReputationSystem contract not available');
      return null;
    }
    
    try {
      const reputation = await this.reputationSystem.getNodeReputation(nodeId);
      
      return {
        score: reputation[0].toNumber(),
        total: reputation[1].toNumber(),
        count: reputation[2].toNumber()
      };
    } catch (error) {
      this.logger.error(`Error getting node reputation: ${error.message}`);
      return null;
    }
  }

  /**
   * Get the rewards earned by a node (if RewardDistribution contract is available)
   * @param {number} nodeId - The ID of the node
   * @returns {Promise<object|null>} - The node rewards or null if not available
   */
  async getNodeRewards(nodeId) {
    if (!this.rewardDistribution) {
      this.logger.warn('RewardDistribution contract not available');
      return null;
    }
    
    try {
      const rewards = await this.rewardDistribution.getNodeRewards(nodeId);
      
      return {
        total: ethers.utils.formatEther(rewards[0]),
        pending: ethers.utils.formatEther(rewards[1]),
        claimed: ethers.utils.formatEther(rewards[2])
      };
    } catch (error) {
      this.logger.error(`Error getting node rewards: ${error.message}`);
      return null;
    }
  }
}

module.exports = BlockchainService; 