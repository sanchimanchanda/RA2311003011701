/**
 * Material UI Theme Configuration
 * 
 * Premium dark theme with vibrant accent colors for the
 * Campus Notifications System.
 */

'use client';

import { createTheme, alpha } from '@mui/material/styles';

/** Custom color palette */
const palette = {
  primary: {
    main: '#6C63FF',
    light: '#8B83FF',
    dark: '#4A42DB',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#00D9FF',
    light: '#33E1FF',
    dark: '#00A8C7',
    contrastText: '#000000',
  },
  background: {
    default: '#0A0E1A',
    paper: '#121829',
  },
  text: {
    primary: '#E8EAED',
    secondary: '#9AA0B4',
  },
  error: {
    main: '#FF5252',
    light: '#FF7B7B',
    dark: '#D32F2F',
  },
  warning: {
    main: '#FFB74D',
    light: '#FFCC02',
    dark: '#F57C00',
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
  },
  info: {
    main: '#29B6F6',
    light: '#4FC3F7',
    dark: '#0288D1',
  },
  divider: 'rgba(255, 255, 255, 0.08)',
};

/** Notification type colors */
export const notificationTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  Placement: {
    bg: alpha('#FF6B6B', 0.12),
    text: '#FF6B6B',
    border: alpha('#FF6B6B', 0.3),
  },
  Result: {
    bg: alpha('#FFB74D', 0.12),
    text: '#FFB74D',
    border: alpha('#FFB74D', 0.3),
  },
  Event: {
    bg: alpha('#4FC3F7', 0.12),
    text: '#4FC3F7',
    border: alpha('#4FC3F7', 0.3),
  },
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    ...palette,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.85rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${palette.primary.main} ${palette.background.default}`,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: palette.background.default,
          },
          '&::-webkit-scrollbar-thumb': {
            background: palette.primary.dark,
            borderRadius: '4px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: `1px solid ${palette.divider}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: alpha(palette.primary.main, 0.4),
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 30px ${alpha(palette.primary.main, 0.15)}`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
        },
        contained: {
          boxShadow: `0 4px 14px ${alpha(palette.primary.main, 0.4)}`,
          '&:hover': {
            boxShadow: `0 6px 20px ${alpha(palette.primary.main, 0.6)}`,
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: alpha(palette.primary.main, 0.5),
          '&:hover': {
            borderColor: palette.primary.main,
            backgroundColor: alpha(palette.primary.main, 0.08),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.02em',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          '&.Mui-selected': {
            backgroundColor: alpha(palette.primary.main, 0.2),
            borderColor: palette.primary.main,
            color: palette.primary.light,
            '&:hover': {
              backgroundColor: alpha(palette.primary.main, 0.3),
            },
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            borderRadius: 8,
            fontWeight: 600,
            '&.Mui-selected': {
              backgroundColor: palette.primary.main,
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: palette.primary.dark,
              },
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: alpha(palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${palette.divider}`,
        },
      },
    },
  },
});

