const axios = require('axios');
const { ethers } = require('ethers');
const cron = require('node-cron');
const WebsiteStatusChecker = require('./WebsiteStatusChecker');
const BlockchainService = require('./BlockchainService');

class NodeClient {
  constructor(logger) {
    this.logger = logger;
    this.blockchainService = new BlockchainService(this.logger);
    this.statusChecker = new WebsiteStatusChecker(this.logger);
    this.cronJobs = [];
  }

  /**
   * Register a new node with the NodeRegistry contract
   * @param {string} name - The name of the node
   * @param {string} endpoint - The endpoint URL of the node
   * @returns {Promise<{nodeId: number, tx: object}>} - The node ID and transaction information
   */
  async registerNode(name, endpoint) {
    this.logger.info(`Registering node with name: ${name} and endpoint: ${endpoint}`);
    return await this.blockchainService.registerNode(name, endpoint);
  }

  /**
   * Check the status of a specific website
   * @param {number} websiteId - The ID of the website to check
   * @param {number} nodeId - The ID of the node performing the check
   * @returns {Promise<object>} - The check result and transaction information
   */
  async checkWebsite(websiteId, nodeId) {
    this.logger.info(`Checking website with ID: ${websiteId} as node: ${nodeId}`);
    
    try {
      // Get website details from the blockchain
      const websiteDetails = await this.blockchainService.getWebsiteDetails(websiteId);
      this.logger.debug(`Website details: ${JSON.stringify(websiteDetails)}`);
      
      // Check the website status
      const statusResult = await this.statusChecker.checkWebsite(websiteDetails.url);
      this.logger.debug(`Status check result: ${JSON.stringify(statusResult)}`);
      
      // Report the status to the blockchain
      const reportResult = await this.blockchainService.submitStatusReport(
        websiteId, 
        nodeId,
        statusResult.status,
        statusResult.responseTime,
        statusResult.message
      );
      
      return {
        websiteId,
        nodeId,
        statusResult,
        reportResult
      };
    } catch (error) {
      this.logger.error(`Error checking website: ${error.message}`);
      throw error;
    }
  }

  /**
   * Start automatic checking of all active websites
   * @param {number} intervalMinutes - The interval in minutes between checks
   * @param {number} nodeId - The ID of the node performing the checks
   * @returns {Promise<void>}
   */
  async startAutomaticChecking(intervalMinutes, nodeId) {
    this.logger.info(`Starting automatic website checking every ${intervalMinutes} minutes as node: ${nodeId}`);
    
    // Stop any existing cron jobs
    this.stopAutomaticChecking();
    
    // Create a new cron job for checking websites
    const cronExpression = `*/${intervalMinutes} * * * *`; // Run every X minutes
    const job = cron.schedule(cronExpression, async () => {
      try {
        this.logger.info('Running scheduled website checks...');
        
        // Get all active websites from the blockchain
        const websites = await this.blockchainService.getActiveWebsites();
        this.logger.info(`Found ${websites.length} active websites to check`);
        
        // Check each website
        for (const website of websites) {
          try {
            await this.checkWebsite(website.id, nodeId);
            this.logger.info(`Successfully checked website ${website.id} (${website.url})`);
          } catch (error) {
            this.logger.error(`Error checking website ${website.id}: ${error.message}`);
            // Continue with next website even if one fails
          }
        }
      } catch (error) {
        this.logger.error(`Error in automatic checking: ${error.message}`);
      }
    });
    
    job.start();
    this.cronJobs.push(job);
    
    this.logger.info('Automatic checking started successfully');
    return { success: true, message: 'Automatic checking started', interval: intervalMinutes };
  }

  /**
   * Stop automatic website checking
   */
  stopAutomaticChecking() {
    this.logger.info('Stopping all automatic website checking jobs');
    
    for (const job of this.cronJobs) {
      job.stop();
    }
    
    this.cronJobs = [];
    this.logger.info('All automatic checking jobs stopped');
    
    return { success: true, message: 'Automatic checking stopped' };
  }

  /**
   * Get the status and statistics of a node
   * @param {number} nodeId - The ID of the node
   * @returns {Promise<object>} - The node status information
   */
  async getNodeStatus(nodeId) {
    this.logger.info(`Getting status for node: ${nodeId}`);
    
    try {
      // Get node details from the blockchain
      const nodeDetails = await this.blockchainService.getNodeDetails(nodeId);
      
      // Get reports submitted by this node
      const reports = await this.blockchainService.getReportsByNode(nodeId);
      
      // Get node reputation
      const reputation = await this.blockchainService.getNodeReputation(nodeId);
      
      // Get node rewards
      const rewards = await this.blockchainService.getNodeRewards(nodeId);
      
      return {
        nodeId,
        details: nodeDetails,
        reportsCount: reports.length,
        reputation,
        rewards,
        automaticCheckingActive: this.cronJobs.length > 0
      };
    } catch (error) {
      this.logger.error(`Error getting node status: ${error.message}`);
      throw error;
    }
  }
}

module.exports = NodeClient; 