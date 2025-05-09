import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DnsIcon from '@mui/icons-material/Dns';
import SecurityIcon from '@mui/icons-material/Security';
import TokenIcon from '@mui/icons-material/Token';

function Home() {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          pt: 8,
          pb: 6,
          textAlign: 'center',
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          color="primary"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          DePIN Uptime Platform
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Decentralized website monitoring powered by blockchain technology.
          <br />
          Get reliable uptime checks from distributed validator nodes across the globe.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button 
                component={RouterLink} 
                to="/website-owner" 
                variant="contained" 
                size="large"
                color="primary"
              >
                Monitor Your Website
              </Button>
            </Grid>
            <Grid item>
              <Button 
                component={RouterLink} 
                to="/node-operator" 
                variant="outlined" 
                size="large"
              >
                Become a Validator
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Features Section */}
      <Typography variant="h4" color="primary" align="center" sx={{ mb: 4, mt: 6 }}>
        Key Features
      </Typography>
      <Grid container spacing={4}>
        {/* Feature 1 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <MonitorHeartIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="div" gutterBottom align="center">
                Decentralized Monitoring
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Website uptime checks from independent validator nodes distributed across the globe, ensuring no single point of failure.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Feature 2 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <DnsIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="div" gutterBottom align="center">
                Consensus Validation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Multiple nodes validate your website's status, providing a consensus-based approach to accurate uptime reporting.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Feature 3 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="div" gutterBottom align="center">
                Transparent & Secure
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All monitoring data is stored on the blockchain, providing immutable, tamper-proof records of your website's performance.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Feature 4 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <TokenIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="div" gutterBottom align="center">
                Token Incentives
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Validator nodes earn UPT tokens for honest reporting, creating an economically sustainable monitoring ecosystem.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Call to Action */}
      <Box sx={{ bgcolor: 'background.paper', p: 6, mt: 6, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Ready to get started?
        </Typography>
        <Typography variant="body1" paragraph>
          Join our decentralized website monitoring platform today.
        </Typography>
        <Button 
          component={RouterLink} 
          to="/dashboard" 
          variant="contained" 
          size="large" 
          color="primary"
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
}

export default Home; 