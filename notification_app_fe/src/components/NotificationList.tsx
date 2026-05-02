/**
 * NotificationList Component
 * 
 * Renders a list of notification cards with:
 * - Empty state display
 * - Loading skeleton
 * - Animated transitions
 */

'use client';

import React from 'react';
import { Box, Typography, Skeleton, Fade, alpha } from '@mui/material';
import { NotificationsOff as EmptyIcon } from '@mui/icons-material';
import NotificationCard from './NotificationCard';
import { Notification } from '@/lib/types';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  readIds: Set<string>;
  onToggleRead: (id: string) => void;
  showPriority?: boolean;
  priorityScores?: Map<string, number>;
  emptyMessage?: string;
}

/** Loading skeleton for notification cards */
function NotificationSkeleton() {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Skeleton variant="circular" width={8} height={8} sx={{ mt: 1 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={60} />
          </Box>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="75%" />
        </Box>
      </Box>
    </Box>
  );
}

export default function NotificationList({
  notifications,
  isLoading,
  readIds,
  onToggleRead,
  showPriority = false,
  priorityScores,
  emptyMessage = 'No notifications found',
}: NotificationListProps) {
  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </Box>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 3,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            mb: 2,
          }}
        >
          <EmptyIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
        </Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Check back later for new updates
        </Typography>
      </Box>
    );
  }

  // Notification list
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {notifications.map((notification, index) => (
        <Fade
          key={notification.ID}
          in
          timeout={300 + index * 50}
          style={{ transitionDelay: `${index * 30}ms` }}
        >
          <Box>
            <NotificationCard
              notification={notification}
              isRead={readIds.has(notification.ID)}
              onToggleRead={onToggleRead}
              showPriority={showPriority}
              priorityScore={priorityScores?.get(notification.ID)}
            />
          </Box>
        </Fade>
      ))}
    </Box>
  );
}
