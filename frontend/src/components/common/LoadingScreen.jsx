import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography, Container, Paper, Button } from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';

/**
 * Loading screen component displays a loading indicator with optional message
 * Can be used as a full-page loader or within a specific container
 * Includes automatic timeout to offer skip option
 */
function LoadingScreen({ 
  message = 'Loading...', 
  fullPage = false, 
  height = 400,
  showPaper = false,
  longTimeout = 5000, // Time before showing extended message
}) {
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);
  const [progress, setProgress] = useState(0);

  // Show extended message after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowExtendedMessage(true);
    }, longTimeout);

    // Animate progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 1;
        return newProgress >= 100 ? 0 : newProgress;
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [longTimeout]);

  const content = (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        height: fullPage ? '80vh' : height,
        width: '100%'
      }}
    >
      <CircularProgress 
        size={40} 
        thickness={4}
        variant={showExtendedMessage ? "determinate" : "indeterminate"}
        value={progress}
      />
      
      {message && (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}

      {showExtendedMessage && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 2, maxWidth: 400 }}
          >
            This is taking longer than expected. If you're connecting to the blockchain for the first time, 
            this could take a moment. We're still trying to connect...
          </Typography>
          
          <Button
            startIcon={<LoopIcon />}
            variant="outlined"
            size="small"
            onClick={() => window.location.reload()}
            sx={{ mr: 1 }}
          >
            Refresh Page
          </Button>
        </Box>
      )}
    </Box>
  );

  if (fullPage) {
    return (
      <Container maxWidth="lg">
        {content}
      </Container>
    );
  }

  if (showPaper) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          height: height
        }}
      >
        {content}
      </Paper>
    );
  }

  return content;
}

LoadingScreen.propTypes = {
  message: PropTypes.string,
  fullPage: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showPaper: PropTypes.bool,
  longTimeout: PropTypes.number
};

export default LoadingScreen; 