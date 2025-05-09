import { ethers } from 'ethers';
import web3Service from './web3Service';
import getContractAddresses from './contractAddresses';
import WebsiteRegistryABI from '../contracts/abis/WebsiteRegistry.json';
import CONTRACT_ADDRESSES from '../contracts/contract-addresses';

/**
 * WebsiteService - Service for interacting with WebsiteRegistry contract
 */
class WebsiteService {
  constructor() {
    // Get addresses from both sources to handle migration period
    const addresses = getContractAddresses();
    const contractAddresses = CONTRACT_ADDRESSES;

    // Use contract-addresses.js as primary source, fallback to contractAddresses.js
    this.contractAddress = contractAddresses.WebsiteRegistry || addresses.WebsiteRegistry;
    this.abi = WebsiteRegistryABI;
    this.contract = null;
    this._contractVerified = false;
    
    // Local storage for additional data not stored in the contract
    this.websiteData = JSON.parse(localStorage.getItem('dpin-website-data') || '{}');
    
    // Log the contract address for debugging
    console.log('WebsiteRegistry contract address:', this.contractAddress);
  }

  /**
   * Initialize the website registry contract
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
      
      // Check if contract address is valid
      if (!this.contractAddress || !ethers.utils.isAddress(this.contractAddress)) {
        console.error('Invalid WebsiteRegistry contract address:', this.contractAddress);
        return null;
      }
      
      // Create contract instance
      this.contract = web3Service.getContract(
        this.contractAddress,
        this.abi,
        useSigner
      );
      
      // Check if the contract exists - but only do this once
      if (!this._contractVerified) {
        try {
          const exists = await web3Service.contractExists(this.contractAddress);
          if (!exists) {
            console.error('WebsiteRegistry contract does not exist at address:', this.contractAddress);
            throw new Error(`No contract found at ${this.contractAddress}`);
          }
          
          // Try to call a function on the contract to verify it works
          // Try multiple methods to ensure compatibility
          let contractVerified = false;
          
          try {
            // Method 1: Try owner()
            const owner = await this.contract.owner();
            console.log('WebsiteRegistry contract connected, owner:', owner);
            contractVerified = true;
          } catch (e1) {
            console.log('owner() method not available, trying alternative verification...');
            
            try {
              // Method 2: Try websiteCount()
              const count = await this.contract.websiteCount();
              console.log('WebsiteRegistry contract connected, website count:', count.toString());
              contractVerified = true;
            } catch (e2) {
              console.log('websiteCount() method not available, trying final verification...');
              
              try {
                // Method 3: Try calling getWebsitesByOwner with zero address
                const websites = await this.contract.getWebsitesByOwner('0x0000000000000000000000000000000000000000');
                console.log('WebsiteRegistry contract connected, verified via getWebsitesByOwner');
                contractVerified = true;
              } catch (e3) {
                console.error('Failed to call any verification methods:', e3.message);
                throw new Error('Contract exists but no verification methods succeeded');
              }
            }
          }
          
          if (!contractVerified) {
            throw new Error('Failed to verify contract functionality');
          }
          
          // Mark as verified to prevent repeated verification
          this._contractVerified = true;
        } catch (error) {
          console.error('Failed to validate WebsiteRegistry contract:', error);
          throw new Error(`Cannot connect to WebsiteRegistry contract: ${error.message}`);
        }
      }
      
      return this.contract;
    } catch (error) {
      console.error('Error initializing website registry contract:', error);
      return null;
    }
  }

  /**
   * Register a new website for monitoring
   * @param {string} name - Website name
   * @param {string} url - Website URL
   * @param {string} description - Website description (stored client-side only)
   * @returns {Promise<Object>} - Transaction result with additional details
   */
  async registerWebsite(name, url, description) {
    try {
      console.log('Registering website with params:', { name, url, description });
      
      // Validate inputs
      if (!name || !url) {
        throw new Error('Missing required parameters for website registration');
      }
      
      // Validate URL format
      if (!url.match(/^https?:\/\//)) {
        url = 'https://' + url;
      }
      
      // Initialize contract
      const contract = await this.initContract(true);
      if (!contract) {
        throw new Error('Website registry contract not initialized');
      }
      
      // Set explicit gas configuration for the transaction
      const gasLimit = await this.estimateGasWithBuffer(
        contract, 
        'registerWebsite', 
        [url, name], // NOTE: Contract expects url first, then name
        1.2 // 20% buffer
      );
      
      const options = {
        gasLimit: gasLimit
      };
      
      console.log('Sending transaction with options:', options);
      
      // Send transaction - passing arguments in the correct order as expected by the contract
      const tx = await contract.registerWebsite(url, name);
      console.log('Transaction submitted:', tx.hash);
      
      // Store additional data client-side since the contract doesn't store these
      this.saveAdditionalWebsiteData(tx.hash, {
        description,
        txHash: tx.hash,
        timestamp: Date.now()
      });
      
      // Return transaction with additional status info
      return {
        ...tx,
        status: 'pending',
        confirmationPromise: this.getConfirmationWithStatus(tx)
      };
    } catch (error) {
      console.error('Error registering website:', error);
      
      // Extract detailed error information
      const errorDetails = web3Service.constructor.getTransactionErrorDetails(error);
      
      // Enhanced error object
      const enhancedError = new Error(errorDetails.message);
      enhancedError.code = errorDetails.code;
      enhancedError.reason = errorDetails.reason;
      enhancedError.originalError = error;
      
      throw enhancedError;
    }
  }
  
  /**
   * Save additional website data to local storage
   * @param {string} key - Unique identifier (transaction hash or website ID)
   * @param {Object} data - Additional website data
   * @private
   */
  saveAdditionalWebsiteData(key, data) {
    try {
      this.websiteData[key] = data;
      localStorage.setItem('dpin-website-data', JSON.stringify(this.websiteData));
      console.log('Saved additional website data:', data);
    } catch (error) {
      console.error('Error saving additional website data:', error);
    }
  }
  
  /**
   * Get additional website data from local storage
   * @param {string} key - Unique identifier (transaction hash or website ID)
   * @returns {Object|null} - Additional website data or null if not found
   * @private
   */
  getAdditionalWebsiteData(key) {
    return this.websiteData[key] || null;
  }
  
  /**
   * Estimate gas with a safety buffer
   * @param {ethers.Contract} contract - Contract instance
   * @param {string} method - Method name to call
   * @param {Array} params - Parameters for the method
   * @param {number} buffer - Multiplier for gas estimate (default: 1.5)
   * @returns {ethers.BigNumber} - Gas limit with buffer
   */
  async estimateGasWithBuffer(contract, method, params, buffer = 1.5) {
    try {
      // Create a transaction object for the contract call
      const tx = await contract.populateTransaction[method](...params);
      
      // Estimate gas
      const gasEstimate = await web3Service.provider.estimateGas(tx);
      
      // Add buffer and return
      return ethers.BigNumber.from(
        Math.floor(gasEstimate.toNumber() * buffer)
      );
    } catch (error) {
      console.error(`Error estimating gas for ${method}:`, error);
      
      // Return a high default if estimation fails
      return ethers.BigNumber.from(3000000); // 3 million gas
    }
  }
  
  /**
   * Get transaction confirmation with status updates
   * @param {Object} tx - Transaction object
   * @returns {Promise<Object>} - Confirmation result with status
   */
  async getConfirmationWithStatus(tx) {
    try {
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Return result with status
      return {
        ...receipt,
        status: receipt.status === 1 ? 'success' : 'failed',
        message: receipt.status === 1 
          ? 'Transaction confirmed successfully' 
          : 'Transaction failed on-chain'
      };
    } catch (error) {
      console.error('Error confirming transaction:', error);
      
      // Enhanced error result
      return {
        status: 'failed',
        message: `Transaction failed: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Get a website by ID
   * @param {number} websiteId - Website ID
   * @returns {Promise<Object>} - Website details
   */
  async getWebsite(websiteId) {
    try {
      const contract = await this.initContract();
      if (!contract) return null;
      
      // Check if the website ID is valid (less than the total count)
      try {
        const count = await contract.websiteCount();
        if (websiteId >= count.toNumber()) {
          // Silently return null for non-existent websites rather than error
          return null;
        }
      } catch (countError) {
        // If we can't check the count, we'll try to get the details anyway
        console.warn('Could not validate website ID against total count:', countError);
      }
      
      // Use getWebsiteDetails instead of direct mapping access
      const details = await contract.getWebsiteDetails(websiteId);
      
      // Format the response to match our app's expected structure
      const website = {
        id: websiteId,
        url: details.url,
        name: details.name,
        owner: details.owner,
        active: details.active,
        registrationTime: details.registrationTime.toNumber(),
        lastCheckTime: details.lastCheckTime.toNumber()
      };
      
      // Get any additional data from local storage
      const additionalData = this.getAdditionalWebsiteData(websiteId.toString());
      if (additionalData) {
        website.description = additionalData.description;
      }
      
      return website;
    } catch (error) {
      // Check if this is an "Invalid website ID" error, which shouldn't be treated as a true error
      if (error.message && (
        error.message.includes("Invalid website ID") || 
        (error.reason && error.reason.includes("Invalid website ID"))
      )) {
        // This is expected for non-existent websites, return null without logging an error
        return null;
      }
      
      // For all other errors, log and return null
      console.error(`Error getting website #${websiteId}:`, error);
      return null;
    }
  }

  /**
   * Get the total number of websites registered
   * @returns {Promise<number>} - Total website count
   */
  async getWebsiteCount() {
    try {
      const contract = await this.initContract();
      if (!contract) return 0;
      
      const count = await contract.websiteCount();
      return count.toNumber();
    } catch (error) {
      console.error('Error getting website count:', error);
      return 0;
    }
  }

  /**
   * Get all websites owned by an address
   * @param {string} ownerAddress - Owner address (defaults to connected wallet)
   * @returns {Promise<Array>} - Array of website objects
   */
  async getWebsitesByOwner(ownerAddress = null) {
    try {
      const contract = await this.initContract();
      if (!contract) return [];
      
      // Use connected wallet if no address provided
      const owner = ownerAddress || web3Service.getAccount();
      if (!owner) {
        throw new Error('No owner address provided and no wallet connected');
      }
      
      // Get website IDs for the owner
      const websiteIds = await contract.getWebsitesByOwner(owner);
      
      // Get details for each website
      const websites = [];
      for (const id of websiteIds) {
        const website = await this.getWebsite(id.toNumber());
        if (website) {
          websites.push(website);
        }
      }
      
      return websites;
    } catch (error) {
      console.error('Error getting websites by owner:', error);
      return [];
    }
  }

  /**
   * Update a website's check frequency
   * @param {number} websiteId - Website ID
   * @param {number} checkFrequency - New check frequency in minutes
   * @returns {Promise<Object>} - Transaction result
   */
  async updateCheckFrequency(websiteId, checkFrequency) {
    try {
      // First, get the current website data to preserve other fields
      const website = await this.getWebsite(websiteId);
      if (!website) {
        throw new Error(`Website #${websiteId} not found`);
      }
      
      // Store the updated check frequency in local storage
      this.saveAdditionalWebsiteData(websiteId.toString(), {
        ...this.getAdditionalWebsiteData(websiteId.toString()),
        checkFrequency: checkFrequency
      });
      
      // No need to update the contract as it doesn't store check frequency
      return {
        status: 'success',
        message: 'Check frequency updated successfully'
      };
    } catch (error) {
      console.error(`Error updating check frequency for website #${websiteId}:`, error);
      
      return {
        status: 'failed',
        message: `Failed to update check frequency: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Deregister a website (set inactive)
   * @param {number} websiteId - Website ID
   * @returns {Promise<Object>} - Transaction result
   */
  async deregisterWebsite(websiteId) {
    try {
      const contract = await this.initContract(true);
      if (!contract) {
        throw new Error('Website registry contract not initialized');
      }
      
      let tx;
      
      // Try setWebsiteActive first (preferred method)
      try {
        tx = await contract.setWebsiteActive(websiteId, false);
      } catch (error) {
        console.warn('setWebsiteActive failed, trying updateWebsite as fallback:', error.message);
        
        // Get existing website data first
        const website = await this.getWebsite(websiteId);
        if (!website) {
          throw new Error(`Website #${websiteId} not found`);
        }
        
        // Use updateWebsite as fallback with existing values but active=false
        tx = await contract.updateWebsite(
          websiteId,
          website.url,
          website.name,
          false // set inactive
        );
      }
      
      console.log('Deregister transaction submitted:', tx.hash);
      
      // Return transaction with confirmation promise
      return {
        ...tx,
        status: 'pending',
        confirmationPromise: this.getConfirmationWithStatus(tx)
      };
    } catch (error) {
      console.error(`Error deregistering website #${websiteId}:`, error);
      
      const errorDetails = web3Service.constructor.getTransactionErrorDetails(error);
      
      const enhancedError = new Error(errorDetails.message);
      enhancedError.code = errorDetails.code;
      enhancedError.reason = errorDetails.reason;
      enhancedError.originalError = error;
      
      throw enhancedError;
    }
  }

  /**
   * Check if a website is active
   * @param {number} websiteId - Website ID
   * @returns {Promise<boolean>} - Whether the website is active
   */
  async isWebsiteActive(websiteId) {
    try {
      const website = await this.getWebsite(websiteId);
      return website ? website.active : false;
    } catch (error) {
      console.error(`Error checking if website #${websiteId} is active:`, error);
      return false;
    }
  }
}

export default new WebsiteService(); 