// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./UptimeToken.sol";
import "./ReputationSystem.sol";
import "./ConsensusEngine.sol";

/**
 * @title RewardDistribution
 * @dev Contract for distributing token rewards to node operators
 */
contract RewardDistribution is Ownable {
    // Reference to the UptimeToken contract
    UptimeToken public uptimeToken;
    
    // Reference to the ReputationSystem contract
    ReputationSystem public reputationSystem;
    
    // Reference to the ConsensusEngine contract
    ConsensusEngine public consensusEngine;
    
    // Base reward amount per report (in token units)
    uint256 public baseRewardAmount;
    
    // Reputation multiplier factor (in percentage)
    uint256 public reputationMultiplier;
    
    // Mapping from website ID to last reward distribution timestamp
    mapping(uint256 => uint256) public lastRewardTime;
    
    // Mapping to track total rewards distributed to each node
    mapping(uint256 => uint256) public totalRewardsByNode;
    
    // Events
    event RewardsDistributed(uint256 indexed websiteId, uint256 totalAmount);
    event NodeRewarded(uint256 indexed nodeId, uint256 amount);
    event RewardParametersChanged(uint256 baseAmount, uint256 multiplier);
    
    /**
     * @dev Initialize the contract
     * @param _tokenAddress Address of the UptimeToken contract
     * @param _reputationSystemAddress Address of the ReputationSystem contract
     * @param _consensusEngineAddress Address of the ConsensusEngine contract
     * @param _baseRewardAmount Base reward amount per report
     * @param _reputationMultiplier Reputation multiplier factor (in percentage)
     */
    constructor(
        address _tokenAddress,
        address _reputationSystemAddress,
        address _consensusEngineAddress,
        uint256 _baseRewardAmount,
        uint256 _reputationMultiplier
    ) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "RewardDistribution: Invalid token address");
        require(_reputationSystemAddress != address(0), "RewardDistribution: Invalid reputation system address");
        require(_consensusEngineAddress != address(0), "RewardDistribution: Invalid consensus engine address");
        
        uptimeToken = UptimeToken(_tokenAddress);
        reputationSystem = ReputationSystem(_reputationSystemAddress);
        consensusEngine = ConsensusEngine(_consensusEngineAddress);
        baseRewardAmount = _baseRewardAmount;
        reputationMultiplier = _reputationMultiplier;
    }
    
    /**
     * @dev Distribute rewards for a website consensus
     * @param websiteId The ID of the website
     */
    function distributeRewards(uint256 websiteId) external {
        // Get consensus data
        (
            ,
            ,
            uint256 consensusTimestamp,
            uint256 reportCount,
            bool isValid
        ) = consensusEngine.getWebsiteConsensus(websiteId);
        
        require(isValid, "RewardDistribution: No valid consensus");
        require(
            lastRewardTime[websiteId] < consensusTimestamp,
            "RewardDistribution: Rewards already distributed for this consensus"
        );
        
        // Get contributing nodes
        uint256[] memory contributors = consensusEngine.getConsensusContributors(websiteId);
        require(contributors.length > 0, "RewardDistribution: No contributors");
        
        // Calculate and distribute rewards
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < contributors.length; i++) {
            uint256 nodeId = contributors[i];
            
            // Check if node is eligible for rewards
            bool isEligible = reputationSystem.isEligibleForRewards(nodeId);
            
            if (isEligible) {
                // Get node reputation
                (uint256 reputationScore, , , ) = reputationSystem.getNodeReputation(nodeId);
                
                // Calculate reward with reputation multiplier
                // Formula: baseReward * (1 + (reputationScore - 50) * multiplier / 100 / 100)
                // This gives a boost for scores > 50 and reduction for scores < 50
                int256 reputationBoost = int256(reputationScore) - 50;
                uint256 adjustedMultiplier;
                
                if (reputationBoost >= 0) {
                    adjustedMultiplier = uint256(reputationBoost) * reputationMultiplier / 100;
                } else {
                    adjustedMultiplier = uint256(-reputationBoost) * reputationMultiplier / 100;
                }
                
                uint256 reward;
                if (reputationBoost >= 0) {
                    reward = baseRewardAmount * (100 + adjustedMultiplier) / 100;
                } else {
                    reward = baseRewardAmount * (100 - adjustedMultiplier) / 100;
                }
                
                // Mint and transfer tokens to the node operator
                // In a real implementation, you would use the node owner's address
                // Here we assume the node ID corresponds to the node owner's index
                address nodeOwner = msg.sender; // Placeholder, in production this would be the node owner's address
                
                uptimeToken.mint(nodeOwner, reward);
                
                // Update reward tracking
                totalRewardsByNode[nodeId] += reward;
                totalRewards += reward;
                
                emit NodeRewarded(nodeId, reward);
            }
        }
        
        // Update last reward time
        lastRewardTime[websiteId] = consensusTimestamp;
        
        emit RewardsDistributed(websiteId, totalRewards);
    }
    
    /**
     * @dev Set reward parameters
     * @param _baseRewardAmount Base reward amount per report
     * @param _reputationMultiplier Reputation multiplier factor
     */
    function setRewardParameters(
        uint256 _baseRewardAmount,
        uint256 _reputationMultiplier
    ) external onlyOwner {
        baseRewardAmount = _baseRewardAmount;
        reputationMultiplier = _reputationMultiplier;
        
        emit RewardParametersChanged(_baseRewardAmount, _reputationMultiplier);
    }
    
    /**
     * @dev Get the total rewards distributed to a node
     * @param nodeId The ID of the node
     * @return totalRewards Total rewards distributed to the node
     */
    function getNodeTotalRewards(uint256 nodeId) external view returns (uint256) {
        return totalRewardsByNode[nodeId];
    }
} 