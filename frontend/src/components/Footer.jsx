import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider, Stack, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TelegramIcon from '@mui/icons-material/Telegram';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.background.dark,
        color: 'common.white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MonitorHeartIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                DePIN Uptime
              </Typography>
            </Box>
            <Typography variant="body2" color="grey.400" sx={{ mb: 2 }}>
              Decentralized website monitoring powered by blockchain technology.
              Our platform provides reliable uptime monitoring through a global network
              of validator nodes.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                component={Link}
                href="https://github.com/himuexe/Dpin-uptime"
                target="_blank"
                rel="noopener"
                aria-label="GitHub"
                sx={{ color: 'grey.400', '&:hover': { color: 'common.white' } }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                component={Link}
                href="#"
                target="_blank"
                rel="noopener"
                aria-label="Twitter"
                sx={{ color: 'grey.400', '&:hover': { color: 'common.white' } }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                component={Link}
                href="#"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
                sx={{ color: 'grey.400', '&:hover': { color: 'common.white' } }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                component={Link}
                href="#"
                target="_blank"
                rel="noopener"
                aria-label="Telegram"
                sx={{ color: 'grey.400', '&:hover': { color: 'common.white' } }}
              >
                <TelegramIcon />
              </IconButton>
            </Stack>
          </Grid>

          {/* Links Section */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Platform
            </Typography>
            <Stack spacing={1}>
              <Link
                component={RouterLink}
                to="/dashboard"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Dashboard
              </Link>
              <Link
                component={RouterLink}
                to="/website-owner"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Website Owners
              </Link>
              <Link
                component={RouterLink}
                to="/node-operator"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Node Operators
              </Link>
            </Stack>
          </Grid>

          {/* Resources Section */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Resources
            </Typography>
            <Stack spacing={1}>
              <Link
                href="#"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Documentation
              </Link>
              <Link
                href="#"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                API
              </Link>
              <Link
                href="#"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                GitHub
              </Link>
            </Stack>
          </Grid>

          {/* Legal Section */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Legal
            </Typography>
            <Stack spacing={1}>
              <Link
                href="#"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Cookie Policy
              </Link>
            </Stack>
          </Grid>

          {/* Contact Section */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Contact
            </Typography>
            <Stack spacing={1}>
              <Link
                href="mailto:contact@depinuptime.io"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Email Us
              </Link>
              <Link
                href="#"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Support
              </Link>
              <Link
                href="#"
                color="grey.400"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Feedback
              </Link>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.800' }} />

        {/* Copyright Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
          }}
        >
          <Typography variant="body2" color="grey.500" sx={{ mb: { xs: 2, sm: 0 } }}>
            &copy; {currentYear} DePIN Uptime Platform. All rights reserved.
          </Typography>
          <Box>
            <Stack direction="row" spacing={3}>
              <Link
                href="#"
                color="grey.500"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Status
              </Link>
              <Link
                href="#"
                color="grey.500"
                sx={{ '&:hover': { color: 'common.white' } }}
                underline="none"
              >
                Sitemap
              </Link>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer; 