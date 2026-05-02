/**
 * ThemeRegistry — MUI + Next.js App Router Integration
 * 
 * Handles Emotion cache for SSR and provides MUI theme context.
 */

'use client';

import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/theme/theme';
import Layout from '@/components/Layout';
import AuthProvider from '@/app/AuthProvider';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Layout>{children}</Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}
