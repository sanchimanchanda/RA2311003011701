'use client';

import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/lib/logger';

const STORAGE_KEY = 'campus_notifications_read_ids';

interface UseReadStatusResult {
  
  readIds: Set<string>;
  
  isRead: (id: string) => boolean;
  
  markAsRead: (id: string) => void;
  
  markAsUnread: (id: string) => void;
  
  toggleReadStatus: (id: string) => void;
  
  markAllAsRead: (ids: string[]) => void;
  
  clearAll: () => void;
}

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
