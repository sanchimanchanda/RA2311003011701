/**
 * useReadStatus Hook
 * 
 * Manages read/unread state for notifications using localStorage.
 * Provides methods to mark notifications as read/unread and check status.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/lib/logger';

const STORAGE_KEY = 'campus_notifications_read_ids';

interface UseReadStatusResult {
  /** Set of notification IDs that have been read */
  readIds: Set<string>;
  /** Check if a notification has been read */
  isRead: (id: string) => boolean;
  /** Mark a notification as read */
  markAsRead: (id: string) => void;
  /** Mark a notification as unread */
  markAsUnread: (id: string) => void;
  /** Toggle read/unread status */
  toggleReadStatus: (id: string) => void;
  /** Mark all provided IDs as read */
  markAllAsRead: (ids: string[]) => void;
  /** Clear all read status */
  clearAll: () => void;
}

/**
 * Load read IDs from localStorage.
 */
function loadReadIds(): Set<string> {
  try {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

/**
 * Save read IDs to localStorage.
 */
function saveReadIds(ids: Set<string>): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Storage quota exceeded or unavailable
  }
}

export function useReadStatus(): UseReadStatusResult {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadReadIds();
    setReadIds(loaded);
    logger.debug('hook', `Loaded ${loaded.size} read notification IDs from storage`);
  }, []);

  const isRead = useCallback(
    (id: string): boolean => readIds.has(id),
    [readIds]
  );

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      logger.info('hook', `Marked notification ${id} as read`);
      return next;
    });
  }, []);

  const markAsUnread = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveReadIds(next);
      logger.info('hook', `Marked notification ${id} as unread`);
      return next;
    });
  }, []);

  const toggleReadStatus = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback((ids: string[]) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      saveReadIds(next);
      logger.info('hook', `Marked ${ids.length} notifications as read`);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setReadIds(new Set());
    saveReadIds(new Set());
    logger.info('hook', 'Cleared all read statuses');
  }, []);

  return {
    readIds,
    isRead,
    markAsRead,
    markAsUnread,
    toggleReadStatus,
    markAllAsRead,
    clearAll,
  };
}
