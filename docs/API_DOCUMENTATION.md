# DePIN Uptime Platform: API Documentation

This document provides detailed API documentation for the DePIN Uptime Platform's smart contracts and service layers.

## Table of Contents

1. [Smart Contract APIs](#smart-contract-apis)
   - [WebsiteRegistry](#websiteregistry)
   - [NodeRegistry](#noderegistry)
   - [StatusReport](#statusreport)
   - [ConsensusEngine](#consensusengine)
   - [ReputationSystem](#reputationsystem)
   - [RewardDistribution](#rewarddistribution)
   - [UptimeToken](#uptimetoken)
2. [Frontend Service APIs](#frontend-service-apis)
   - [Web3Service](#web3service)
   - [WebsiteService](#websiteservice)
   - [NodeService](#nodeservice)
   - [ReportService](#reportservice)
3. [Node Client APIs](#node-client-apis)
   - [CommandManager](#commandmanager)
   - [WebsiteService](#node-client-websiteservice)
   - [ReportService](#node-client-reportservice)
   - [StatusChecker](#statuschecker)

## Smart Contract APIs

### WebsiteRegistry

The WebsiteRegistry contract manages website registrations and metadata.

#### Data Structures

```solidity
struct Website {
    string url;              // Website URL
    string name;             // Website name
    address owner;           // Owner address
    bool active;             // Active status
    uint256 registrationTime; // Registration timestamp
    uint256 lastCheckTime;   // Last check timestamp
}
```

#### Methods

##### `registerWebsite`

Registers a new website for monitoring.

```solidity
function registerWebsite(string calldata url, string calldata name) external returns (uint256)
```

**Parameters:**
- `url`: The URL of the website to monitor
- `name`: The name of the website

**Returns:**
- `uint256`: The ID of the registered website

**Events:**
- `WebsiteRegistered(uint256 indexed websiteId, string url, address indexed owner)`

##### `updateWebsite`

Updates an existing website's information.

```solidity
function updateWebsite(
    uint256 websiteId, 
    string calldata url, 
    string calldata name, 
    bool active
) external
```

**Parameters:**
- `websiteId`: The ID of the website to update
- `url`: The new URL of the website
- `name`: The new name of the website
- `active`: Whether the website is active

**Events:**
- `WebsiteUpdated(uint256 indexed websiteId, string url, bool active)`

##### `setWebsiteActive`

Sets the active status of a website.

```solidity
function setWebsiteActive(uint256 websiteId, bool active) external
```

**Parameters:**
- `websiteId`: The ID of the website
- `active`: The new active status

**Events:**
- `WebsiteStatusChanged(uint256 indexed websiteId, bool active)`

##### `updateLastCheckTime`

Updates the last check time of a website.

```solidity
function updateLastCheckTime(uint256 websiteId) external
```

**Parameters:**
- `websiteId`: The ID of the website

##### `getWebsitesByOwner`

Gets all websites owned by a specific address.

```solidity
function getWebsitesByOwner(address owner) external view returns (uint256[] memory)
```

**Parameters:**
- `owner`: The address of the website owner

**Returns:**
- `uint256[] memory`: Array of website IDs owned by the address

##### `getWebsiteDetails`

Gets the details of a website.

```solidity
function getWebsiteDetails(uint256 websiteId) external view returns (
    string memory url,
    string memory name,
    address owner,
    bool active,
    uint256 registrationTime,
    uint256 lastCheckTime
)
```

**Parameters:**
- `websiteId`: The ID of the website

**Returns:**
- `url`: The URL of the website
- `name`: The name of the website
- `owner`: The owner of the website
- `active`: Whether the website is active
- `registrationTime`: The time when the website was registered
- `lastCheckTime`: The last time the website was checked

### NodeRegistry

The NodeRegistry contract manages validator node registrations and metadata.

#### Data Structures

```solidity
struct Node {
    string name;             // Node name
    string endpoint;         // Node API endpoint
    address owner;           // Owner address
    bool active;             // Active status
    uint256 registrationTime; // Registration timestamp
    uint256 lastReportTime;  // Last report timestamp
    uint256 reportsSubmitted; // Number of reports
}
```

#### Methods

##### `registerNode`

Registers a new validator node.

```solidity
function registerNode(string calldata name, string calldata endpoint) external returns (uint256)
```

**Parameters:**
- `name`: The name of the node
- `endpoint`: The API endpoint of the node

**Returns:**
- `uint256`: The ID of the registered node

**Events:**
- `NodeRegistered(uint256 indexed nodeId, string name, address indexed owner)`

##### `updateNode`

Updates an existing node's information.

```solidity
function updateNode(
    uint256 nodeId, 
    string calldata name, 
    string calldata endpoint, 
    bool active
) external
```

**Parameters:**
- `nodeId`: The ID of the node to update
- `name`: The new name of the node
- `endpoint`: The new endpoint of the node
- `active`: Whether the node is active

**Events:**
- `NodeUpdated(uint256 indexed nodeId, string name, bool active)`

##### `setNodeActive`

Sets the active status of a node.

```solidity
function setNodeActive(uint256 nodeId, bool active) external
```

**Parameters:**
- `nodeId`: The ID of the node
- `active`: The new active status

**Events:**
- `NodeStatusChanged(uint256 indexed nodeId, bool active)`

##### `recordReport`

Updates node's report statistics.

```solidity
function recordReport(uint256 nodeId) external
```

**Parameters:**
- `nodeId`: The ID of the node

##### `setMinimumStake`

Sets the minimum stake required to register a node.

```solidity
function setMinimumStake(uint256 _minimumStake) external onlyOwner
```

**Parameters:**
- `_minimumStake`: The new minimum stake

**Events:**
- `MinimumStakeChanged(uint256 oldStake, uint256 newStake)`

##### `getNodesByOwner`

Gets all nodes owned by a specific address.

```solidity
function getNodesByOwner(address owner) external view returns (uint256[] memory)
```

**Parameters:**
- `owner`: The address of the node owner

**Returns:**
- `uint256[] memory`: Array of node IDs owned by the address

##### `getNodeDetails`

Gets the details of a node.

```solidity
function getNodeDetails(uint256 nodeId) external view returns (
    string memory name,
    string memory endpoint,
    address owner,
    bool active,
    uint256 registrationTime,
    uint256 lastReportTime,
    uint256 reportsSubmitted
)
```

**Parameters:**
- `nodeId`: The ID of the node

**Returns:**
- `name`: The name of the node
- `endpoint`: The endpoint of the node
- `owner`: The owner of the node
- `active`: Whether the node is active
- `registrationTime`: The time when the node was registered
- `lastReportTime`: The last time the node submitted a report
- `reportsSubmitted`: The number of reports submitted by the node

### StatusReport

The StatusReport contract stores website status reports from validator nodes.

#### Data Structures

```solidity
enum Status {
    Unknown,    // 0: Status unknown or not reported
    Online,     // 1: Website is online and responding
    Offline,    // 2: Website is offline or not responding
    Degraded    // 3: Website is responding but with issues
}

struct Report {
    uint256 websiteId;      // Website ID
    uint256 nodeId;         // Node ID
    Status status;          // Status code
    uint256 responseTime;   // Response time in ms
    uint256 timestamp;      // Report timestamp
    string statusMessage;   // Status message
}
```

#### Methods

##### `submitReport`

Submits a new status report for a website.

```solidity
function submitReport(
    uint256 websiteId,
    uint256 nodeId,
    Status status,
    uint256 responseTime,
    string calldata statusMessage
) external returns (uint256)
```

**Parameters:**
- `websiteId`: The ID of the website being reported
- `nodeId`: The ID of the node submitting the report
- `status`: The status code of the website
- `responseTime`: The response time in milliseconds
- `statusMessage`: Additional message about the status

**Returns:**
- `uint256`: The ID of the submitted report

**Events:**
- `ReportSubmitted(uint256 indexed reportId, uint256 indexed websiteId, uint256 indexed nodeId, Status status, uint256 responseTime, uint256 timestamp)`

##### `getLatestReport`

Gets the latest status report for a website.

```solidity
function getLatestReport(uint256 websiteId) external view returns (
    uint256 reportId,
    Status status,
    uint256 responseTime,
    uint256 timestamp,
    string memory statusMessage
)
```

**Parameters:**
- `websiteId`: The ID of the website

**Returns:**
- `reportId`: The ID of the latest report
- `status`: The status of the website
- `responseTime`: The response time in milliseconds
- `timestamp`: The timestamp of the report
- `statusMessage`: Additional message about the status

##### `getReportsByWebsite`

Gets all report IDs for a website.

```solidity
function getReportsByWebsite(uint256 websiteId) external view returns (uint256[] memory)
```

**Parameters:**
- `websiteId`: The ID of the website

**Returns:**
- `uint256[] memory`: Array of report IDs for the website

##### `getReportsByNode`

Gets all report IDs submitted by a node.

```solidity
function getReportsByNode(uint256 nodeId) external view returns (uint256[] memory)
```

**Parameters:**
- `nodeId`: The ID of the node

**Returns:**
- `uint256[] memory`: Array of report IDs submitted by the node

##### `getReportDetails`

Gets the details of a report.

```solidity
function getReportDetails(uint256 reportId) external view returns (
    uint256 websiteId,
    uint256 nodeId,
    Status status,
    uint256 responseTime,
    uint256 timestamp,
    string memory statusMessage
)
```

**Parameters:**
- `reportId`: The ID of the report

**Returns:**
- `websiteId`: The ID of the website
- `nodeId`: The ID of the node
- `status`: The status of the website
- `responseTime`: The response time in milliseconds
- `timestamp`: The timestamp of the report
- `statusMessage`: Additional message about the status

##### `getRecentReports`

Gets recent reports for a website (up to a specified count).

```solidity
function getRecentReports(uint256 websiteId, uint256 count) external view returns (uint256[] memory)
```

**Parameters:**
- `websiteId`: The ID of the website
- `count`: The maximum number of reports to return

**Returns:**
- `uint256[] memory`: Array of recent report IDs

### ConsensusEngine

The ConsensusEngine contract processes reports from multiple validators to determine the consensus status.

#### Methods

##### `processReports`

Processes reports for a website to determine consensus status.

```solidity
function processReports(uint256 websiteId) external returns (
    Status consensusStatus,
    uint256 avgResponseTime,
    uint256[] memory contributingReports
)
```

**Parameters:**
- `websiteId`: The ID of the website to process reports for

**Returns:**
- `consensusStatus`: The determined consensus status
- `avgResponseTime`: The average response time from reports
- `contributingReports`: Array of report IDs that contributed to consensus

**Events:**
- `ConsensusProcessed(uint256 indexed websiteId, Status status, uint256 timestamp)`

##### `getConsensusStatus`

Gets the latest consensus status for a website.

```solidity
function getConsensusStatus(uint256 websiteId) external view returns (
    Status status,
    uint256 responseTime,
    uint256 timestamp,
    uint256 confidence
)
```

**Parameters:**
- `websiteId`: The ID of the website

**Returns:**
- `status`: The consensus status
- `responseTime`: The average response time
- `timestamp`: The timestamp of the consensus
- `confidence`: The confidence level of the consensus (0-100)

### ReputationSystem

The ReputationSystem contract tracks validator reliability based on agreement with consensus.

#### Methods

##### `updateReputation`

Updates a node's reputation based on consensus agreement.

```solidity
function updateReputation(
    uint256 nodeId,
    uint256 reportId,
    bool agreedWithConsensus
) external
```

**Parameters:**
- `nodeId`: The ID of the node
- `reportId`: The ID of the report
- `agreedWithConsensus`: Whether the node's report agreed with consensus

**Events:**
- `ReputationUpdated(uint256 indexed nodeId, int256 change, uint256 newReputation)`

##### `getNodeReputation`

Gets a node's current reputation score.

```solidity
function getNodeReputation(uint256 nodeId) external view returns (uint256)
```

**Parameters:**
- `nodeId`: The ID of the node

**Returns:**
- `uint256`: The node's reputation score

##### `getReputationHistory`

Gets a node's reputation history.

```solidity
function getReputationHistory(uint256 nodeId) external view returns (
    uint256[] memory timestamps,
    int256[] memory changes,
    uint256[] memory values
)
```

**Parameters:**
- `nodeId`: The ID of the node

**Returns:**
- `timestamps`: Array of update timestamps
- `changes`: Array of reputation changes
- `values`: Array of reputation values after changes

### RewardDistribution

The RewardDistribution contract handles token rewards for validators.

#### Methods

##### `distributeRewards`

Distributes rewards to nodes based on their contributions.

```solidity
function distributeRewards(uint256[] calldata nodeIds) external
```

**Parameters:**
- `nodeIds`: Array of node IDs to distribute rewards to

**Events:**
- `RewardsDistributed(uint256 totalAmount, uint256 timestamp)`
- `NodeRewarded(uint256 indexed nodeId, uint256 amount)`

##### `calculateReward`

Calculates the reward amount for a node.

```solidity
function calculateReward(uint256 nodeId) external view returns (uint256)
```

**Parameters:**
- `nodeId`: The ID of the node

**Returns:**
- `uint256`: The calculated reward amount

##### `setRewardRate`

Sets the base reward rate.

```solidity
function setRewardRate(uint256 _rewardRate) external onlyOwner
```

**Parameters:**
- `_rewardRate`: The new reward rate

**Events:**
- `RewardRateChanged(uint256 oldRate, uint256 newRate)`

### UptimeToken

The UptimeToken contract is an ERC-20 token used for rewards and governance.

#### Methods

##### `mint`

Mints new tokens (restricted to owner or authorized contracts).

```solidity
function mint(address to, uint256 amount) external onlyOwner
```

**Parameters:**
- `to`: The address to mint tokens to
- `amount`: The amount of tokens to mint

##### `burn`

Burns tokens from an address.

```solidity
function burn(uint256 amount) external
```

**Parameters:**
- `amount`: The amount of tokens to burn

## Frontend Service APIs

### Web3Service

The Web3Service handles wallet connections and provides access to smart contracts.

#### Methods

##### `connectWallet`

Connects to the user's Ethereum wallet.

```javascript
async function connectWallet() => {
  // Returns { address, chainId, provider, signer }
}
```

**Returns:**
- `address`: The connected wallet address
- `chainId`: The connected network chain ID
- `provider`: The ethers.js provider
- `signer`: The ethers.js signer

##### `getContractWithSigner`

Gets a contract instance with signer for write operations.

```javascript
async function getContractWithSigner(contractName) => {
  // Returns { contract, signer }
}
```

**Parameters:**
- `contractName`: The name of the contract (e.g., 'WebsiteRegistry')

**Returns:**
- `contract`: The contract instance with signer
- `signer`: The ethers.js signer

##### `getContractWithProvider`

Gets a contract instance with provider for read-only operations.

```javascript
async function getContractWithProvider(contractName) => {
  // Returns { contract, provider }
}
```

**Parameters:**
- `contractName`: The name of the contract (e.g., 'WebsiteRegistry')

**Returns:**
- `contract`: The contract instance with provider
- `provider`: The ethers.js provider

### WebsiteService

The WebsiteService provides methods for website management.

#### Methods

##### `registerWebsite`

Registers a new website.

```javascript
async function registerWebsite(name, url, description, checkFrequency) => {
  // Returns transaction receipt
}
```

**Parameters:**
- `name`: The name of the website
- `url`: The URL of the website
- `description`: A description of the website
- `checkFrequency`: How often the website should be checked (minutes)

**Returns:**
- Transaction receipt object

##### `getMyWebsites`

Gets websites owned by the current user.

```javascript
async function getMyWebsites() => {
  // Returns array of website objects
}
```

**Returns:**
- Array of website objects with details

##### `updateWebsite`

Updates a website's information.

```javascript
async function updateWebsite(websiteId, name, url, description, active) => {
  // Returns transaction receipt
}
```

**Parameters:**
- `websiteId`: The ID of the website
- `name`: The new name
- `url`: The new URL
- `description`: The new description
- `active`: The new active status

**Returns:**
- Transaction receipt object

##### `getWebsiteDetails`

Gets details for a specific website.

```javascript
async function getWebsiteDetails(websiteId) => {
  // Returns website details
}
```

**Parameters:**
- `websiteId`: The ID of the website

**Returns:**
- Website details object

##### `getWebsiteStatus`

Gets the current status of a website.

```javascript
async function getWebsiteStatus(websiteId) => {
  // Returns status information
}
```

**Parameters:**
- `websiteId`: The ID of the website

**Returns:**
- Status information object

### NodeService

The NodeService provides methods for node management.

#### Methods

##### `registerNode`

Registers a new validator node.

```javascript
async function registerNode(name, endpoint) => {
  // Returns transaction receipt with nodeId
}
```

**Parameters:**
- `name`: The name of the node
- `endpoint`: The API endpoint of the node

**Returns:**
- Transaction receipt with nodeId

##### `getMyNodes`

Gets nodes owned by the current user.

```javascript
async function getMyNodes() => {
  // Returns array of node objects
}
```

**Returns:**
- Array of node objects with details

##### `updateNode`

Updates a node's information.

```javascript
async function updateNode(nodeId, name, endpoint, active) => {
  // Returns transaction receipt
}
```

**Parameters:**
- `nodeId`: The ID of the node
- `name`: The new name
- `endpoint`: The new endpoint
- `active`: The new active status

**Returns:**
- Transaction receipt object

##### `getNodeDetails`

Gets details for a specific node.

```javascript
async function getNodeDetails(nodeId) => {
  // Returns node details
}
```

**Parameters:**
- `nodeId`: The ID of the node

**Returns:**
- Node details object

##### `getNodeStats`

Gets statistics for a node.

```javascript
async function getNodeStats(nodeId) => {
  // Returns node statistics
}
```

**Parameters:**
- `nodeId`: The ID of the node

**Returns:**
- Node statistics object including:
  - `reportsSubmitted`: Total reports submitted
  - `reputation`: Current reputation score
  - `rewardsEarned`: Total rewards earned
  - `averageResponseTime`: Average response time

### ReportService

The ReportService provides methods for status reporting and querying.

#### Methods

##### `getLatestStatusForWebsite`

Gets the latest status report for a website.

```javascript
async function getLatestStatusForWebsite(websiteId) => {
  // Returns status report
}
```

**Parameters:**
- `websiteId`: The ID of the website

**Returns:**
- Status report object

##### `getStatusHistory`

Gets historical status reports for a website.

```javascript
async function getStatusHistory(websiteId, timeRange) => {
  // Returns array of status reports
}
```

**Parameters:**
- `websiteId`: The ID of the website
- `timeRange`: Time range to query (e.g., { from: timestamp, to: timestamp })

**Returns:**
- Array of status report objects

##### `getConsensusStatus`

Gets the consensus status for a website.

```javascript
async function getConsensusStatus(websiteId) => {
  // Returns consensus status
}
```

**Parameters:**
- `websiteId`: The ID of the website

**Returns:**
- Consensus status object

## Node Client APIs

### CommandManager

The CommandManager handles CLI command parsing and execution.

#### Commands

##### `register`

Registers a new validator node.

```javascript
program.command('register')
  .description('Register a new validator node')
  .option('--name <name>', 'Node name')
  .option('--endpoint <endpoint>', 'Node endpoint URL')
  .action(async (options) => {
    // Command implementation
  });
```

**Options:**
- `--name`: The name of the node
- `--endpoint`: The endpoint URL of the node

##### `check`

Checks the status of a specific website.

```javascript
program.command('check')
  .description('Check a specific website status')
  .requiredOption('--website-id <id>', 'Website ID to check')
  .requiredOption('--node-id <id>', 'Node ID to use for checking')
  .action(async (options) => {
    // Command implementation
  });
```

**Options:**
- `--website-id`: The ID of the website to check
- `--node-id`: The ID of the node to use for checking

##### `start`

Starts automatic checking of all active websites.

```javascript
program.command('start')
  .description('Start automatic checking of all active websites')
  .option('--interval <minutes>', 'Check interval in minutes', '5')
  .requiredOption('--node-id <id>', 'Node ID to use for checking')
  .action(async (options) => {
    // Command implementation
  });
```

**Options:**
- `--interval`: The interval in minutes between checks (default: 5)
- `--node-id`: The ID of the node to use for checking

##### `status`

Gets the current status and statistics of a node.

```javascript
program.command('status')
  .description('Get node status and statistics')
  .requiredOption('--node-id <id>', 'Node ID to check status for')
  .action(async (options) => {
    // Command implementation
  });
```

**Options:**
- `--node-id`: The ID of the node to check status for

### Node Client WebsiteService

The WebsiteService provides methods for interacting with the WebsiteRegistry contract.

#### Methods

##### `getActiveWebsites`

Gets all active websites from the WebsiteRegistry.

```javascript
async function getActiveWebsites() => {
  // Returns array of active websites
}
```

**Returns:**
- Array of active website objects

##### `getWebsiteDetails`

Gets details of a specific website.

```javascript
async function getWebsiteDetails(websiteId) => {
  // Returns website details
}
```

**Parameters:**
- `websiteId`: The ID of the website

**Returns:**
- Website details object

### Node Client ReportService

The ReportService provides methods for submitting status reports.

#### Methods

##### `submitReport`

Submits a status report for a website.

```javascript
async function submitReport(websiteId, nodeId, status, responseTime, message) => {
  // Returns report ID
}
```

**Parameters:**
- `websiteId`: The ID of the website
- `nodeId`: The ID of the node
- `status`: The status code (0-3)
- `responseTime`: The response time in milliseconds
- `message`: A message describing the status

**Returns:**
- The ID of the submitted report

##### `getNodeReports`

Gets recent reports submitted by a node.

```javascript
async function getNodeReports(nodeId, count) => {
  // Returns array of report IDs
}
```

**Parameters:**
- `nodeId`: The ID of the node
- `count`: The maximum number of reports to return

**Returns:**
- Array of report IDs

### StatusChecker

The StatusChecker handles website status checking.

#### Methods

##### `checkWebsite`

Checks a website's status.

```javascript
async function checkWebsite(url, timeout) => {
  // Returns status object
}
```

**Parameters:**
- `url`: The URL to check
- `timeout`: The timeout in milliseconds

**Returns:**
- Status object containing:
  - `status`: The status code (0-3)
  - `responseTime`: The response time in milliseconds
  - `message`: A description of the status

##### `checkMultipleWebsites`

Checks multiple websites in parallel.

```javascript
async function checkMultipleWebsites(urls, timeout) => {
  // Returns array of status objects
}
```

**Parameters:**
- `urls`: Array of URLs to check
- `timeout`: The timeout in milliseconds

**Returns:**
- Array of status objects 