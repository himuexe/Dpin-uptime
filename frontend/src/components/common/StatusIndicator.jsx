import React from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/**
 * Status Indicator component for visually displaying status information
 * Supports multiple status types with appropriate colors and icons
 */
function StatusIndicator({ 
  status, 
  variant = 'chip', 
  size = 'small',
  withIcon = true,
  withTooltip = true,
  tooltip = null,
}) {
  // Define status configurations
  const statusConfig = {
    online: {
      color: 'success',
      icon: <CheckCircleIcon fontSize="inherit" />,
      label: 'Online',
      tooltip: 'Website is operating normally',
    },
    offline: {
      color: 'error',
      icon: <ErrorIcon fontSize="inherit" />,
      label: 'Offline',
      tooltip: 'Website is not responding',
    },
    degraded: {
      color: 'warning',
      icon: <WarningIcon fontSize="inherit" />,
      label: 'Degraded',
      tooltip: 'Website is operating with reduced performance',
    },
    unknown: {
      color: 'default',
      icon: <HelpIcon fontSize="inherit" />,
      label: 'Unknown',
      tooltip: 'Status information is unavailable',
    },
    pending: {
      color: 'info',
      icon: <AccessTimeIcon fontSize="inherit" />,
      label: 'Pending',
      tooltip: 'Status is being determined',
    },
  };

  // Normalize status to lowercase and handle custom statuses
  const normalizedStatus = status ? status.toLowerCase() : 'unknown';
  const config = statusConfig[normalizedStatus] || {
    color: 'default',
    icon: <HelpIcon fontSize="inherit" />,
    label: status || 'Unknown',
    tooltip: 'Custom status',
  };

  // Define size properties
  const sizeProps = {
    small: {
      dotSize: 8,
      fontSize: 'small',
    },
    medium: {
      dotSize: 10,
      fontSize: 'medium',
    },
    large: {
      dotSize: 12,
      fontSize: 'medium',
    },
  };

  const sizeConfig = sizeProps[size] || sizeProps.small;

  // Dot variant (simple colored circle)
  if (variant === 'dot') {
    const dot = (
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          width: sizeConfig.dotSize,
          height: sizeConfig.dotSize,
          borderRadius: '50%',
          backgroundColor: `${config.color}.main`,
          boxShadow: 1,
        }}
      />
    );

    return withTooltip ? (
      <Tooltip title={tooltip || config.tooltip}>
        {dot}
      </Tooltip>
    ) : dot;
  }

  // Text variant (just text in the status color)
  if (variant === 'text') {
    const text = (
      <Box
        component="span"
        sx={{
          color: `${config.color}.main`,
          display: 'inline-flex',
          alignItems: 'center',
          fontWeight: 'medium',
        }}
      >
        {withIcon && (
          <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
            {config.icon}
          </Box>
        )}
        {config.label}
      </Box>
    );

    return withTooltip ? (
      <Tooltip title={tooltip || config.tooltip}>
        {text}
      </Tooltip>
    ) : text;
  }

  // Default chip variant
  const chip = (
    <Chip
      icon={withIcon ? config.icon : undefined}
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 'medium' }}
    />
  );

  return withTooltip ? (
    <Tooltip title={tooltip || config.tooltip}>
      {chip}
    </Tooltip>
  ) : chip;
}

StatusIndicator.propTypes = {
  status: PropTypes.string,
  variant: PropTypes.oneOf(['chip', 'dot', 'text']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  withIcon: PropTypes.bool,
  withTooltip: PropTypes.bool,
  tooltip: PropTypes.string,
};

export default StatusIndicator; 