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
  
  limit?: number;
  
  page?: number;
  
  type?: NotificationType | null;
  
  pollInterval?: number;
}

interface UseNotificationsResult {
  
  notifications: Notification[];
  
  isLoading: boolean;
  
  error: string | null;
  
  refetch: () => Promise<void>;
  
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
