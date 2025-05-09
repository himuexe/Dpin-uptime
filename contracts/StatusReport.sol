// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StatusReport
 * @dev Contract for storing website status reports from validator nodes
 */
contract StatusReport is Ownable {
    // Status codes for website state
    enum Status {
        Unknown,    // 0: Status unknown or not reported
        Online,     // 1: Website is online and responding
        Offline,    // 2: Website is offline or not responding
        Degraded    // 3: Website is responding but with issues
    }
    
    // Structure to store a single status report
    struct Report {
        uint256 websiteId;
        uint256 nodeId;
        Status status;
        uint256 responseTime; // in milliseconds
        uint256 timestamp;
        string statusMessage;
    }
    
    // Array of all reports
    Report[] public reports;
    
    // Mapping from website ID to last report ID
    mapping(uint256 => uint256) public lastReportByWebsite;
    
    // Mapping from node ID to array of report IDs submitted by that node
    mapping(uint256 => uint256[]) public reportsByNode;
    
    // Mapping from website ID to array of report IDs for that website
    mapping(uint256 => uint256[]) public reportsByWebsite;
    
    // Events
    event ReportSubmitted(
        uint256 indexed reportId,
        uint256 indexed websiteId,
        uint256 indexed nodeId,
        Status status,
        uint256 responseTime,
        uint256 timestamp
    );
    
    /**
     * @dev Initialize the contract
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Submit a new status report for a website
     * @param websiteId The ID of the website being reported
     * @param nodeId The ID of the node submitting the report
     * @param status The status code of the website
     * @param responseTime The response time in milliseconds
     * @param statusMessage Additional message about the status
     * @return reportId The ID of the submitted report
     */
    function submitReport(
        uint256 websiteId,
        uint256 nodeId,
        Status status,
        uint256 responseTime,
        string calldata statusMessage
    ) external returns (uint256) {
        // In a production environment, verify that the caller is authorized
        // to submit reports for this node
        
        uint256 reportId = reports.length;
        
        reports.push(Report({
            websiteId: websiteId,
            nodeId: nodeId,
            status: status,
            responseTime: responseTime,
            timestamp: block.timestamp,
            statusMessage: statusMessage
        }));
        
        lastReportByWebsite[websiteId] = reportId;
        reportsByNode[nodeId].push(reportId);
        reportsByWebsite[websiteId].push(reportId);
        
        emit ReportSubmitted(
            reportId,
            websiteId,
            nodeId,
            status,
            responseTime,
            block.timestamp
        );
        
        return reportId;
    }
    
    /**
     * @dev Get the latest status report for a website
     * @param websiteId The ID of the website
     * @return reportId The ID of the latest report
     * @return status The status of the website
     * @return responseTime The response time in milliseconds
     * @return timestamp The timestamp of the report
     * @return statusMessage Additional message about the status
     */
    function getLatestReport(uint256 websiteId) external view returns (
        uint256 reportId,
        Status status,
        uint256 responseTime,
        uint256 timestamp,
        string memory statusMessage
    ) {
        require(reportsByWebsite[websiteId].length > 0, "StatusReport: No reports for this website");
        
        reportId = lastReportByWebsite[websiteId];
        Report storage report = reports[reportId];
        
        return (
            reportId,
            report.status,
            report.responseTime,
            report.timestamp,
            report.statusMessage
        );
    }
    
    /**
     * @dev Get all report IDs for a website
     * @param websiteId The ID of the website
     * @return reportIds Array of report IDs for the website
     */
    function getReportsByWebsite(uint256 websiteId) external view returns (uint256[] memory) {
        return reportsByWebsite[websiteId];
    }
    
    /**
     * @dev Get all report IDs submitted by a node
     * @param nodeId The ID of the node
     * @return reportIds Array of report IDs submitted by the node
     */
    function getReportsByNode(uint256 nodeId) external view returns (uint256[] memory) {
        return reportsByNode[nodeId];
    }
    
    /**
     * @dev Get the details of a report
     * @param reportId The ID of the report
     * @return websiteId The ID of the website
     * @return nodeId The ID of the node
     * @return status The status of the website
     * @return responseTime The response time in milliseconds
     * @return timestamp The timestamp of the report
     * @return statusMessage Additional message about the status
     */
    function getReportDetails(uint256 reportId) external view returns (
        uint256 websiteId,
        uint256 nodeId,
        Status status,
        uint256 responseTime,
        uint256 timestamp,
        string memory statusMessage
    ) {
        require(reportId < reports.length, "StatusReport: Invalid report ID");
        Report storage report = reports[reportId];
        
        return (
            report.websiteId,
            report.nodeId,
            report.status,
            report.responseTime,
            report.timestamp,
            report.statusMessage
        );
    }
    
    /**
     * @dev Get recent reports for a website (up to a specified count)
     * @param websiteId The ID of the website
     * @param count The maximum number of reports to return
     * @return reportIds Array of recent report IDs
     */
    function getRecentReports(uint256 websiteId, uint256 count) external view returns (uint256[] memory) {
        uint256[] storage allReports = reportsByWebsite[websiteId];
        uint256 reportsCount = allReports.length;
        
        if (reportsCount == 0) {
            return new uint256[](0);
        }
        
        uint256 resultCount = count;
        if (resultCount > reportsCount) {
            resultCount = reportsCount;
        }
        
        uint256[] memory result = new uint256[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = allReports[reportsCount - resultCount + i];
        }
        
        return result;
    }
} 