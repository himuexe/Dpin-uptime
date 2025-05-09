// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NodeRegistry
 * @dev Contract for registering and managing validator nodes
 */
contract NodeRegistry is Ownable {
    // Structure to store node information
    struct Node {
        string name;
        string endpoint;
        address owner;
        bool active;
        uint256 registrationTime;
        uint256 lastReportTime;
        uint256 reportsSubmitted;
    }
    
    // Mapping from node ID to Node struct
    mapping(uint256 => Node) public nodes;
    
    // Mapping from node owner to node IDs
    mapping(address => uint256[]) public nodesByOwner;
    
    // Total number of registered nodes
    uint256 public nodeCount;
    
    // Minimum stake required to register a node (could be linked to token contract)
    uint256 public minimumStake;
    
    // Events
    event NodeRegistered(uint256 indexed nodeId, string name, address indexed owner);
    event NodeUpdated(uint256 indexed nodeId, string name, bool active);
    event NodeStatusChanged(uint256 indexed nodeId, bool active);
    event MinimumStakeChanged(uint256 oldStake, uint256 newStake);
    
    /**
     * @dev Initialize the contract
     * @param _minimumStake The minimum stake required to register a node
     */
    constructor(uint256 _minimumStake) Ownable(msg.sender) {
        minimumStake = _minimumStake;
    }
    
    /**
     * @dev Register a new validator node
     * @param name The name of the node
     * @param endpoint The API endpoint of the node
     * @return nodeId The ID of the registered node
     */
    function registerNode(string calldata name, string calldata endpoint) external returns (uint256) {
        require(bytes(name).length > 0, "NodeRegistry: Name cannot be empty");
        require(bytes(endpoint).length > 0, "NodeRegistry: Endpoint cannot be empty");
        
        // In a real implementation, check if the caller has staked the minimum amount
        // require(stakeToken.balanceOf(msg.sender) >= minimumStake, "NodeRegistry: Insufficient stake");
        
        uint256 nodeId = nodeCount;
        
        nodes[nodeId] = Node({
            name: name,
            endpoint: endpoint,
            owner: msg.sender,
            active: true,
            registrationTime: block.timestamp,
            lastReportTime: 0,
            reportsSubmitted: 0
        });
        
        nodesByOwner[msg.sender].push(nodeId);
        nodeCount++;
        
        emit NodeRegistered(nodeId, name, msg.sender);
        
        return nodeId;
    }
    
    /**
     * @dev Update a node's information
     * @param nodeId The ID of the node to update
     * @param name The new name of the node
     * @param endpoint The new endpoint of the node
     * @param active Whether the node is active
     */
    function updateNode(
        uint256 nodeId, 
        string calldata name, 
        string calldata endpoint, 
        bool active
    ) external {
        require(nodeId < nodeCount, "NodeRegistry: Invalid node ID");
        Node storage node = nodes[nodeId];
        
        require(node.owner == msg.sender, "NodeRegistry: Not the node owner");
        
        if (bytes(name).length > 0) {
            node.name = name;
        }
        
        if (bytes(endpoint).length > 0) {
            node.endpoint = endpoint;
        }
        
        node.active = active;
        
        emit NodeUpdated(nodeId, node.name, active);
    }
    
    /**
     * @dev Set the active status of a node
     * @param nodeId The ID of the node
     * @param active The new active status
     */
    function setNodeActive(uint256 nodeId, bool active) external {
        require(nodeId < nodeCount, "NodeRegistry: Invalid node ID");
        Node storage node = nodes[nodeId];
        
        require(node.owner == msg.sender, "NodeRegistry: Not the node owner");
        
        node.active = active;
        
        emit NodeStatusChanged(nodeId, active);
    }
    
    /**
     * @dev Update node's report statistics
     * @param nodeId The ID of the node
     */
    function recordReport(uint256 nodeId) external {
        require(nodeId < nodeCount, "NodeRegistry: Invalid node ID");
        
        // In a production environment, only allow the ReportContract to call this
        // require(msg.sender == reportContractAddress, "NodeRegistry: Not authorized");
        
        Node storage node = nodes[nodeId];
        node.lastReportTime = block.timestamp;
        node.reportsSubmitted++;
    }
    
    /**
     * @dev Set the minimum stake required to register a node
     * @param _minimumStake The new minimum stake
     */
    function setMinimumStake(uint256 _minimumStake) external onlyOwner {
        uint256 oldStake = minimumStake;
        minimumStake = _minimumStake;
        
        emit MinimumStakeChanged(oldStake, _minimumStake);
    }
    
    /**
     * @dev Get all nodes owned by a specific address
     * @param owner The address of the node owner
     * @return nodeIds Array of node IDs owned by the address
     */
    function getNodesByOwner(address owner) external view returns (uint256[] memory) {
        return nodesByOwner[owner];
    }
    
    /**
     * @dev Get the details of a node
     * @param nodeId The ID of the node
     * @return name The name of the node
     * @return endpoint The endpoint of the node
     * @return owner The owner of the node
     * @return active Whether the node is active
     * @return registrationTime The time when the node was registered
     * @return lastReportTime The last time the node submitted a report
     * @return reportsSubmitted The number of reports submitted by the node
     */
    function getNodeDetails(uint256 nodeId) external view returns (
        string memory name,
        string memory endpoint,
        address owner,
        bool active,
        uint256 registrationTime,
        uint256 lastReportTime,
        uint256 reportsSubmitted
    ) {
        require(nodeId < nodeCount, "NodeRegistry: Invalid node ID");
        Node storage node = nodes[nodeId];
        
        return (
            node.name,
            node.endpoint,
            node.owner,
            node.active,
            node.registrationTime,
            node.lastReportTime,
            node.reportsSubmitted
        );
    }
} 