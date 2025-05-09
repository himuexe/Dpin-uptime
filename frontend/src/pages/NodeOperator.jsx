import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  TextField,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ComputerIcon from '@mui/icons-material/Computer';
import TokenIcon from '@mui/icons-material/Token';
import PollIcon from '@mui/icons-material/Poll';
import web3Service from '../services/web3Service';
import nodeService from '../services/nodeService';
import tokenService from '../services/tokenService';

// Mock data for the node operator dashboard
const mockNodeStats = {
  nodeId: 'node_12345abc',
  status: 'Active',
  reputation: 98,
  tokensEarned: 1240,
  checksPerformed: 18562,
  averageResponseTime: 245,
  lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString()
};

const mockRecentRewards = [
  { 
    id: 1, 
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
    amount: 5.2, 
    websites: 18, 
    consensusRate: 100 
  },
  { 
    id: 2, 
    date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), 
    amount: 4.8, 
    websites: 16, 
    consensusRate: 96 
  },
  { 
    id: 3, 
    date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), 
    amount: 5.1, 
    websites: 17, 
    consensusRate: 100 
  },
  { 
    id: 4, 
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), 
    amount: 3.5, 
    websites: 12, 
    consensusRate: 92 
  }
];

// Helper function to format time
const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
};

// Node operation status panel component
const NodeOperationPanel = ({ node, onRedeemRewards }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Node Operation Status
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <ComputerIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">{node ? node.name : '--'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Node Name
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <TokenIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">0.00 UPT</Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Rewards
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 1 }} 
                disabled={true}
                onClick={onRedeemRewards}
              >
                Redeem
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <PollIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">{node ? node.capacity : '--'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Capacity (per hour)
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Alert severity="info">
          Your node is actively monitoring websites. Keep your node online to earn rewards.
        </Alert>
      </CardContent>
    </Card>
  );
};

function NodeOperator() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    nodeName: '',
    endpoint: '',
    capacity: '10'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [needsConnection, setNeedsConnection] = useState(false);
  const [node, setNode] = useState(null);
  const [recentReports, setRecentReports] = useState([]);

  const steps = ['Node Details', 'Configuration', 'Confirmation'];

  // Check wallet connection and node registration status
  useEffect(() => {
    const checkConnection = async () => {
      const connected = web3Service.isConnected();
      setIsConnected(connected);
      
      if (connected) {
        await checkNodeRegistration();
      }
      
      setIsLoading(false);
    };

    // Set up event listeners for wallet events
    web3Service.onConnect = async () => {
      setIsConnected(true);
      setNeedsConnection(false);
      await checkNodeRegistration();
    };

    web3Service.onDisconnect = () => {
      setIsConnected(false);
      setNode(null);
    };

    // Check if node is already registered
    const checkNodeRegistration = async () => {
      try {
        setIsLoading(true);
        const nodeData = await nodeService.getNode();
        
        if (nodeData && nodeData.active) {
          setNode(nodeData);
          setRegistrationComplete(true);
          // Load mock data for recent reports
          loadMockRecentReports();
        }
      } catch (error) {
        console.error('Error checking node registration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Load mock data for recent reports
  const loadMockRecentReports = () => {
    // In a real app, this would come from the StatusReport contract
    const mockReports = [
      {
        websiteId: 1,
        websiteName: 'Example Website 1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        status: true,
        responseTime: 125,
        consensusReward: 0.5
      },
      {
        websiteId: 2,
        websiteName: 'Example Website 2',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        status: false,
        responseTime: 0,
        consensusReward: 0.4
      },
      {
        websiteId: 3,
        websiteName: 'Example Website 3',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        status: true,
        responseTime: 87,
        consensusReward: 0.6
      },
      {
        websiteId: 4,
        websiteName: 'Example Website 4',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        status: true,
        responseTime: 210,
        consensusReward: 0.3
      },
      {
        websiteId: 5,
        websiteName: 'Example Website 5',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        status: true,
        responseTime: 150,
        consensusReward: 0.5
      }
    ];

    setRecentReports(mockReports);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      if (!formData.nodeName.trim()) newErrors.nodeName = 'Node name is required';
    }
    
    if (activeStep === 1) {
      if (!formData.endpoint.trim()) {
        newErrors.endpoint = 'Endpoint is required';
      } else if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.endpoint)) {
        newErrors.endpoint = 'Please enter a valid URL';
      }
      
      if (!formData.capacity) {
        newErrors.capacity = 'Capacity is required';
      } else if (isNaN(formData.capacity) || parseInt(formData.capacity) < 1) {
        newErrors.capacity = 'Must be a positive number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const connectWallet = async () => {
    try {
      await web3Service.connect();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setErrors({
        submit: "Failed to connect wallet. Please try again."
      });
    }
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      setNeedsConnection(true);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Ensure endpoint has protocol
      let formattedEndpoint = formData.endpoint;
      if (!formattedEndpoint.startsWith('http')) {
        formattedEndpoint = 'https://' + formattedEndpoint;
      }
      
      // Call the NodeRegistry contract
      const tx = await nodeService.registerNode(
        formData.nodeName,
        formattedEndpoint,
        parseInt(formData.capacity)
      );
      
      // Set transaction hash for reference
      setTransactionHash(tx.hash);
      
      // Wait for transaction confirmation
      await tx.wait();
      
      // Get updated node data
      const nodeData = await nodeService.getNode();
      setNode(nodeData);
      
      setRegistrationComplete(true);
      // Load mock data for recent reports
      loadMockRecentReports();
    } catch (error) {
      console.error("Error registering node:", error);
      
      // Format user-friendly error messages
      if (error.code === 4001) {
        setErrors({
          submit: "Transaction rejected. Please approve the transaction in your wallet."
        });
      } else if (error.message && error.message.includes("user rejected transaction")) {
        setErrors({
          submit: "Transaction rejected. Please approve the transaction in your wallet."
        });
      } else {
        setErrors({
          submit: "Failed to register node. Please try again."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeemRewards = async () => {
    // This would call the RewardDistribution contract's claim function
    // Not implemented in this version
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Node Name"
              name="nodeName"
              value={formData.nodeName}
              onChange={handleChange}
              error={!!errors.nodeName}
              helperText={errors.nodeName || "Give your node a unique name"}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="API Endpoint"
              name="endpoint"
              placeholder="https://api.yournode.com"
              value={formData.endpoint}
              onChange={handleChange}
              error={!!errors.endpoint}
              helperText={errors.endpoint || "Your node's API endpoint for receiving monitoring requests"}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Capacity (websites per hour)"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              error={!!errors.capacity}
              helperText={errors.capacity || "How many websites your node can check per hour"}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Node Details
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Node Name:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{formData.nodeName}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2">API Endpoint:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{formData.endpoint}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Capacity:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{formData.capacity} websites per hour</Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Registering your node will require a transaction on the Ethereum blockchain and will cost a small amount of ETH for gas fees.
            </Alert>

            {!isConnected && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                You need to connect your wallet before registering.
              </Alert>
            )}
            
            {errors.submit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.submit}
              </Alert>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  // Render loader while checking registration status
  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8, pb: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ pt: 4, pb: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            component={RouterLink}
            to="/dashboard"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Node Operator Dashboard
          </Typography>
          <Typography color="text.secondary">
            {registrationComplete
              ? "Manage your node and track rewards from validating website status."
              : "Register your node to join our network and earn rewards by validating website status."}
          </Typography>
        </Box>

        {registrationComplete ? (
          <>
            {/* Node operation panel */}
            <NodeOperationPanel 
              node={node} 
              onRedeemRewards={handleRedeemRewards}
            />

            {/* Recent reports */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Status Reports
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Website</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Response Time</TableCell>
                        <TableCell>Reward</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentReports.map((report, index) => (
                        <TableRow key={index}>
                          <TableCell>{report.websiteName}</TableCell>
                          <TableCell>{report.timestamp.toLocaleTimeString()}</TableCell>
                          <TableCell>
                            <Chip 
                              label={report.status ? "Online" : "Offline"} 
                              color={report.status ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{report.status ? `${report.responseTime}ms` : "N/A"}</TableCell>
                          <TableCell>{report.consensusReward} UPT</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {recentReports.length === 0 && (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">No reports yet. Start your node to begin monitoring.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {renderStepContent(activeStep)}
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  disabled={activeStep === 0 || isSubmitting}
                  onClick={handleBack}
                >
                  Back
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <>
                    {!isConnected ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={connectWallet}
                      >
                        Connect Wallet to Register
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <CircularProgress size={24} sx={{ mr: 1 }} />
                            Registering...
                          </>
                        ) : (
                          'Register Node'
                        )}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}

export default NodeOperator; 