/**
 * Priority Notifications Page
 * 
 * Displays Top N highest-priority unread notifications using
 * the Stage 1 priority engine (Min-Heap based).
 * 
 * Priority is determined by:
 * 1. Type weight: Placement > Result > Event
 * 2. Recency: Newer = higher priority
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Slider,
  alpha,
  Alert,
  Button,
  Paper,
} from '@mui/material';
import {
  PriorityHigh as PriorityIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import NotificationList from '@/components/NotificationList';
import { useNotifications } from '@/hooks/useNotifications';
import { useReadStatus } from '@/hooks/useReadStatus';
import {
  getTopNUnread,
  calculatePriorityScore,
} from '@/lib/priorityEngine';
import { logger } from '@/lib/logger';

export default function PriorityNotificationsPage() {
  const [topN, setTopN] = useState<number>(10);

  // Fetch all notifications (no pagination — we need all for priority calc)
  const { notifications, isLoading, error, refetch } = useNotifications({
    pollInterval: 30000,
  });

  // Read status
  const { readIds, toggleReadStatus } = useReadStatus();

  useEffect(() => {
    logger.info('page', 'Priority Notifications page mounted');
  }, []);

  // Compute top N priority notifications
  const priorityNotifications = useMemo(() => {
    if (notifications.length === 0) return [];

    logger.debug('page', `Computing top ${topN} priority notifications from ${notifications.length} total`);
    const topUnread = getTopNUnread(notifications, topN, readIds);
    logger.info('page', `Found ${topUnread.length} priority notifications`);

    return topUnread;
  }, [notifications, topN, readIds]);

  // Build priority score map for display
  const priorityScores = useMemo(() => {
    const map = new Map<string, number>();
    priorityNotifications.forEach((n) => {
      map.set(n.ID, n.priorityScore);
    });
    return map;
  }, [priorityNotifications]);

  // Count stats
  const totalUnread = useMemo(() => {
    return notifications.filter((n) => !readIds.has(n.ID)).length;
  }, [notifications, readIds]);

  const handleTopNChange = (_event: Event, value: number | number[]) => {
    const n = typeof value === 'number' ? value : value[0];
    setTopN(n);
    logger.info('page', `Top N changed to ${n}`);
  };

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <PriorityIcon
            sx={{
              fontSize: 28,
              color: 'warning.main',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.7, transform: 'scale(1.1)' },
              },
            }}
          />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Priority Notifications
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Top {topN} highest-priority unread notifications, ranked by type importance and recency
        </Typography>
      </Box>

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Priority info card */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.warning.main, 0.08)})`,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                SHOWING
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {priorityNotifications.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                TOTAL UNREAD
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'warning.main' }}>
                {totalUnread}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                TOTAL
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                {notifications.length}
              </Typography>
            </Box>
          </Box>

          {/* Top N slider */}
          <Box sx={{ width: { xs: '100%', sm: 250 } }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
            >
              TOP N: {topN}
            </Typography>
            <Slider
              id="top-n-slider"
              value={topN}
              onChange={handleTopNChange}
              min={1}
              max={50}
              step={1}
              valueLabelDisplay="auto"
              sx={{
                color: 'primary.main',
                '& .MuiSlider-thumb': {
                  width: 20,
                  height: 20,
                },
              }}
            />
          </Box>

          <Button
            id="btn-refresh-priority"
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>

        {/* Priority legend */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mt: 2,
            pt: 2,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              PRIORITY ORDER:
            </Typography>
          </Box>
          <Chip
            label="🔴 Placement (Weight: 3)"
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip
            label="🟠 Result (Weight: 2)"
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip
            label="🔵 Event (Weight: 1)"
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
      </Paper>

      {/* Priority notification list */}
      <NotificationList
        notifications={priorityNotifications}
        isLoading={isLoading}
        readIds={readIds}
        onToggleRead={toggleReadStatus}
        showPriority
        priorityScores={priorityScores}
        emptyMessage="No unread notifications — you're all caught up! 🎉"
      />
    </Box>
  );
}
