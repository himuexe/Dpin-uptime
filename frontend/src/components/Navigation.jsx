import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Button,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ComputerIcon from '@mui/icons-material/Computer';
import LanguageIcon from '@mui/icons-material/Language';
import WalletConnect from './wallet/WalletConnect';

// Navigation links configuration with icons
const pages = [
  { title: 'Home', path: '/', icon: <HomeIcon /> },
  { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { title: 'Node Operator', path: '/node-operator', icon: <ComputerIcon /> },
  { title: 'Website Owner', path: '/website-owner', icon: <LanguageIcon /> },
];

function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Determine if a nav link is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  // Drawer content for mobile view
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 280 }}>
      <Box sx={{ 
        py: 2, 
        px: 2.5, 
        display: 'flex', 
        alignItems: 'center',
        bgcolor: (theme) => theme.palette.primary.main + '08'
      }}>
        <MonitorHeartIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          DePIN Uptime
        </Typography>
      </Box>

      <Divider />

      <List sx={{ pt: 1.5 }}>
        {pages.map((page) => (
          <ListItem key={page.title} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={page.path}
              selected={isActive(page.path)}
              sx={{
                py: 1.25,
                px: 2.5,
                borderRadius: '0 24px 24px 0',
                mr: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.light' + '20',
                  '&:hover': {
                    bgcolor: 'primary.light' + '30',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main'
                  },
                  '& .MuiTypography-root': {
                    fontWeight: 'medium',
                    color: 'primary.main'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {page.icon}
              </ListItemIcon>
              <ListItemText primary={page.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ p: 2 }}>
        <WalletConnect />
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={0}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          backdropFilter: 'blur(20px)',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 64 }}>
            {/* Logo for larger screens */}
            <Box 
              component={RouterLink} 
              to="/" 
              sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center',
                textDecoration: 'none',
                mr: 3
              }}
            >
              <Badge 
                variant="dot" 
                color="success" 
                overlap="circular" 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    border: '2px solid white',
                    width: 8,
                    height: 8,
                    borderRadius: '50%'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.light', 
                    width: 38, 
                    height: 38,
                    mr: 1
                  }}
                >
                  <MonitorHeartIcon sx={{ color: 'white' }} />
                </Avatar>
              </Badge>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  ml: 1,
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { md: '1.1rem', lg: '1.2rem' }
                }}
              >
                DePIN Uptime
              </Typography>
            </Box>

            {/* Mobile menu */}
            <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="open menu"
                onClick={handleDrawerToggle}
                color="inherit"
                edge="start"
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Logo for mobile screens */}
            <Box 
              component={RouterLink}
              to="/"
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'flex', md: 'none' },
                alignItems: 'center',
                textDecoration: 'none'
              }}
            >
              <MonitorHeartIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                DePIN Uptime
              </Typography>
            </Box>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
              {pages.map((page) => {
                const active = isActive(page.path);
                
                return (
                  <Tooltip key={page.title} title={page.title} arrow placement="bottom">
                    <Button
                      component={RouterLink}
                      to={page.path}
                      sx={{
                        mx: 0.5,
                        py: 1,
                        px: 1.5,
                        color: active ? 'primary.main' : 'text.primary',
                        position: 'relative',
                        fontWeight: active ? 'medium' : 'normal',
                        '&::after': active ? {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '20%',
                          width: '60%',
                          height: 3,
                          borderRadius: '3px 3px 0 0',
                          bgcolor: 'primary.main',
                        } : {},
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                      startIcon={page.icon}
                    >
                      {!isMobile && page.title}
                    </Button>
                  </Tooltip>
                );
              })}
            </Box>

            {/* Wallet connection button */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <WalletConnect />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
        elevation={4}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navigation; 