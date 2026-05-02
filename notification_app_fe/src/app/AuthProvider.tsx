/**
 * AuthProvider — Initializes authentication on app load.
 * 
 * Authenticates with the evaluation service and passes
 * the token to the logger for authenticated log delivery.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { authenticate } from '@/lib/auth';
import { logger } from '@/lib/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        logger.info('auth', 'Initializing authentication...');
        const token = await authenticate();
        
        // Pass token to logger for authenticated log delivery
        logger.setToken(token);
        logger.info('auth', 'Authentication successful — app ready');

        if (mounted) {
          setIsReady(true);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        logger.error('auth', `Auth initialization failed: ${message}`);
        
        if (mounted) {
          setError(message);
          setIsReady(true); // Still render app — API calls will retry auth
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isReady) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 3,
        }}
      >
        <CircularProgress
          size={48}
          sx={{ color: 'primary.main' }}
        />
        <Typography variant="body1" color="text.secondary">
          Connecting to campus services...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
