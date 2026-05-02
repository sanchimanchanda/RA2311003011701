/**
 * All Notifications Page
 * 
 * Displays all notifications with:
 * - Pagination (limit, page)
 * - Type filtering (Event, Result, Placement)
 * - Read/unread visual distinction
 * - Mark as read/unread actions
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  alpha,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import NotificationList from '@/components/NotificationList';
import FilterBar from '@/components/FilterBar';
import PaginationControls from '@/components/PaginationControls';
import { useNotifications } from '@/hooks/useNotifications';
import { useReadStatus } from '@/hooks/useReadStatus';
import { NotificationType, Notification } from '@/lib/types';
import { filterByType, enrichNotifications } from '@/lib/priorityEngine';
import { logger } from '@/lib/logger';

export default function AllNotificationsPage() {
  const [selectedType, setSelectedType] = useState<NotificationType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch all notifications
  const { notifications, isLoading, error, refetch } = useNotifications({
    pollInterval: 30000, // Refresh every 30s
  });

  // Read status management
  const { readIds, toggleReadStatus, markAllAsRead, isRead } = useReadStatus();

  useEffect(() => {
    logger.info('page', 'All Notifications page mounted');
  }, []);

  // Filter notifications by type
  const filteredNotifications = useMemo(() => {
    return filterByType(notifications, selectedType);
  }, [notifications, selectedType]);

  // Paginate
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  // Count unread
  const unreadCount = useMemo(() => {
    return filteredNotifications.filter((n) => !readIds.has(n.ID)).length;
  }, [filteredNotifications, readIds]);

  // Handle filter change — reset to page 1
  const handleTypeChange = (type: NotificationType | null) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  // Handle mark all as read
  const handleMarkAllRead = () => {
    const ids = filteredNotifications.map((n) => n.ID);
    markAllAsRead(ids);
    setSnackbarMessage(`Marked ${ids.length} notifications as read`);
    setSnackbarOpen(true);
    logger.info('page', `Marked all ${ids.length} filtered notifications as read`);
  };

  // Handle refresh
  const handleRefresh = async () => {
    logger.info('page', 'Manual refresh triggered');
    await refetch();
    setSnackbarMessage('Notifications refreshed');
    setSnackbarOpen(true);
  };

  return (
    <Box>
      {/* Page header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <NotificationsIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
              All Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Stay updated with campus events, results, and placements
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            id="btn-refresh"
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              id="btn-mark-all-read"
              variant="outlined"
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllRead}
              color="secondary"
            >
              Mark All Read
            </Button>
          )}
        </Box>
      </Box>

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter bar */}
      <Box sx={{ mb: 3 }}>
        <FilterBar
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
        />
      </Box>

      {/* Notification list */}
      <NotificationList
        notifications={paginatedNotifications}
        isLoading={isLoading}
        readIds={readIds}
        onToggleRead={toggleReadStatus}
        emptyMessage={
          selectedType
            ? `No ${selectedType} notifications found`
            : 'No notifications found'
        }
      />

      {/* Pagination */}
      {filteredNotifications.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalItems={filteredNotifications.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
