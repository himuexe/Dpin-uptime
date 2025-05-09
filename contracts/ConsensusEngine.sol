// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./StatusReport.sol";
import "./ReputationSystem.sol";

/**
 * @title ConsensusEngine
 * @dev Contract for aggregating and validating node reports to determine website status consensus
 */
contract ConsensusEngine is Ownable {
    // Minimum number of reports needed to reach consensus
    uint256 public minReportsForConsensus;
    
    // Percentage threshold for consensus agreement (out of 100)
    uint256 public consensusThreshold;
    
    // Time window for reports to be considered in the same consensus round (in seconds)
    uint256 public consensusTimeWindow;
    
    // Reference to the StatusReport contract
    StatusReport public statusReportContract;
    
    // Reference to the ReputationSystem contract
    ReputationSystem public reputationSystemContract;
    
    // Structure to store consensus data for a website
    struct ConsensusData {
        StatusReport.Status status;
        uint256 responseTime;
        uint256 timestamp;
        uint256 reportCount;
        bool isValid;
    }
    
    // Mapping from website ID to latest consensus data
    mapping(uint256 => ConsensusData) public websiteConsensus;
    
    // Mapping from website ID to array of node IDs that contributed to the last consensus
    mapping(uint256 => uint256[]) public consensusContributors;
    
    // Events
    event ConsensusReached(
        uint256 indexed websiteId,
        StatusReport.Status status,
        uint256 responseTime,
        uint256 reportCount,
        uint256 timestamp
    );
    
    event ConsensusParametersChanged(
        uint256 minReports,
        uint256 threshold,
        uint256 timeWindow
    );
    
    /**
     * @dev Initialize the contract
     * @param _statusReportAddress Address of the StatusReport contract
     * @param _reputationSystemAddress Address of the ReputationSystem contract
     * @param _minReportsForConsensus Minimum number of reports needed for consensus
     * @param _consensusThreshold Percentage threshold for consensus agreement
     * @param _consensusTimeWindow Time window for considering reports in the same round
     */
    constructor(
        address _statusReportAddress,
        address _reputationSystemAddress,
        uint256 _minReportsForConsensus,
        uint256 _consensusThreshold,
        uint256 _consensusTimeWindow
    ) Ownable(msg.sender) {
        require(_statusReportAddress != address(0), "ConsensusEngine: Invalid status report address");
        require(_reputationSystemAddress != address(0), "ConsensusEngine: Invalid reputation system address");
        require(_consensusThreshold <= 100, "ConsensusEngine: Threshold must be <= 100");
        require(_minReportsForConsensus > 0, "ConsensusEngine: Min reports must be > 0");
        
        statusReportContract = StatusReport(_statusReportAddress);
        reputationSystemContract = ReputationSystem(_reputationSystemAddress);
        minReportsForConsensus = _minReportsForConsensus;
        consensusThreshold = _consensusThreshold;
        consensusTimeWindow = _consensusTimeWindow;
    }
    
    /**
     * @dev Process a new report and update consensus if possible
     * @param reportId The ID of the report to process
     */
    function processReport(uint256 reportId) external {
        // Get report details
        (
            uint256 websiteId,
            uint256 nodeId,
            StatusReport.Status status,
            uint256 responseTime,
            uint256 timestamp,
            string memory statusMessage
        ) = statusReportContract.getReportDetails(reportId);
        
        // Simplified consensus algorithm for MVP
        // In a production system, this would be more sophisticated
        
        // Get recent reports for this website
        uint256[] memory recentReportIds = statusReportContract.getRecentReports(websiteId, 10);
        
        if (recentReportIds.length < minReportsForConsensus) {
            // Not enough reports to reach consensus
            return;
        }
        
        // Count reports for each status
        uint256 onlineCount = 0;
        uint256 offlineCount = 0;
        uint256 degradedCount = 0;
        uint256 totalResponseTime = 0;
        uint256[] memory contributorNodeIds = new uint256[](recentReportIds.length);
        uint256 contributorCount = 0;
        
        for (uint256 i = 0; i < recentReportIds.length; i++) {
            (
                ,
                uint256 rNodeId,
                StatusReport.Status rStatus,
                uint256 rResponseTime,
                uint256 rTimestamp,
                string memory rStatusMessage
            ) = statusReportContract.getReportDetails(recentReportIds[i]);
            
            // Only consider reports within the time window
            if (block.timestamp - rTimestamp <= consensusTimeWindow) {
                if (rStatus == StatusReport.Status.Online) {
                    onlineCount++;
                } else if (rStatus == StatusReport.Status.Offline) {
                    offlineCount++;
                } else if (rStatus == StatusReport.Status.Degraded) {
                    degradedCount++;
                }
                
                totalResponseTime += rResponseTime;
                
                // Add node to contributors if not already added
                bool alreadyContributor = false;
                for (uint256 j = 0; j < contributorCount; j++) {
                    if (contributorNodeIds[j] == rNodeId) {
                        alreadyContributor = true;
                        break;
                    }
                }
                
                if (!alreadyContributor) {
                    contributorNodeIds[contributorCount] = rNodeId;
                    contributorCount++;
                }
            }
        }
        
        // Determine the majority status
        StatusReport.Status majorityStatus;
        uint256 maxCount = 0;
        
        if (onlineCount > maxCount) {
            maxCount = onlineCount;
            majorityStatus = StatusReport.Status.Online;
        }
        
        if (offlineCount > maxCount) {
            maxCount = offlineCount;
            majorityStatus = StatusReport.Status.Offline;
        }
        
        if (degradedCount > maxCount) {
            maxCount = degradedCount;
            majorityStatus = StatusReport.Status.Degraded;
        }
        
        // Calculate the total report count
        uint256 totalCount = onlineCount + offlineCount + degradedCount;
        
        // Check if consensus threshold is reached
        if (totalCount >= minReportsForConsensus && 
            (maxCount * 100 / totalCount) >= consensusThreshold) {
            
            // Consensus reached
            uint256 avgResponseTime = totalResponseTime / totalCount;
            
            // Update consensus data
            websiteConsensus[websiteId] = ConsensusData({
                status: majorityStatus,
                responseTime: avgResponseTime,
                timestamp: block.timestamp,
                reportCount: totalCount,
                isValid: true
            });
            
            // Store contributors
            delete consensusContributors[websiteId];
            for (uint256 i = 0; i < contributorCount; i++) {
                consensusContributors[websiteId].push(contributorNodeIds[i]);
                
                // Compare each node's report with consensus
                uint256 nodeIdToCheck = contributorNodeIds[i];
                bool foundReport = false;
                
                // Find the report from this node
                for (uint256 j = 0; j < recentReportIds.length; j++) {
                    (
                        uint256 reportWebsiteId,
                        uint256 reportNodeId,
                        StatusReport.Status reportStatus,
                        uint256 reportResponseTime,
                        uint256 reportTimestamp,
                        string memory reportStatusMessage
                    ) = statusReportContract.getReportDetails(recentReportIds[j]);
                    
                    if (reportNodeId == nodeIdToCheck && block.timestamp - reportTimestamp <= consensusTimeWindow) {
                        foundReport = true;
                        
                        if (reportStatus == majorityStatus) {
                            // Correct report, increase reputation
                            reputationSystemContract.recordCorrectReport(nodeIdToCheck);
                        } else {
                            // Incorrect report, decrease reputation
                            reputationSystemContract.recordIncorrectReport(nodeIdToCheck);
                        }
                        
                        break;
                    }
                }
            }
            
            emit ConsensusReached(
                websiteId,
                majorityStatus,
                avgResponseTime,
                totalCount,
                block.timestamp
            );
        }
    }
    
    /**
     * @dev Get the latest consensus data for a website
     * @param websiteId The ID of the website
     * @return status The consensus status
     * @return responseTime The average response time
     * @return timestamp The timestamp of the consensus
     * @return reportCount The number of reports that contributed to the consensus
     * @return isValid Whether valid consensus data exists
     */
    function getWebsiteConsensus(uint256 websiteId) external view returns (
        StatusReport.Status status,
        uint256 responseTime,
        uint256 timestamp,
        uint256 reportCount,
        bool isValid
    ) {
        ConsensusData storage consensus = websiteConsensus[websiteId];
        
        return (
            consensus.status,
            consensus.responseTime,
            consensus.timestamp,
            consensus.reportCount,
            consensus.isValid
        );
    }
    
    /**
     * @dev Get the nodes that contributed to the latest consensus for a website
     * @param websiteId The ID of the website
     * @return nodeIds Array of node IDs that contributed to the consensus
     */
    function getConsensusContributors(uint256 websiteId) external view returns (uint256[] memory) {
        return consensusContributors[websiteId];
    }
    
    /**
     * @dev Set consensus parameters
     * @param _minReportsForConsensus Minimum number of reports needed for consensus
     * @param _consensusThreshold Percentage threshold for consensus agreement
     * @param _consensusTimeWindow Time window for considering reports in the same round
     */
    function setConsensusParameters(
        uint256 _minReportsForConsensus,
        uint256 _consensusThreshold,
        uint256 _consensusTimeWindow
    ) external onlyOwner {
        require(_consensusThreshold <= 100, "ConsensusEngine: Threshold must be <= 100");
        require(_minReportsForConsensus > 0, "ConsensusEngine: Min reports must be > 0");
        
        minReportsForConsensus = _minReportsForConsensus;
        consensusThreshold = _consensusThreshold;
        consensusTimeWindow = _consensusTimeWindow;
        
        emit ConsensusParametersChanged(
            _minReportsForConsensus,
            _consensusThreshold,
            _consensusTimeWindow
        );
    }
} 