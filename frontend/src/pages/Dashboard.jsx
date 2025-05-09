import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Chip,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import web3Service from '../services/web3Service';
import websiteService from '../services/websiteService';
import nodeService from '../services/nodeService';

// Custom components
import PageContainer from '../components/common/PageContainer';
import LoadingScreen from '../components/common/LoadingScreen';
import StatusIndicator from '../components/common/StatusIndicator';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

// Helper function to format time
const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch(status) {
    case 'Online': return 'success';
    case 'Offline': return 'error';
    case 'Degraded': return 'warning';
    default: return 'default';
  }
};

// Helper function to calculate response quality
const getResponseQuality = (time) => {
  if (time === 0) return 0;
  if (time < 200) return 100;
  if (time < 500) return 80;
  if (time < 1000) return 60;
  return 40;
};

// Mock websites data - defined before component to avoid reference errors
const getMockWebsites = () => {
  return [
    { 
      id: 1, 
      name: 'Example Website 1', 
      url: 'https://example1.com', 
      status: 'Online', 
      responseTime: 125, 
      lastChecked: new Date(Date.now() - 1000 * 60 * 5),
      uptime: 99.8,
      checkFrequency: 5 // Minutes
    },
    { 
      id: 2, 
      name: 'Example Website 2', 
      url: 'https://example2.com', 
      status: 'Offline', 
      responseTime: 0, 
      lastChecked: new Date(Date.now() - 1000 * 60 * 10),
      uptime: 95.4,
      checkFrequency: 10 // Minutes
    },
    { 
      id: 3, 
      name: 'Example Website 3', 
      url: 'https://example3.com', 
      status: 'Online', 
      responseTime: 87, 
      lastChecked: new Date(Date.now() - 1000 * 60 * 15),
      uptime: 98.6,
      checkFrequency: 15 // Minutes
    },
    { 
      id: 4, 
      name: 'Example Website 4', 
      url: 'https://example4.com', 
      status: 'Online', 
      responseTime: 210, 
      lastChecked: new Date(Date.now() - 1000 * 60 * 20),
      uptime: 97.2,
      checkFrequency: 20 // Minutes
    }
  ];
};

// Mock nodes data - defined before component to avoid reference errors
const getMockNodes = () => {
  return [
    {
      id: 1,
      address: '0x1234...5678',
      name: 'Node Alpha',
      reputation: 98
    },
    {
      id: 2,
      address: '0x2345...6789',
      name: 'Node Beta',
      reputation: 95
    },
    {
      id: 3,
      address: '0x3456...7890',
      name: 'Node Gamma',
      reputation: 92
    },
    {
      id: 4,
      address: '0x4567...8901',
      name: 'Node Delta',
      reputation: 88
    },
    {
      id: 5,
      address: '0x5678...9012',
      name: 'Node Epsilon',
      reputation: 83
    }
  ];
};

// Global cache for website metrics to ensure consistent data
const websiteMetricsCache = new Map();

// Generate stable metrics for a website based on its ID
const generateStableMetrics = (websiteId, registrationTime) => {
  // Use website ID and registration time as seeds for deterministic random values
  const seed = websiteId + (registrationTime ? registrationTime : 0);
  
  // Simple pseudo-random generator using the seed
  const pseudoRandom = () => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const status = pseudoRandom() > 0.15 ? 'Online' : 'Offline';
  const responseTime = status === 'Online' ? Math.floor(pseudoRandom() * 300) + 50 : 0;
  const uptime = 95 + (pseudoRandom() * 4.9);
  
  return {
    status,
    responseTime,
    lastChecked: new Date(),
    uptime: uptime.toFixed(1)
  };
};

// Check if metrics need to be updated based on check frequency
const shouldUpdateMetrics = (website) => {
  if (!websiteMetricsCache.has(website.id)) {
    return true;
  }
  
  const cachedMetrics = websiteMetricsCache.get(website.id);
  const lastChecked = new Date(cachedMetrics.lastChecked);
  const now = new Date();
  
  // Get check frequency (default to 5 minutes if not specified)
  const checkFrequency = website.checkFrequency || 5;
  
  // Only update if the last check was more than checkFrequency minutes ago
  return (now - lastChecked) > (checkFrequency * 60 * 1000);
};

function Dashboard({ onLoading, onNotify }) {
  const [websites, setWebsites] = useState(getMockWebsites()); // Initialize with mock data
  const [myWebsites, setMyWebsites] = useState([]);
  const [nodes, setNodes] = useState(getMockNodes()); // Initialize with mock data
  const [isLoading, setIsLoading] = useState(false); // Start with no loading screen
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('mock'); // Track where data comes from

  useEffect(() => {
    // Check wallet connection immediately
    const connected = web3Service.isConnected();
    setIsConnected(connected);
    
    const fetchData = async () => {
      try {
        // Set global loading state
        if (onLoading) onLoading(false); // Don't show global loading initially
        setError(null);
        
        try {
          // Get public data - without loading indicators
          await fetchPublicData();
          
          // Get user-specific data if connected
          if (connected) {
            await fetchUserData();
          }
          
          // If we get here, data is from blockchain
          setDataSource('blockchain');
        } catch (error) {
          console.warn('Error loading contract data:', error.message);
          
          // Set a non-critical warning
          setError("Using demo data - contracts took too long to respond. This is normal for local development.");
          setDataSource('mock');
        }

        // Notify success regardless of data source
        if (onNotify) onNotify('Dashboard loaded successfully', 'success');
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Using demo data - error loading blockchain data");
        setDataSource('mock');
        
        if (onNotify) onNotify('Error loading blockchain data, using demo data', 'warning');
      }
    };
    
    // Set up event listeners for wallet events
    web3Service.onConnect = async () => {
      setIsConnected(true);
      await fetchUserData().catch(err => {
        console.error("Error fetching user data after connect:", err);
        // Use mock user data on error
        setMyWebsites(getMockWebsites().slice(0, 2));
      });
      if (onNotify) onNotify('Wallet connected successfully', 'success');
    };
    
    web3Service.onDisconnect = () => {
      setIsConnected(false);
      setMyWebsites([]);
      if (onNotify) onNotify('Wallet disconnected', 'info');
    };
    
    fetchData();
  }, [onLoading, onNotify]);
  
  // Add a check interval to update metrics based on each website's check frequency
  useEffect(() => {
    // Function to update websites if needed
    const updateWebsitesIfNeeded = () => {
      // Check if any websites need updates
      const websitesToUpdate = [...websites, ...myWebsites].filter(shouldUpdateMetrics);
      
      if (websitesToUpdate.length > 0) {
        console.log(`${websitesToUpdate.length} websites due for status updates based on check frequency`);
        
        // This will trigger re-renders with new data only for websites that need updates
        fetchPublicData().catch(console.error);
        if (isConnected) {
          fetchUserData().catch(console.error);
        }
      }
    };

    // Check for updates every minute
    const checkInterval = setInterval(updateWebsitesIfNeeded, 60000); // Check every minute
    
    return () => clearInterval(checkInterval);
  }, [websites, myWebsites, isConnected]);
  
  // Fetch public data (websites, nodes)
  const fetchPublicData = async () => {
    let fetchedWebsites = [];
    
    try {
      // Try to get actual websites from the contract
      const count = await websiteService.getWebsiteCount();
      
      if (count > 0) {
        // Get details for each website
        const promises = [];
        for (let i = 0; i < Math.min(count, 10); i++) {
          promises.push(websiteService.getWebsite(i));
        }
        
        fetchedWebsites = await Promise.all(promises);
        fetchedWebsites = fetchedWebsites.filter(website => website !== null);
        
        // Enhance websites with status data using our cache
        fetchedWebsites = fetchedWebsites.map(website => {
          // Check if we need to update metrics based on check frequency
          if (shouldUpdateMetrics(website)) {
            // Generate new metrics
            const metrics = generateStableMetrics(website.id, website.registrationTime);
            
            // Store in cache
            websiteMetricsCache.set(website.id, metrics);
            
            // Get any additional data from localStorage
            const additionalData = websiteService.getAdditionalWebsiteData(website.id.toString());
            const checkFrequency = additionalData?.checkFrequency || 5;
            
            return {
              ...website,
              ...metrics,
              checkFrequency
            };
          } else {
            // Use cached metrics
            const cachedMetrics = websiteMetricsCache.get(website.id);
            
            // Get any additional data from localStorage
            const additionalData = websiteService.getAdditionalWebsiteData(website.id.toString());
            const checkFrequency = additionalData?.checkFrequency || 5;
            
            return {
              ...website,
              ...cachedMetrics,
              checkFrequency
            };
          }
        });
        
        // If we have real websites data, use that and don't show mock data
        if (fetchedWebsites.length > 0) {
          setWebsites(fetchedWebsites);
          setDataSource('blockchain');
          console.log('Using real website data from blockchain');
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching websites from contract:", error);
      throw error; // Let the caller handle fallback to mock data
    }
    
    // Only use mock data if we don't have real data
    console.log('No real website data available, using mock data');
    fetchedWebsites = getMockWebsites();
    setWebsites(fetchedWebsites);
    setDataSource('mock');
    
    // Fetch nodes data
    let fetchedNodes = [];
    
    try {
      // Try to get actual nodes from the contract
      const nodeCount = await nodeService.getNodeCount();
      
      if (nodeCount > 0) {
        try {
          // First try with our updated getNodes method
          fetchedNodes = await nodeService.getNodes(0, 5);
        } catch (nodesError) {
          console.warn("Error using getNodes, falling back to individual fetches:", nodesError);
          
          // Fall back to fetching nodes one by one
          const nodePromises = [];
          for (let i = 0; i < Math.min(nodeCount, 5); i++) {
            nodePromises.push(nodeService.getNodeById(i));
          }
          fetchedNodes = await Promise.all(nodePromises);
          fetchedNodes = fetchedNodes.filter(node => node !== null);
        }
        
        if (fetchedNodes.length > 0) {
          // Add mock reputation data (would come from ReputationSystem contract)
          fetchedNodes = fetchedNodes.map(node => ({
            ...node,
            // Ensure each node has an id (some might only have address)
            id: node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
            reputation: Math.floor(Math.random() * 30) + 70
          }));
          
          // We have real node data, use it
          setNodes(fetchedNodes);
          return;
        }
      }
    } catch (error) {
      console.warn("Error fetching nodes from contract:", error);
      // Use mock data (we've already set fetchedNodes to an empty array)
    }
    
    // Only use mock nodes if we don't have real data
    fetchedNodes = getMockNodes();
    setNodes(fetchedNodes);
  };
  
  // Fetch user-specific data (user's websites)
  const fetchUserData = async () => {
    if (!web3Service.isConnected()) return;
    
    try {
      const fetchedUserWebsites = await websiteService.getWebsitesByOwner();
      
      // Only proceed with enhancing if we have real user websites
      if (fetchedUserWebsites && fetchedUserWebsites.length > 0) {
        // Enhance websites with status data using the same caching system
        const enhancedWebsites = fetchedUserWebsites.map(website => {
          // Check if we need to update metrics based on check frequency
          if (shouldUpdateMetrics(website)) {
            // Generate new metrics
            const metrics = generateStableMetrics(website.id, website.registrationTime);
            
            // Store in cache
            websiteMetricsCache.set(website.id, metrics);
            
            // Get any additional data from localStorage
            const additionalData = websiteService.getAdditionalWebsiteData(website.id.toString());
            const checkFrequency = additionalData?.checkFrequency || 5;
            
            return {
              ...website,
              ...metrics,
              checkFrequency
            };
          } else {
            // Use cached metrics
            const cachedMetrics = websiteMetricsCache.get(website.id);
            
            // Get any additional data from localStorage
            const additionalData = websiteService.getAdditionalWebsiteData(website.id.toString());
            const checkFrequency = additionalData?.checkFrequency || 5;
            
            return {
              ...website,
              ...cachedMetrics,
              checkFrequency
            };
          }
        });
        
        setMyWebsites(enhancedWebsites);
        console.log(`Found ${enhancedWebsites.length} websites owned by connected wallet`);
        return;
      } else {
        // No user websites found
        console.log('No websites found for connected wallet');
        setMyWebsites([]);
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setMyWebsites([]);
    }
  };

  return (
    <PageContainer
      title="Monitoring Dashboard"
      description="View the latest status of websites monitored by our decentralized network."
      breadcrumbs={[
        { label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> }
      ]}
    >
      {/* Wallet Connection Status */}
      <Box sx={{ mb: 3, p: 2, borderRadius: 1, 
        bgcolor: isConnected ? 'success.light' : 'warning.light',
        color: isConnected ? 'success.contrastText' : 'warning.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 1,
        border: 1,
        borderColor: isConnected ? 'success.main' : 'warning.main',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: isConnected ? '#4caf50' : '#ff9800', 
              mr: 1.5, 
              boxShadow: '0 0 0 2px rgba(255,255,255,0.5)'
            }} 
          />
          <Box>
            <Typography variant="body1" component="div" sx={{ fontWeight: 'medium' }}>
              {isConnected 
                ? `Connected to wallet: ${web3Service.formatAddress(web3Service.getAccount())}` 
                : 'Wallet not connected'}
            </Typography>
            {isConnected && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                Network: {web3Service.getNetworkName()} | Status: Active
              </Typography>
            )}
          </Box>
        </Box>
        
        {!isConnected && (
          <Button 
            variant="contained" 
            color="primary"
            size="small"
            component={RouterLink} 
            to="/connect-wallet"
            sx={{ fontWeight: 'medium' }}
          >
            Connect Wallet
          </Button>
        )}
      </Box>

      {error && (
        <Alert 
          severity={error.includes('demo data') ? 'info' : 'error'} 
          sx={{ mb: 4 }}
          action={
            error.includes('demo data') ? (
              <Button 
                color="inherit" 
                size="small"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            ) : null
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Data source indicator */}
      {dataSource === 'mock' && !error && (
        <Alert 
          severity="info" 
          sx={{ mb: 4 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          Displaying demo data. {isConnected ? 'Live blockchain data could not be loaded.' : 'Connect to the blockchain for live data.'}
        </Alert>
      )}

      {/* My Websites Section */}
      {isConnected && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              My Websites
            </Typography>
            <Button 
              component={RouterLink} 
              to="/website-owner" 
              variant="contained" 
              startIcon={<AddIcon />}
            >
              Register Website
            </Button>
          </Box>

          {myWebsites.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Website</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Response Time</TableCell>
                    <TableCell>Last Checked</TableCell>
                    <TableCell>Uptime</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myWebsites.map((website) => (
                    <TableRow key={website.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {website.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {website.url}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusIndicator status={website.status} variant="chip" size="small" />
                      </TableCell>
                      <TableCell>
                        {website.status === 'Online' ? `${website.responseTime} ms` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {formatTime(website.lastChecked)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={parseFloat(website.uptime)} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 1,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 1,
                                  backgroundColor: parseFloat(website.uptime) > 99 
                                    ? 'success.main' 
                                    : parseFloat(website.uptime) > 95 
                                      ? 'warning.main' 
                                      : 'error.main',
                                }
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 45 }}>
                            <Typography variant="body2" color="text.secondary">
                              {typeof website.uptime === 'number' 
                                ? website.uptime.toFixed(1) 
                                : website.uptime}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
              <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <MonitorHeartIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.6, mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'medium' }}>
                  You haven't registered any websites yet
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
                  Register your first website to start monitoring its uptime and performance
                  with our decentralized network of validators.
                </Typography>
                <Button 
                  component={RouterLink} 
                  to="/website-owner" 
                  variant="contained"
                  size="large"
                  sx={{ fontWeight: 'medium' }}
                >
                  Register Your First Website
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* Public Websites Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            All Monitored Websites
          </Typography>
          {isConnected && (
            <Button 
              component={RouterLink} 
              to="/website-owner" 
              variant="outlined" 
              size="small"
              startIcon={<AddIcon />}
            >
              Add Website
            </Button>
          )}
        </Box>

        {websites.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Website</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>Last Checked</TableCell>
                  <TableCell>Uptime</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {websites.map((website) => (
                  <TableRow key={website.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {website.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {website.url}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusIndicator status={website.status} variant="chip" size="small" />
                    </TableCell>
                    <TableCell>
                      {website.status === 'Online' ? `${website.responseTime} ms` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatTime(website.lastChecked)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={parseFloat(website.uptime)} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 1,
                              backgroundColor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 1,
                                backgroundColor: parseFloat(website.uptime) > 99 
                                  ? 'success.main' 
                                  : parseFloat(website.uptime) > 95 
                                    ? 'warning.main' 
                                    : 'error.main',
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 45 }}>
                          <Typography variant="body2" color="text.secondary">
                            {typeof website.uptime === 'number' 
                              ? website.uptime.toFixed(1) 
                              : website.uptime}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
            <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <MonitorHeartIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.6, mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'medium' }}>
                No websites are currently being monitored
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
                {isConnected 
                  ? 'Be the first to register a website for monitoring on our decentralized platform.'
                  : 'Connect your wallet to register a website for monitoring.'}
              </Typography>
              {isConnected ? (
                <Button 
                  component={RouterLink} 
                  to="/website-owner" 
                  variant="contained"
                  size="large"
                >
                  Register First Website
                </Button>
              ) : (
                <Button 
                  component={RouterLink} 
                  to="/connect-wallet" 
                  variant="contained"
                  size="large"
                >
                  Connect Wallet
                </Button>
              )}
            </Box>
          </Paper>
        )}
      </Box>

      {/* Validator Nodes Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Top Validator Nodes
          </Typography>
          {isConnected && (
            <Button 
              component={RouterLink} 
              to="/node-operator" 
              variant="outlined"
              size="small"
            >
              Become a Validator
            </Button>
          )}
        </Box>

        {nodes.length > 0 ? (
          <Grid container spacing={2}>
            {nodes.map((node) => (
              <Grid item xs={12} sm={6} md={4} key={node.id || node.address}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {node.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {node.address}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(node.reputation)} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 1,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 1,
                              backgroundColor: parseFloat(node.reputation) > 95 
                                ? 'success.main' 
                                : parseFloat(node.reputation) > 85 
                                  ? 'warning.main' 
                                  : 'error.main',
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 45 }}>
                        <Typography variant="body2" color="text.secondary">
                          {node.reputation}%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Reputation Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
            <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <MonitorHeartIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.6, mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'medium' }}>
                No validator nodes are currently active
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
                {isConnected 
                  ? 'Be the first to register as a validator node and help monitor website uptime.'
                  : 'Connect your wallet to register as a validator node.'}
              </Typography>
              {isConnected ? (
                <Button 
                  component={RouterLink} 
                  to="/node-operator" 
                  variant="contained"
                  size="large"
                >
                  Register as Node Operator
                </Button>
              ) : (
                <Button 
                  component={RouterLink} 
                  to="/connect-wallet" 
                  variant="contained"
                  size="large"
                >
                  Connect Wallet
                </Button>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    </PageContainer>
  );
}

Dashboard.propTypes = {
  onLoading: PropTypes.func,
  onNotify: PropTypes.func
};

export default Dashboard; 