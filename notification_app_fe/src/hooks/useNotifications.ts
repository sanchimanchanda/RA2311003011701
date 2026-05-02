/**
 * useNotifications Hook
 * 
 * Fetches notifications from the API with support for:
 * - Pagination (limit, page)
 * - Type filtering
 * - Auto-refresh polling
 * - Loading and error states
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNotifications } from '@/lib/api';
import {
  Notification,
  NotificationType,
  NotificationQueryParams,
} from '@/lib/types';
import { logger } from '@/lib/logger';

interface UseNotificationsOptions {
  /** Number of notifications per page */
  limit?: number;
  /** Current page number (1-indexed) */
  page?: number;
  /** Filter by notification type */
  type?: NotificationType | null;
  /** Auto-refresh interval in ms (0 to disable) */
  pollInterval?: number;
}

interface UseNotificationsResult {
  /** Array of notifications */
  notifications: Notification[];
  /** Whether the initial fetch is loading */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refetch notifications manually */
  refetch: () => Promise<void>;
  /** Total count of fetched notifications */
  totalCount: number;
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsResult {
  const { limit = 10, page = 1, type = null, pollInterval = 0 } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      logger.debug('hook', `Fetching notifications: page=${page}, limit=${limit}, type=${type}`);

      const params: NotificationQueryParams = { limit, page };
      if (type) params.notification_type = type;

      const data = await fetchNotifications(params);

      if (mountedRef.current) {
        setNotifications(data);
        setTotalCount(data.length);
        setError(null);
        logger.info('hook', `Loaded ${data.length} notifications`);
      }
    } catch (err) {
      if (mountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
        setError(message);
        logger.error('hook', `useNotifications error: ${message}`);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [limit, page, type]);

  // Initial fetch and dependency changes
  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  // Polling
  useEffect(() => {
    if (pollInterval <= 0) return;

    const intervalId = setInterval(fetchData, pollInterval);
    logger.debug('hook', `Polling enabled every ${pollInterval}ms`);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData, pollInterval]);

  return {
    notifications,
    isLoading,
    error,
    refetch: fetchData,
    totalCount,
  };
}
