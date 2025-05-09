import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Box, 
  Alert, 
  AlertTitle, 
  Button, 
  Container,
  Snackbar
} from '@mui/material';

// Custom theme
import theme from './theme';

// Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LoadingScreen from './components/common/LoadingScreen';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import NodeOperator from './pages/NodeOperator';
import WebsiteOwner from './pages/WebsiteOwner';
import ConnectWallet from './components/wallet/WalletConnect';

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ mb: 3 }}
          >
            <AlertTitle>Something went wrong</AlertTitle>
            {this.state.error && this.state.error.toString()}
          </Alert>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={this.handleReset}
            sx={{ mr: 2 }}
          >
            Return to Home
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          
          {this.state.errorInfo && (
            <Box 
              component="details" 
              sx={{ 
                mt: 4, 
                p: 2, 
                bgcolor: 'grey.100', 
                borderRadius: 1,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
              }}
            >
              <summary>Error Details (for developers)</summary>
              <Box sx={{ mt: 2, overflow: 'auto' }}>
                {this.state.errorInfo.componentStack}
              </Box>
            </Box>
          )}
        </Container>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Global notification handler that can be used by any component
  const handleNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Global loading state handler
  const handleLoading = (loading) => {
    setIsLoading(loading);
  };

  // Suppress loading indicator for Dashboard specifically
  const setLoading = (isLoading) => {
    // Only show loading for non-Dashboard routes
    const currentPath = window.location.pathname;
    const isDashboard = currentPath === '/' || currentPath === '/dashboard';
    
    // Don't show loading for Dashboard since it has its own handling
    if (!isDashboard || !isLoading) {
      setIsLoading(isLoading);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Box 
          className="app" 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh',
            bgcolor: 'background.default'
          }}
        >
          <Navigation />
          
          {isLoading && <LoadingScreen fullPage message="Loading application..." />}
          
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1,
              pt: 2,
              pb: 6
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard onLoading={setLoading} onNotify={handleNotification} />} />
              <Route path="/node-operator" element={<NodeOperator onLoading={handleLoading} onNotify={handleNotification} />} />
              <Route path="/website-owner" element={<WebsiteOwner onLoading={handleLoading} onNotify={handleNotification} />} />              <Route path="/connect-wallet" element={<ConnectWallet onLoading={handleLoading} onNotify={handleNotification} />} />
            </Routes>
          </Box>
          
          <Footer />
          
          {/* Global notification snackbar */}
          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseNotification}
              severity={notification.severity}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App; 