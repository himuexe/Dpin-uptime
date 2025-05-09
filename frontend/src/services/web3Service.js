import { ethers } from 'ethers';

/**
 * Web3Service - Manages wallet connections and general Ethereum interactions
 */
class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.networkId = null;
    this.connected = false;
    this.ethereum = window.ethereum;
    
    // Event callbacks
    this.onAccountChange = null;
    this.onNetworkChange = null;
    this.onConnect = null;
    this.onDisconnect = null;
    this.onError = null; // Add error callback
    
    // Initialize - check if already connected
    this.init();
  }
  
  /**
   * Initialize the service and set up MetaMask event listeners
   */
  async init() {
    // Prevent multiple simultaneous initialization
    if (this._initializing) {
      console.log('Web3Service initialization already in progress, skipping');
      return;
    }
    
    this._initializing = true;
    
    try {
      if (this.ethereum) {
        try {
          // Create ethers provider with appropriate network
          this.provider = new ethers.providers.Web3Provider(this.ethereum, {
            name: "hardhat",
            chainId: 31337
          });
          
          // Set up event listeners only once
          if (!this._listenersSet) {
            this.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
            this.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
            this.ethereum.on('disconnect', this.handleDisconnect.bind(this));
            this._listenersSet = true;
          }
          
          // Check if already connected
          try {
            const accounts = await this.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              this.handleAccountsChanged(accounts);
            }
          } catch (error) {
            console.error('Error checking existing connection:', error);
            this.emitError('Failed to check wallet connection', error);
          }
        } catch (error) {
          console.error('Error initializing web3 service:', error);
          this.emitError('Failed to initialize Web3 service', error);
        }
      } else {
        console.log('No Ethereum provider detected. Please install MetaMask or another Web3 wallet.');
      }
    } finally {
      // Release initialization lock after a short delay to prevent rapid re-initialization
      setTimeout(() => {
        this._initializing = false;
      }, 1000);
    }
  }
  
  /**
   * Emit an error event
   * @param {string} message - User-friendly error message
   * @param {Error} error - Original error object
   */
  emitError(message, error) {
    if (this.onError) {
      this.onError(message, error);
    }
  }
  
  /**
   * Connect to MetaMask wallet
   * @returns {Promise<string>} - Connected account address
   */
  async connect() {
    if (!this.ethereum) {
      const error = new Error('MetaMask not installed');
      this.emitError('Web3 wallet not detected. Please install MetaMask from https://metamask.io/', error);
      throw error;
    }
    
    try {
      console.log('Attempting to connect to wallet...');
      const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' });
      this.handleAccountsChanged(accounts);
      await this.getNetworkId();
      
      // Verify we're on the right network (for local development, this should be Hardhat's network)
      if (this.networkId !== 31337) {
        console.warn(`Connected to network ${this.networkId}, but expected Hardhat network (31337)`);
        console.log('Attempting to switch to Hardhat network...');
        
        try {
          // Try to switch to Hardhat network
          await this.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7A69' }], // 31337 in hex
          });
          
          // Re-fetch network ID after switching
          await this.getNetworkId();
          console.log(`Successfully switched to ${this.getNetworkName()}`);
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await this.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x7A69', // 31337 in hex
                    chainName: 'Hardhat Local',
                    nativeCurrency: {
                      name: 'Ethereum',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['http://127.0.0.1:8545/'],
                  },
                ],
              });
              // Re-fetch network ID after adding
              await this.getNetworkId();
              console.log(`Successfully added and switched to ${this.getNetworkName()}`);
            } catch (addError) {
              console.error('Error adding Hardhat network to MetaMask:', addError);
              this.emitError('Could not add Hardhat network to your wallet. Please add it manually.', addError);
            }
          } else {
            console.error('Error switching to Hardhat network:', switchError);
            this.emitError('Could not switch to Hardhat network. Please switch manually.', switchError);
          }
        }
      }
      
      return this.account;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      
      // Provide more specific error messaging
      if (error.code === 4001) {
        this.emitError('Connection rejected by user. Please approve the connection in your wallet.', error);
      } else if (error.code === -32002) {
        this.emitError('Connection request already pending. Check your wallet and approve the connection.', error);
      } else if (error.message && error.message.includes("Already processing eth_requestAccounts")) {
        this.emitError('Connection request already in progress. Please check your MetaMask popup.', error);
      } else if (!window.ethereum) {
        this.emitError('MetaMask not detected. Please install MetaMask from https://metamask.io/', error);
      } else if (error.message && error.message.includes("RPC")) {
        this.emitError('Network connection error. Make sure your Hardhat node is running at http://127.0.0.1:8545/', error);
      } else {
        this.emitError('Failed to connect to wallet. Please try again or refresh the page.', error);
      }
      
      throw error;
    }
  }
  
  /**
   * Get the current network ID
   * @returns {Promise<number>} - Network ID
   */
  async getNetworkId() {
    if (!this.provider) return null;
    
    try {
      const network = await this.provider.getNetwork();
      this.networkId = network.chainId;
      return this.networkId;
    } catch (error) {
      console.error('Error getting network ID:', error);
      this.emitError('Failed to get network information', error);
      
      // Default to Hardhat's network ID
      this.networkId = 31337;
      return this.networkId;
    }
  }
  
  /**
   * Get network name based on chain ID
   * @param {number} chainId - The chain ID
   * @returns {string} - Network name
   */
  getNetworkName(chainId = null) {
    const id = chainId || this.networkId;
    
    switch (id) {
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Goerli Testnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 31337:
        return 'Hardhat Local';
      default:
        return `Network #${id}`;
    }
  }
  
  /**
   * Check if wallet is connected
   * @returns {boolean} - Connection status
   */
  isConnected() {
    return this.connected && !!this.account;
  }
  
  /**
   * Get the current account address
   * @returns {string|null} - Account address or null if not connected
   */
  getAccount() {
    return this.account;
  }
  
  /**
   * Get a signer for sending transactions
   * @returns {ethers.Signer|null} - Signer object or null if not connected
   */
  getSigner() {
    if (!this.provider || !this.account) {
      return null;
    }
    try {
      return this.provider.getSigner();
    } catch (error) {
      console.error('Error getting signer:', error);
      this.emitError('Failed to get transaction signer', error);
      return null;
    }
  }
  
  /**
   * Check if a contract exists at an address
   * @param {string} address - Contract address to check
   * @returns {Promise<boolean>} - True if contract exists, false otherwise
   */
  async contractExists(address) {
    if (!this.provider) return false;
    
    try {
      // Validate address format
      if (!address || !ethers.utils.isAddress(address)) {
        console.error('Invalid contract address format:', address);
        return false;
      }
      
      // Check if there's code at the address (contracts have code, EOAs don't)
      const code = await this.provider.getCode(address);
      return code !== '0x';
    } catch (error) {
      console.error('Error checking contract existence:', error);
      this.emitError(`Failed to verify contract at ${address}`, error);
      return false;
    }
  }
  
  /**
   * Get a contract instance
   * @param {string} address - Contract address
   * @param {Array} abi - Contract ABI
   * @param {boolean} useSigner - Whether to connect with a signer for writing
   * @returns {ethers.Contract} - Contract instance
   */
  getContract(address, abi, useSigner = false) {
    if (!this.provider) {
      const error = new Error('Provider not initialized');
      this.emitError('Blockchain connection not available', error);
      throw error;
    }
    
    try {
      // Check if address is valid
      if (!address || !ethers.utils.isAddress(address)) {
        const error = new Error(`Invalid contract address: ${address}`);
        console.error(error.message);
        this.emitError('Invalid contract address format', error);
        throw error;
      }
      
      if (useSigner) {
        const signer = this.getSigner();
        if (!signer) {
          const error = new Error('Signer not available. Connect wallet first.');
          this.emitError('Wallet not connected. Please connect your wallet.', error);
          throw error;
        }
        return new ethers.Contract(address, abi, signer);
      }
      return new ethers.Contract(address, abi, this.provider);
    } catch (error) {
      console.error('Error creating contract instance:', error);
      if (!error.message.includes('Invalid contract address')) {
        this.emitError('Failed to initialize contract interface', error);
      }
      throw error;
    }
  }
  
  /**
   * Estimate gas for a transaction
   * @param {Object} tx - Transaction object
   * @returns {Promise<ethers.BigNumber>} - Estimated gas
   */
  async estimateGas(tx) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    try {
      return await this.provider.estimateGas(tx);
    } catch (error) {
      console.error('Error estimating gas:', error);
      
      // Try to extract more useful information from the error
      let errorMessage = 'Transaction would fail';
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for common errors and provide better messages
      if (errorMessage.includes('insufficient funds')) {
        this.emitError('Insufficient funds for transaction', error);
      } else {
        this.emitError(`Transaction would fail: ${errorMessage}`, error);
      }
      
      throw error;
    }
  }
  
  /**
   * Handle account changes from MetaMask
   * @param {Array} accounts - Array of account addresses
   */
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // User logged out or disconnected
      this.account = null;
      this.connected = false;
      if (this.onDisconnect) this.onDisconnect();
    } else {
      // User connected or changed account
      const wasConnected = this.connected;
      this.account = accounts[0];
      this.connected = true;
      
      if (!wasConnected) {
        if (this.onConnect) this.onConnect(this.account);
      } else {
        if (this.onAccountChange) this.onAccountChange(this.account);
      }
    }
  }
  
  /**
   * Handle network changes from MetaMask
   * @param {string} chainId - New chain ID in hex
   */
  handleChainChanged(chainId) {
    // Convert hex chainId to decimal
    this.networkId = parseInt(chainId, 16);
    
    // Reload the page as recommended by MetaMask
    window.location.reload();
    
    if (this.onNetworkChange) {
      this.onNetworkChange(this.networkId);
    }
  }
  
  /**
   * Handle disconnect events from MetaMask
   */
  handleDisconnect() {
    this.account = null;
    this.connected = false;
    if (this.onDisconnect) this.onDisconnect();
  }
  
  /**
   * Format an address for display (truncate middle)
   * @param {string} address - Ethereum address
   * @returns {string} - Formatted address (e.g., 0x1234...5678)
   */
  static formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  
  /**
   * Format an address for display (truncate middle)
   * Non-static version for instance use
   * @param {string} address - Ethereum address
   * @returns {string} - Formatted address (e.g., 0x1234...5678)
   */
  formatAddress(address) {
    return Web3Service.formatAddress(address);
  }
  
  /**
   * Format ETH value with specified decimals
   * @param {string|number} value - Value in wei
   * @param {number} decimals - Number of decimals (default: 18 for ETH)
   * @returns {string} - Formatted value in ETH
   */
  static formatEth(value, decimals = 18) {
    return ethers.utils.formatUnits(value, decimals);
  }
  
  /**
   * Parse ETH value to wei
   * @param {string|number} value - Value in ETH
   * @param {number} decimals - Number of decimals (default: 18 for ETH)
   * @returns {ethers.BigNumber} - Value in wei as BigNumber
   */
  static parseEth(value, decimals = 18) {
    return ethers.utils.parseUnits(value.toString(), decimals);
  }
  
  /**
   * Get transaction error details
   * @param {Error} error - Transaction error
   * @returns {Object} - Formatted error details
   */
  static getTransactionErrorDetails(error) {
    const details = {
      message: 'Transaction failed',
      code: null,
      reason: null,
      originalError: error
    };
    
    if (!error) return details;
    
    // Extract code
    if (error.code) {
      details.code = error.code;
    }
    
    // Try to get a user-friendly message
    if (error.reason) {
      details.reason = error.reason;
      details.message = `Transaction failed: ${error.reason}`;
    } else if (error.error && error.error.message) {
      details.reason = error.error.message;
      details.message = `Transaction failed: ${error.error.message}`;
    } else if (error.message) {
      // Extract reason from message if possible
      if (error.message.includes('execution reverted:')) {
        const match = error.message.match(/execution reverted: (.*?)(?:"\}|$)/);
        if (match && match[1]) {
          details.reason = match[1];
          details.message = `Transaction failed: ${match[1]}`;
        } else {
          details.message = error.message;
        }
      } else {
        details.message = error.message;
      }
    }
    
    // Check for specific error codes
    if (details.code === 4001) {
      details.message = 'Transaction rejected by user';
    } else if (details.code === -32603) {
      details.message = 'Internal JSON-RPC error';
      
      // Try to extract gas estimation errors
      if (error.message && error.message.includes('gas required exceeds allowance')) {
        details.message = 'Transaction would exceed gas limit';
      }
    }
    
    return details;
  }
}

// Create and export a singleton instance
const web3Service = new Web3Service();
export default web3Service; 