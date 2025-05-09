import { ethers } from 'ethers';
import web3Service from './web3Service';
import getContractAddresses from './contractAddresses';
import UptimeTokenABI from '../contracts/abis/UptimeToken.json';

/**
 * TokenService - Service for interacting with UptimeToken contract
 */
class TokenService {
  constructor() {
    const addresses = getContractAddresses();
    this.contractAddress = addresses.UptimeToken;
    this.abi = UptimeTokenABI;
    this.contract = null;
    this.tokenSymbol = 'UPT'; // Default value
    this.tokenDecimals = 18;  // Default value

    // Log the contract address for debugging
    console.log('UptimeToken contract address:', this.contractAddress);
  }

  /**
   * Initialize the token contract
   * @param {boolean} useSigner - Whether to use a signer (for write operations)
   * @returns {ethers.Contract} - The contract instance
   */
  async initContract(useSigner = false) {
    try {
      // Check if contract address is valid
      if (!this.contractAddress || !ethers.utils.isAddress(this.contractAddress)) {
        console.error('Invalid contract address:', this.contractAddress);
        return null;
      }

      // Create contract instance
      this.contract = web3Service.getContract(
        this.contractAddress,
        this.abi,
        useSigner
      );
      
      // Verify contract exists by calling a simple view function
      try {
        const totalSupply = await this.contract.totalSupply();
        console.log('Token total supply:', ethers.utils.formatUnits(totalSupply, 18));
      } catch (error) {
        console.error('Contract validation failed. Contract might not exist at this address:', error);
        this.contract = null;
        return null;
      }
      
      // Try to get token details, but don't fail if they can't be fetched
      try {
        if (!this.tokenSymbol || this.tokenSymbol === 'UPT') {
          this.tokenSymbol = await this.getSymbol();
        }
      } catch (error) {
        console.error('Error fetching token symbol, using default:', error);
        this.tokenSymbol = 'UPT';
      }
      
      try {
        if (!this.tokenDecimals || this.tokenDecimals === 18) {
          this.tokenDecimals = await this.getDecimals();
        }
      } catch (error) {
        console.error('Error fetching token decimals, using default:', error);
        this.tokenDecimals = 18;
      }
      
      return this.contract;
    } catch (error) {
      console.error('Error initializing token contract:', error);
      // Create a minimal contract - this won't be fully functional
      // but will prevent the app from crashing
      return null;
    }
  }

  /**
   * Get the token symbol
   * @returns {Promise<string>} - Token symbol
   */
  async getSymbol() {
    try {
      if (!this.contract) {
        await this.initContract();
      }
      
      if (!this.contract) {
        return 'UPT';
      }
      
      return await this.contract.symbol();
    } catch (error) {
      console.error('Error fetching token symbol:', error);
      return 'UPT';
    }
  }

  /**
   * Get the token decimals
   * @returns {Promise<number>} - Token decimals
   */
  async getDecimals() {
    try {
      if (!this.contract) {
        await this.initContract();
      }
      
      if (!this.contract) {
        return 18;
      }
      
      const decimals = await this.contract.decimals();
      return decimals;
    } catch (error) {
      console.error('Error fetching token decimals:', error);
      return 18; // Default to 18 decimals
    }
  }

  /**
   * Get token balance for an address
   * @param {string} address - Address to check balance for
   * @returns {Promise<string>} - Token balance formatted with decimals
   */
  async getBalance(address) {
    try {
      // Always return 100 tokens during development for better UX
      // Remove this in production
      return '100.0';
    
      /*
      if (!this.contract) {
        await this.initContract();
      }
      
      if (!this.contract) {
        return '0';
      }
      
      if (!address) {
        address = web3Service.getAccount();
      }
      
      if (!address) {
        return '0';
      }
      
      try {
        const balance = await this.contract.balanceOf(address);
        return ethers.utils.formatUnits(balance, this.tokenDecimals);
      } catch (balanceError) {
        console.error('Error in balanceOf call:', balanceError);
        return '0';
      }
      */
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0';
    }
  }

  /**
   * Transfer tokens to another address
   * @param {string} to - Recipient address
   * @param {string|number} amount - Amount to transfer
   * @returns {Promise<ethers.providers.TransactionResponse>} - Transaction response
   */
  async transfer(to, amount) {
    try {
      const contract = await this.initContract(true);
      
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      
      const amountInWei = ethers.utils.parseUnits(amount.toString(), this.tokenDecimals);
      
      const tx = await contract.transfer(to, amountInWei);
      return tx;
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }

  /**
   * Approve tokens for a spender
   * @param {string} spender - Spender address
   * @param {string|number} amount - Amount to approve
   * @returns {Promise<ethers.providers.TransactionResponse>} - Transaction response
   */
  async approve(spender, amount) {
    try {
      const contract = await this.initContract(true);
      
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      
      const amountInWei = ethers.utils.parseUnits(amount.toString(), this.tokenDecimals);
      
      const tx = await contract.approve(spender, amountInWei);
      return tx;
    } catch (error) {
      console.error('Error approving tokens:', error);
      throw error;
    }
  }

  /**
   * Get token allowance for a spender
   * @param {string} owner - Token owner address
   * @param {string} spender - Spender address
   * @returns {Promise<string>} - Allowance formatted with decimals
   */
  async getAllowance(owner, spender) {
    try {
      if (!this.contract) {
        await this.initContract();
      }
      
      if (!this.contract) {
        return '0';
      }
      
      if (!owner) {
        owner = web3Service.getAccount();
      }
      
      if (!owner || !spender) {
        return '0';
      }
      
      const allowance = await this.contract.allowance(owner, spender);
      return ethers.utils.formatUnits(allowance, this.tokenDecimals);
    } catch (error) {
      console.error('Error fetching token allowance:', error);
      return '0';
    }
  }

  /**
   * Format a token amount for display
   * @param {string|number} amount - Amount in token units
   * @param {number} displayDecimals - Number of decimals to display
   * @returns {string} - Formatted amount with symbol
   */
  async formatTokenAmount(amount, displayDecimals = 2) {
    const symbol = this.tokenSymbol;
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount)) {
      return `0 ${symbol}`;
    }
    
    return `${parsedAmount.toFixed(displayDecimals)} ${symbol}`;
  }
}

// Create and export a singleton instance
const tokenService = new TokenService();
export default tokenService; 