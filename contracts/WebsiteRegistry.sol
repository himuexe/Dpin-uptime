// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WebsiteRegistry
 * @dev Contract for registering and managing websites to be monitored
 */
contract WebsiteRegistry is Ownable {
    // Structure to store website information
    struct Website {
        string url;
        string name;
        address owner;
        bool active;
        uint256 registrationTime;
        uint256 lastCheckTime;
    }
    
    // Mapping from website ID to Website struct
    mapping(uint256 => Website) public websites;
    
    // Mapping to track websites owned by an address
    mapping(address => uint256[]) public websitesByOwner;
    
    // Total number of registered websites
    uint256 public websiteCount;
    
    // Events
    event WebsiteRegistered(uint256 indexed websiteId, string url, address indexed owner);
    event WebsiteUpdated(uint256 indexed websiteId, string url, bool active);
    event WebsiteStatusChanged(uint256 indexed websiteId, bool active);
    
    /**
     * @dev Initialize the contract
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register a new website for monitoring
     * @param url The URL of the website to monitor
     * @param name The name of the website
     * @return websiteId The ID of the registered website
     */
    function registerWebsite(string calldata url, string calldata name) external returns (uint256) {
        require(bytes(url).length > 0, "WebsiteRegistry: URL cannot be empty");
        require(bytes(name).length > 0, "WebsiteRegistry: Name cannot be empty");
        
        uint256 websiteId = websiteCount;
        
        websites[websiteId] = Website({
            url: url,
            name: name,
            owner: msg.sender,
            active: true,
            registrationTime: block.timestamp,
            lastCheckTime: 0
        });
        
        websitesByOwner[msg.sender].push(websiteId);
        websiteCount++;
        
        emit WebsiteRegistered(websiteId, url, msg.sender);
        
        return websiteId;
    }
    
    /**
     * @dev Update a website's information
     * @param websiteId The ID of the website to update
     * @param url The new URL of the website
     * @param name The new name of the website
     * @param active Whether the website is active
     */
    function updateWebsite(
        uint256 websiteId, 
        string calldata url, 
        string calldata name, 
        bool active
    ) external {
        require(websiteId < websiteCount, "WebsiteRegistry: Invalid website ID");
        Website storage website = websites[websiteId];
        
        require(website.owner == msg.sender, "WebsiteRegistry: Not the website owner");
        
        if (bytes(url).length > 0) {
            website.url = url;
        }
        
        if (bytes(name).length > 0) {
            website.name = name;
        }
        
        website.active = active;
        
        emit WebsiteUpdated(websiteId, website.url, active);
    }
    
    /**
     * @dev Set the active status of a website
     * @param websiteId The ID of the website
     * @param active The new active status
     */
    function setWebsiteActive(uint256 websiteId, bool active) external {
        require(websiteId < websiteCount, "WebsiteRegistry: Invalid website ID");
        Website storage website = websites[websiteId];
        
        require(website.owner == msg.sender, "WebsiteRegistry: Not the website owner");
        
        website.active = active;
        
        emit WebsiteStatusChanged(websiteId, active);
    }
    
    /**
     * @dev Update the last check time of a website
     * @param websiteId The ID of the website
     */
    function updateLastCheckTime(uint256 websiteId) external {
        require(websiteId < websiteCount, "WebsiteRegistry: Invalid website ID");
        websites[websiteId].lastCheckTime = block.timestamp;
    }
    
    /**
     * @dev Get all websites owned by a specific address
     * @param owner The address of the website owner
     * @return websiteIds Array of website IDs owned by the address
     */
    function getWebsitesByOwner(address owner) external view returns (uint256[] memory) {
        return websitesByOwner[owner];
    }
    
    /**
     * @dev Get the details of a website
     * @param websiteId The ID of the website
     * @return url The URL of the website
     * @return name The name of the website
     * @return owner The owner of the website
     * @return active Whether the website is active
     * @return registrationTime The time when the website was registered
     * @return lastCheckTime The last time the website was checked
     */
    function getWebsiteDetails(uint256 websiteId) external view returns (
        string memory url,
        string memory name,
        address owner,
        bool active,
        uint256 registrationTime,
        uint256 lastCheckTime
    ) {
        require(websiteId < websiteCount, "WebsiteRegistry: Invalid website ID");
        Website storage website = websites[websiteId];
        
        return (
            website.url,
            website.name,
            website.owner,
            website.active,
            website.registrationTime,
            website.lastCheckTime
        );
    }
} 