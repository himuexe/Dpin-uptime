import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  MenuItem, 
  Menu, 
  ListItemIcon, 
  ListItemText, 
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import web3Service from '../../services/web3Service';
import tokenService from '../../services/tokenService';

const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [error, setError] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [anchorEl, setAnchorEl] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (web3Service.isConnected()) {
        const connectedAccount = web3Service.getAccount();
        setAccount(connectedAccount);
        await updateNetworkInfo();
        await updateTokenBalance(connectedAccount);
      }
    };

    // Add event listeners for wallet events
    web3Service.onConnect = (connectedAccount) => {
      setAccount(connectedAccount);
      updateTokenBalance(connectedAccount);
      updateNetworkInfo();
    };

    web3Service.onAccountChange = (newAccount) => {
      setAccount(newAccount);
      updateTokenBalance(newAccount);
    };

    web3Service.onDisconnect = () => {
      setAccount(null);
      setTokenBalance('0');
    };

    web3Service.onNetworkChange = () => {
      updateNetworkInfo();
      if (web3Service.getAccount()) {
        updateTokenBalance(web3Service.getAccount());
      }
    };

    checkConnection();
  }, []);

  const updateNetworkInfo = async () => {
    try {
      const networkId = await web3Service.getNetworkId();
      let name = 'Unknown Network';
      
      // Map network IDs to names
      switch (networkId) {
        case 1:
          name = 'Ethereum Mainnet';
          break;
        case 5:
          name = 'Goerli Testnet';
          break;
        case 11155111:
          name = 'Sepolia Testnet';
          break;
        case 31337:
          name = 'Hardhat Local';
          break;
        default:
          name = `Network #${networkId}`;
      }
      
      setNetworkName(name);
    } catch (error) {
      console.error('Error updating network info:', error);
    }
  };

  const updateTokenBalance = async (address) => {
    try {
      if (address) {
        const balance = await tokenService.getBalance(address);
        setTokenBalance(balance);
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
    }
  };

  const handleConnectClick = () => {
    setShowConnectDialog(true);
  };

  const handleCloseDialog = () => {
    setShowConnectDialog(false);
    setError('');
  };

  const handleConnect = async () => {
    setConnecting(true);
    setError('');
    
    try {
      console.log("Initiating wallet connection...");
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        setError('MetaMask is not installed. Please install MetaMask from https://metamask.io/');
        setConnecting(false);
        return;
      }
      
      await web3Service.connect();
      
      // Set up error listener
      web3Service.onError = (message) => {
        setError(message);
        setConnecting(false);
      };
      
      setShowConnectDialog(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // Provide user-friendly error messages
      if (error.code === 4001) {
        setError('Connection rejected. Please approve the connection in your wallet.');
      } else if (error.code === -32002) {
        setError('Connection request already pending. Please check MetaMask and approve the connection.');
      } else if (error.message && error.message.includes("RPC")) {
        setError('Network connection error. Make sure your Hardhat node is running at http://127.0.0.1:8545/');
      } else if (!window.ethereum) {
        setError('MetaMask not detected. Please install MetaMask from https://metamask.io/');
      } else {
        setError(error.message || 'Failed to connect. Please try again or refresh the page.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopyStatus('Address copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 2000);
    }
    handleMenuClose();
  };

  const handleDisconnect = () => {
    // MetaMask doesn't support programmatic disconnect, so we just clear our state
    setAccount(null);
    setTokenBalance('0');
    handleMenuClose();
  };

  const formatAddress = (address) => {
    // Use the static method properly
    return web3Service.constructor.formatAddress?.(address) || `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      {!account && (
        <Button
          variant="contained"
          startIcon={<AccountBalanceWalletIcon />}
          onClick={handleConnectClick}
          color="primary"
        >
          Connect Wallet
        </Button>
      )}
      
      {account && (
        <>
          <Button
            variant="contained"
            startIcon={<AccountBalanceWalletIcon />}
            onClick={handleMenuClick}
            color="success"
            sx={{ 
              bgcolor: 'success.main',
              '&:hover': {
                bgcolor: 'success.dark',
              },
              pl: 1.5,
              pr: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: '#4caf50', 
                mr: 1, 
                boxShadow: '0 0 0 2px rgba(255,255,255,0.5)'
              }} 
            />
            {formatAddress(account)}
          </Button>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 250,
                borderRadius: 1,
                overflow: 'visible',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Connected to {networkName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {account}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Token Balance:
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {parseFloat(tokenBalance).toFixed(2)} UPT
              </Typography>
            </Box>
            
            <MenuItem onClick={handleCopyAddress}>
              <ListItemIcon>
                <ContentCopyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy Address</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleDisconnect}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Disconnect</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
      
      {/* Connect Wallet Dialog */}
      <Dialog
        open={showConnectDialog}
        onClose={handleCloseDialog}
        aria-labelledby="wallet-dialog-title"
        disableEnforceFocus
        keepMounted={false}
        BackdropProps={{
          "aria-hidden": "false"
        }}
        PaperProps={{
          "aria-modal": "true",
          role: "dialog",
          tabIndex: -1
        }}
      >
        <DialogTitle id="wallet-dialog-title">Connect your Wallet</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2, textAlign: 'center' }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography gutterBottom>
              Connect your Ethereum wallet to interact with the DePIN Uptime Platform.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            {copyStatus && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {copyStatus}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleConnect}
            disabled={connecting}
            startIcon={connecting ? <CircularProgress size={20} /> : null}
          >
            {connecting ? 'Connecting...' : 'Connect MetaMask'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WalletConnect; 