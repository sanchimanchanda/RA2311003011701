'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  EventNote as EventIcon,
  EmojiEvents as ResultIcon,
  Work as PlacementIcon,
  MarkEmailRead as ReadIcon,
  MarkEmailUnread as UnreadIcon,
  AccessTime as TimeIcon,
  TrendingUp as PriorityIcon,
} from '@mui/icons-material';
import { Notification, NotificationType } from '@/lib/types';
import { notificationTypeColors } from '@/theme/theme';
import { logger } from '@/lib/logger';

interface NotificationCardProps {
  notification: Notification;
  isRead: boolean;
  priorityScore?: number;
  onToggleRead: (id: string) => void;
  showPriority?: boolean;
}

const typeIcons: Record<NotificationType, React.ReactElement> = {
  Event: <EventIcon fontSize="small" />,
  Result: <ResultIcon fontSize="small" />,
  Placement: <PlacementIcon fontSize="small" />,
};

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return timestamp;
  }
}

export default function NotificationCard({
  notification,
  isRead,
  priorityScore,
  onToggleRead,
  showPriority = false,
}: NotificationCardProps) {
  const typeColor = notificationTypeColors[notification.Type] || notificationTypeColors.Event;

  const handleToggleRead = () => {
    logger.info('component', `Toggle read status for notification ${notification.ID}`);
    onToggleRead(notification.ID);
  };

  return (
    <Card
      id={`notification-card-${notification.ID}`}
      sx={{
        position: 'relative',
        opacity: isRead ? 0.65 : 1,
        borderLeft: `4px solid ${typeColor.text}`,
        backgroundColor: isRead
          ? 'background.paper'
          : (theme) => alpha(theme.palette.background.paper, 1),
        '&::before': isRead
          ? {}
          : {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${alpha(typeColor.text, 0.03)} 0%, transparent 100%)`,
              borderRadius: 'inherit',
              pointerEvents: 'none',
            },
      }}
    >
      <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Unread indicator dot */}
          {!isRead && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: typeColor.text,
                flexShrink: 0,
                mt: 1,
                boxShadow: `0 0 8px ${alpha(typeColor.text, 0.6)}`,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
          )}

          {/* Main content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Top row: Type chip + timestamp */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
                flexWrap: 'wrap',
                gap: 0.5,
              }}
            >
              <Chip
                icon={typeIcons[notification.Type]}
                label={notification.Type}
                size="small"
                sx={{
                  backgroundColor: typeColor.bg,
                  color: typeColor.text,
                  border: `1px solid ${typeColor.border}`,
                  '& .MuiChip-icon': {
                    color: typeColor.text,
                  },
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon
                  sx={{ fontSize: 14, color: 'text.secondary' }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  {formatTimestamp(notification.Timestamp)}
                </Typography>
              </Box>
            </Box>

            {/* Message */}
            <Typography
              variant="body1"
              sx={{
                fontWeight: isRead ? 400 : 500,
                color: isRead ? 'text.secondary' : 'text.primary',
                lineHeight: 1.5,
                wordBreak: 'break-word',
              }}
            >
              {notification.Message}
            </Typography>

            {/* Priority score (optional) */}
            {showPriority && priorityScore !== undefined && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 1,
                }}
              >
                <PriorityIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'warning.main',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                  }}
                >
                  Priority: {(priorityScore / 1e9).toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Read/Unread toggle button */}
          <Tooltip title={isRead ? 'Mark as unread' : 'Mark as read'}>
            <IconButton
              id={`toggle-read-${notification.ID}`}
              onClick={handleToggleRead}
              size="small"
              sx={{
                color: isRead ? 'text.secondary' : typeColor.text,
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: alpha(typeColor.text, 0.1),
                },
              }}
            >
              {isRead ? <ReadIcon fontSize="small" /> : <UnreadIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
