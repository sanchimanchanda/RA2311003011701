/**
 * Layout Component
 * 
 * App-wide layout with:
 * - Glassmorphism AppBar with navigation
 * - Responsive sidebar on desktop
 * - Bottom navigation on mobile
 * - Animated gradient background
 */

'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  PriorityHigh as PriorityIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { logger } from '@/lib/logger';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    label: 'All Notifications',
    path: '/',
    icon: <NotificationsIcon />,
  },
  {
    label: 'Priority',
    path: '/priority',
    icon: <PriorityIcon />,
  },
];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleNavigate = (path: string) => {
    logger.info('component', `Navigating to ${path}`);
    router.push(path);
    setDrawerOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 20% 50%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, ${alpha(theme.palette.secondary.main, 0.06)} 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, ${alpha('#FF6B6B', 0.04)} 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* AppBar */}
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo / Title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
            onClick={() => handleNavigate('/')}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            >
              <SchoolIcon sx={{ fontSize: 22, color: '#fff' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              CampusNotify
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  id={`nav-${item.path === '/' ? 'all' : item.path.slice(1)}`}
                  onClick={() => handleNavigate(item.path)}
                  startIcon={item.icon}
                  variant={pathname === item.path ? 'contained' : 'text'}
                  sx={{
                    px: 2.5,
                    color:
                      pathname === item.path
                        ? 'primary.contrastText'
                        : 'text.secondary',
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              backgroundColor: 'background.paper',
              backgroundImage: 'none',
            },
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Navigation
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ pt: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.25),
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: pathname === item.path ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: pathname === item.path ? 600 : 400,
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main content */}
      <Container
        maxWidth="md"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: { xs: 3, md: 4 },
          px: { xs: 2, md: 3 },
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
