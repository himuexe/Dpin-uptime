// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationSystem
 * @dev Contract for managing node reputation based on reporting accuracy
 */
contract ReputationSystem is Ownable {
    // Reputation score thresholds
    uint256 public constant MIN_REPUTATION = 0;
    uint256 public constant MAX_REPUTATION = 100;
    uint256 public constant INITIAL_REPUTATION = 50;
    
    // Minimum reputation required to receive rewards
    uint256 public minReputationForRewards;
    
    // Structure to store node reputation data
    struct NodeReputation {
        uint256 score;
        uint256 correctReports;
        uint256 incorrectReports;
        uint256 lastUpdateTime;
    }
    
    // Mapping from node ID to reputation data
    mapping(uint256 => NodeReputation) public nodeReputations;
    
    // Events
    event ReputationUpdated(uint256 indexed nodeId, uint256 oldScore, uint256 newScore);
    event MinReputationForRewardsChanged(uint256 oldThreshold, uint256 newThreshold);
    
    /**
     * @dev Initialize the contract
     * @param _minReputationForRewards The minimum reputation score required for rewards
     */
    constructor(uint256 _minReputationForRewards) Ownable(msg.sender) {
        require(_minReputationForRewards <= MAX_REPUTATION, "ReputationSystem: Threshold too high");
        minReputationForRewards = _minReputationForRewards;
    }
    
    /**
     * @dev Initialize a new node's reputation
     * @param nodeId The ID of the node
     */
    function initializeNodeReputation(uint256 nodeId) public {
        require(nodeReputations[nodeId].lastUpdateTime == 0, "ReputationSystem: Already initialized");
        
        nodeReputations[nodeId] = NodeReputation({
            score: INITIAL_REPUTATION,
            correctReports: 0,
            incorrectReports: 0,
            lastUpdateTime: block.timestamp
        });
        
        emit ReputationUpdated(nodeId, 0, INITIAL_REPUTATION);
    }
    
    /**
     * @dev Record a correct report from a node
     * @param nodeId The ID of the node
     */
    function recordCorrectReport(uint256 nodeId) external {
        NodeReputation storage reputation = nodeReputations[nodeId];
        
        // Ensure the node has been initialized
        if (reputation.lastUpdateTime == 0) {
            initializeNodeReputation(nodeId);
            reputation = nodeReputations[nodeId];
        }
        
        // In a production environment, only allow trusted contracts to call this
        // require(msg.sender == consensusContractAddress, "ReputationSystem: Not authorized");
        
        uint256 oldScore = reputation.score;
        reputation.correctReports++;
        
        // Increase reputation score (bounded by MAX_REPUTATION)
        if (reputation.score < MAX_REPUTATION) {
            // Simple reputation increase algorithm
            // In a production system, this would be more sophisticated
            reputation.score = min(reputation.score + 1, MAX_REPUTATION);
        }
        
        reputation.lastUpdateTime = block.timestamp;
        
        emit ReputationUpdated(nodeId, oldScore, reputation.score);
    }
    
    /**
     * @dev Record an incorrect report from a node
     * @param nodeId The ID of the node
     */
    function recordIncorrectReport(uint256 nodeId) external {
        NodeReputation storage reputation = nodeReputations[nodeId];
        
        // Ensure the node has been initialized
        if (reputation.lastUpdateTime == 0) {
            initializeNodeReputation(nodeId);
            reputation = nodeReputations[nodeId];
        }
        
        // In a production environment, only allow trusted contracts to call this
        // require(msg.sender == consensusContractAddress, "ReputationSystem: Not authorized");
        
        uint256 oldScore = reputation.score;
        reputation.incorrectReports++;
        
        // Decrease reputation score (bounded by MIN_REPUTATION)
        if (reputation.score > MIN_REPUTATION) {
            // Simple reputation decrease algorithm
            // In a production system, this would be more sophisticated
            reputation.score = max(reputation.score - 2, MIN_REPUTATION);
        }
        
        reputation.lastUpdateTime = block.timestamp;
        
        emit ReputationUpdated(nodeId, oldScore, reputation.score);
    }
    
    /**
     * @dev Check if a node is eligible for rewards based on its reputation
     * @param nodeId The ID of the node
     * @return isEligible Whether the node is eligible for rewards
     */
    function isEligibleForRewards(uint256 nodeId) external view returns (bool) {
        return nodeReputations[nodeId].score >= minReputationForRewards;
    }
    
    /**
     * @dev Set the minimum reputation required for rewards
     * @param _minReputationForRewards The new minimum reputation threshold
     */
    function setMinReputationForRewards(uint256 _minReputationForRewards) external onlyOwner {
        require(_minReputationForRewards <= MAX_REPUTATION, "ReputationSystem: Threshold too high");
        
        uint256 oldThreshold = minReputationForRewards;
        minReputationForRewards = _minReputationForRewards;
        
        emit MinReputationForRewardsChanged(oldThreshold, _minReputationForRewards);
    }
    
    /**
     * @dev Get the reputation details of a node
     * @param nodeId The ID of the node
     * @return score The reputation score
     * @return correctReports The number of correct reports
     * @return incorrectReports The number of incorrect reports
     * @return lastUpdateTime The last time the reputation was updated
     */
    function getNodeReputation(uint256 nodeId) external view returns (
        uint256 score,
        uint256 correctReports,
        uint256 incorrectReports,
        uint256 lastUpdateTime
    ) {
        NodeReputation storage reputation = nodeReputations[nodeId];
        
        return (
            reputation.score,
            reputation.correctReports,
            reputation.incorrectReports,
            reputation.lastUpdateTime
        );
    }
    
    /**
     * @dev Helper function to get the minimum of two values
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    /**
     * @dev Helper function to get the maximum of two values
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
} 