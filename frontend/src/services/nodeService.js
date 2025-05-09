import { ethers } from 'ethers';
import web3Service from './web3Service';
import getContractAddresses from './contractAddresses';
import NodeRegistryABI from '../contracts/abis/NodeRegistry.json';

/**
 * NodeService - Service for interacting with NodeRegistry contract
 */
class NodeService {
  constructor() {
    const addresses = getContractAddresses();
    this.contractAddress = addresses.NodeRegistry;
    this.abi = NodeRegistryABI;
    this.contract = null;
    this._contractVerified = false;
  }

  /**
   * Initialize the node registry contract
   * @param {boolean} useSigner - Whether to use a signer (for write operations)
   * @returns {ethers.Contract} - The contract instance
   */
  async initContract(useSigner = false) {
    try {
      // If we already have a contract instance and we're not changing from/to signer, reuse it
      if (this.contract) {
        // Only reinitialize if we need to change the signer status
        const hasSigner = this.contract.signer !== null && this.contract.signer !== undefined;
        if (hasSigner === useSigner) {
          return this.contract;
        }
      }

      // Create contract instance
      this.contract = web3Service.getContract(
        this.contractAddress,
        this.abi,
        useSigner
      );
      
      // Verify contract only once
      if (!this._contractVerified) {
        try {
          // Simple verification - try to call nodeCount method
          const count = await this.contract.nodeCount();
          console.log('NodeRegistry contract connected, node count:', count.toString());
          this._contractVerified = true;
        } catch (error) {
          console.warn('Could not verify NodeRegistry contract functionality:', error.message);
          // Continue anyway, as this might just be a method name issue
        }
      }
      
      return this.contract;
    } catch (error) {
      console.error('Error initializing node registry contract:', error);
      throw error;
    }
  }

  /**
   * Register a new node for validating websites
   * @param {string} name - Node name
   * @param {string} endpoint - Node API endpoint
   * @returns {Promise<ethers.providers.TransactionResponse>} - Transaction response
   */
  async registerNode(name, endpoint) {
    try {
      const contract = await this.initContract(true);
      const tx = await contract.registerNode(name, endpoint);
      return tx;
    } catch (error) {
      console.error('Error registering node:', error);
      throw error;
    }
  }

  /**
   * Get a node by address
   * @param {string} nodeAddress - Node Ethereum address
   * @returns {Promise<Object>} - Node details
   */
  async getNode(nodeAddress = null) {
    try {
      if (!this.contract) {
        await this.initContract();
      }
      
      // If no address provided, use the connected wallet address
      if (!nodeAddress) {
        nodeAddress = web3Service.getAccount();
      }
      
      if (!nodeAddress) {
        return null;
      }
      
      // Get node IDs owned by this address
      const nodeIds = await this.contract.getNodesByOwner(nodeAddress);
      
      // If no nodes found for this address
      if (!nodeIds || nodeIds.length === 0) {
        return null;
      }
      
      // Get the first node's details
      const nodeId = nodeIds[0].toNumber();
      const node = await this.getNodeById(nodeId);
      
      if (!node) {
        return null;
      }
      
      // Format the response into a more usable object
      return {
        id: nodeId,
        address: nodeAddress,
        name: node.name,
        endpoint: node.endpoint,
        owner: node.owner,
        active: node.active
      };
    } catch (error) {
      console.error(`Error fetching node with address ${nodeAddress}:`, error);
      return null;
    }
  }

  /**
   * Get the total number of registered nodes
   * @returns {Promise<number>} - Number of nodes
   */
  async getNodeCount() {
    try {
      if (!this.contract) {
        await this.initContract();
      }
      
      // Use nodeCount() instead of getNodeCount()
      const count = await this.contract.nodeCount();
      return count.toNumber();
    } catch (error) {
      console.error('Error fetching node count:', error);
      return 0;
    }
  }

  /**
   * Get multiple nodes by page
   * @param {number} startIndex - Starting index
   * @param {number} count - Number of nodes to fetch
   * @returns {Promise<Array>} - Array of node objects
   */
  async getNodes(startIndex = 0, count = 10) {
    try {
      if (!this.contract) {
        await this.initContract();
      }
      
      // The contract doesn't have a getNodes method, so we'll build our own implementation
      // using nodeCount and then fetching each node individually
      const totalCount = await this.getNodeCount();
      const endIndex = Math.min(startIndex + count, totalCount);
      
      if (startIndex >= totalCount) {
        return [];
      }
      
      // Fetch details for each node ID in the range
      const nodePromises = [];
      for (let i = startIndex; i < endIndex; i++) {
        nodePromises.push(this.getNodeById(i));
      }
      
      const nodes = await Promise.all(nodePromises);
      
      // Filter out any null results (errors)
      return nodes.filter(node => node !== null);
    } catch (error) {
      console.error(`Error fetching nodes from index ${startIndex}:`, error);
      return [];
    }
  }

  /**
   * Update a node's details
   * @param {number} nodeId - ID of the node to update
   * @param {string} name - New node name
   * @param {string} endpoint - New node API endpoint
   * @param {boolean} active - Whether the node should be active
   * @returns {Promise<ethers.providers.TransactionResponse>} - Transaction response
   */
  async updateNode(nodeId, name, endpoint, active) {
    try {
      const contract = await this.initContract(true);
      const tx = await contract.updateNode(nodeId, name, endpoint, active);
      return tx;
    } catch (error) {
      console.error('Error updating node:', error);
      throw error;
    }
  }

  /**
   * Set a node as inactive (deactivate)
   * @param {number} nodeId - ID of the node to deactivate
   * @returns {Promise<ethers.providers.TransactionResponse>} - Transaction response
   */
  async deactivateNode(nodeId) {
    try {
      const contract = await this.initContract(true);
      
      // First get current node details
      const node = await this.getNodeById(nodeId);
      if (!node) {
        throw new Error(`Node with ID ${nodeId} not found`);
      }
      
      // Update the node but set active to false
      const tx = await contract.updateNode(
        nodeId, 
        node.name, 
        node.endpoint, 
        false // Set inactive
      );
      return tx;
    } catch (error) {
      console.error(`Error deactivating node ${nodeId}:`, error);
      throw error;
    }
  }

  /**
   * Get a node by ID
   * @param {number} nodeId - Node ID
   * @returns {Promise<Object>} - Node details
   */
  async getNodeById(nodeId) {
    try {
      if (!this.contract) {
        await this.initContract();
      }
      
      const node = await this.contract.getNodeDetails(nodeId);
      
      // Format the response into a more usable object
      return {
        id: nodeId,
        name: node.name,
        endpoint: node.endpoint,
        owner: node.owner,
        active: node.active
      };
    } catch (error) {
      console.error(`Error fetching node with ID ${nodeId}:`, error);
      return null;
    }
  }

  /**
   * Check if a node is currently active
   * @param {string} nodeAddress - Node address to check
   * @returns {Promise<boolean>} - Node active status
   */
  async isNodeActive(nodeAddress = null) {
    try {
      // Get the node by address
      const node = await this.getNode(nodeAddress);
      
      // If no node found, or node is not active
      if (!node) {
        return false;
      }
      
      return node.active;
    } catch (error) {
      console.error(`Error checking if node ${nodeAddress} is active:`, error);
      return false;
    }
  }

  /**
   * Check if the current user is registered as a node
   * @returns {Promise<boolean>} - Is registered status
   */
  async isUserRegisteredAsNode() {
    try {
      const currentAccount = web3Service.getAccount();
      if (!currentAccount) {
        return false;
      }
      
      const node = await this.getNode(currentAccount);
      return node !== null;
    } catch (error) {
      console.error('Error checking if user is a registered node:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const nodeService = new NodeService();
export default nodeService; 