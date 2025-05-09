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
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import web3Service from '../services/web3Service';
import websiteService from '../services/websiteService';

function WebsiteOwner() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    websiteName: '',
    url: '',
    description: '',
    checkFrequency: '5',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [needsConnection, setNeedsConnection] = useState(false);

  const steps = ['Website Details', 'Monitoring Options', 'Confirmation'];

  // Check wallet connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = web3Service.isConnected();
      setIsConnected(connected);
    };

    checkConnection();

    // Set up event listener for wallet connection
    web3Service.onConnect = () => {
      setIsConnected(true);
      setNeedsConnection(false);
    };

    web3Service.onDisconnect = () => {
      setIsConnected(false);
    };
  }, []);

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
      if (!formData.websiteName.trim()) newErrors.websiteName = 'Website name is required';
      if (!formData.url.trim()) {
        newErrors.url = 'URL is required';
      } else if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.url)) {
        newErrors.url = 'Please enter a valid URL';
      }
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    }
    
    if (activeStep === 1) {
      if (!formData.checkFrequency) {
        newErrors.checkFrequency = 'Check frequency is required';
      } else if (isNaN(formData.checkFrequency) || parseInt(formData.checkFrequency) < 1) {
        newErrors.checkFrequency = 'Must be a positive number';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
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
      // Ensure URL has protocol
      let formattedUrl = formData.url;
      if (!formattedUrl.startsWith('http')) {
        formattedUrl = 'https://' + formattedUrl;
      }
      
      // Call the WebsiteRegistry contract with improved transaction handling
      const result = await websiteService.registerWebsite(
        formData.websiteName,
        formattedUrl,
        formData.description,
        parseInt(formData.checkFrequency)
      );
      
      // Set transaction hash for reference
      setTransactionHash(result.hash);
      
      // Wait for transaction confirmation using the promise returned from the service
      const confirmation = await result.confirmationPromise;
      
      if (confirmation.status === 'success') {
        setRegistrationComplete(true);
      } else {
        // Handle transaction failure from confirmation
        setErrors({
          submit: confirmation.message || "Transaction failed on the blockchain"
        });
      }
    } catch (error) {
      console.error("Error registering website:", error);
      
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
          submit: error.message || "Failed to register website. Please try again."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Website Name"
              name="websiteName"
              value={formData.websiteName}
              onChange={handleChange}
              error={!!errors.websiteName}
              helperText={errors.websiteName}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Website URL"
              name="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={handleChange}
              error={!!errors.url}
              helperText={errors.url}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Check Frequency (minutes)"
              name="checkFrequency"
              type="number"
              value={formData.checkFrequency}
              onChange={handleChange}
              error={!!errors.checkFrequency}
              helperText={errors.checkFrequency || "How often should we check your website"}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Alert Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email || "Where should we send alerts?"}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Website Details
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Website Name:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{formData.websiteName}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2">URL:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{formData.url}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Description:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{formData.description}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Check Frequency:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>Every {formData.checkFrequency} minutes</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Alert Email:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{formData.email}</Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Registering your website will require a transaction on the Ethereum blockchain and will cost a small amount of ETH for gas fees.
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
            Register Your Website
          </Typography>
          <Typography color="text.secondary">
            Add your website to our decentralized monitoring platform for reliable uptime tracking.
          </Typography>
        </Box>

        {/* Registration Form */}
        <Card>
          <CardContent>
            {registrationComplete ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Registration Complete!
                </Typography>
                <Typography variant="body1" paragraph>
                  Your website has been successfully registered for monitoring.
                </Typography>
                {transactionHash && (
                  <Typography variant="body2" sx={{ mb: 3 }}>
                    Transaction: {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 8)}
                  </Typography>
                )}
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  variant="contained"
                  color="primary"
                >
                  View Dashboard
                </Button>
              </Box>
            ) : (
              <>
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
                            'Register Website'
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
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default WebsiteOwner; 