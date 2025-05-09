import React from 'react';
import PropTypes from 'prop-types';
import { Box, Container, Typography, Breadcrumbs, Link, Stack, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * Page Container component provides consistent layout for pages
 * Includes optional page title, description, breadcrumbs, and actions
 */
function PageContainer({ 
  title,
  description,
  breadcrumbs = [],
  actions,
  maxWidth = 'lg',
  children,
  sx = {}
}) {
  const hasHeader = title || description || breadcrumbs.length > 0 || actions;

  return (
    <Container maxWidth={maxWidth} sx={{ py: 4, ...sx }}>
      {hasHeader && (
        <Box sx={{ mb: 4 }}>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ mb: 2 }}
            >
              <Link
                underline="hover"
                color="inherit"
                component={RouterLink}
                to="/"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                Home
              </Link>
              
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                
                if (isLast || !crumb.path) {
                  return (
                    <Typography 
                      key={`breadcrumb-${index}`}
                      color="text.primary"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      {crumb.icon && (
                        <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                          {crumb.icon}
                        </Box>
                      )}
                      {crumb.label}
                    </Typography>
                  );
                }
                
                return (
                  <Link
                    key={`breadcrumb-${index}`}
                    underline="hover"
                    color="inherit"
                    component={RouterLink}
                    to={crumb.path}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    {crumb.icon && (
                      <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                        {crumb.icon}
                      </Box>
                    )}
                    {crumb.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          )}

          {/* Title and Actions */}
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center"
            spacing={2}
            sx={{ mb: description ? 1 : 0 }}
          >
            {title && (
              <Typography variant="h4" component="h1" fontWeight="bold">
                {title}
              </Typography>
            )}
            
            {actions && (
              <Box>
                {actions}
              </Box>
            )}
          </Stack>

          {/* Description */}
          {description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>
          )}

          {/* Divider */}
          <Divider sx={{ mt: 2 }} />
        </Box>
      )}

      {/* Page Content */}
      {children}
    </Container>
  );
}

PageContainer.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      icon: PropTypes.node
    })
  ),
  actions: PropTypes.node,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  children: PropTypes.node,
  sx: PropTypes.object
};

export default PageContainer; 