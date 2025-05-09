// Import the contract addresses from the contracts directory
import CONTRACT_ADDRESSES from '../contracts/contract-addresses';

// Get contract addresses based on current environment
const getContractAddresses = () => {
  // Default to the addresses imported from contracts directory
  return CONTRACT_ADDRESSES;
};

export default getContractAddresses; 