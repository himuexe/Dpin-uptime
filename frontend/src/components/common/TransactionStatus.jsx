import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Chip,
  Paper,
  Link,
  Collapse,
  IconButton,
  Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/**
 * Transaction Status component displays blockchain transaction status with proper feedback
 */
function TransactionStatus({ 
  status = 'pending', 
  txHash = null,
  message = null,
  error = null
}) {
  const [expanded, setExpanded] = React.useState(false);

  // Generate Etherscan link for transaction
  const etherscanLink = txHash ? `https://etherscan.io/tx/${txHash}` : null;
  
  // For local development/testing
  const hardhatLink = txHash ? `http://localhost:8545/tx/${txHash}` : null;

  // Copy transaction hash to clipboard
  const handleCopyTxHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      // Could add a toast notification here
    }
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" fontSize="large" />;
      case 'error':
      case 'failed':
        return <ErrorIcon color="error" fontSize="large" />;
      case 'pending':
      default:
        return <PendingIcon color="warning" fontSize="large" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'success';
      case 'error':
      case 'failed': return 'error';
      case 'pending':
      default: return 'warning';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success': return 'Transaction Succeeded';
      case 'error':
      case 'failed': return 'Transaction Failed';
      case 'pending':
      default: return 'Transaction Pending';
    }
  };

  // For transactions with no hash (e.g., failed to submit)
  if (!txHash && status !== 'pending') {
    return (
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          bgcolor: status === 'error' ? 'error.light' + '10' : 'background.paper'
        }}
      >
        {getStatusIcon()}
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {message || getStatusText()}
          </Typography>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
              Error: {error.message || String(error)}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2,
        bgcolor: status === 'pending' 
          ? 'warning.light' + '10' 
          : status === 'success' 
            ? 'success.light' + '10' 
            : 'error.light' + '10'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {status === 'pending' ? (
            <CircularProgress size={30} thickness={6} />
          ) : (
            getStatusIcon()
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {message || getStatusText()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {txHash && (
                <>
                  TX: {txHash.slice(0, 6)}...{txHash.slice(-4)}
                  <IconButton 
                    size="small" 
                    onClick={handleCopyTxHash}
                    sx={{ ml: 0.5, p: 0.3 }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Typography>
          </Box>
        </Stack>
        <Box>
          <Chip 
            label={status.toUpperCase()}
            color={getStatusColor()}
            size="small"
            sx={{ fontWeight: 'medium' }}
          />
        </Box>
      </Box>

      {txHash && (
        <>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mt: 1.5
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {expanded ? 'Hide Details' : 'View Details'}
            </Typography>
            <IconButton size="small" onClick={handleToggleExpand}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Transaction Hash:</strong> {txHash}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Status:</strong> {status}
              </Typography>
              
              {etherscanLink && (
                <Typography variant="body2">
                  <strong>View on:</strong>{' '}
                  <Link 
                    href={etherscanLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Etherscan
                  </Link>
                  {' | '}
                  <Link 
                    href={hardhatLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Hardhat
                  </Link>
                </Typography>
              )}

              {error && (
                <Typography 
                  variant="body2" 
                  color="error" 
                  sx={{ 
                    mt: 1.5, 
                    p: 1.5, 
                    bgcolor: 'error.light' + '10', 
                    borderRadius: 1 
                  }}
                >
                  Error: {error.message || String(error)}
                </Typography>
              )}
            </Box>
          </Collapse>
        </>
      )}
    </Paper>
  );
}

TransactionStatus.propTypes = {
  status: PropTypes.oneOf(['pending', 'success', 'error', 'failed']),
  txHash: PropTypes.string,
  message: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
};

export default TransactionStatus; 