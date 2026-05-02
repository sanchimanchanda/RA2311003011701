/**
 * API Client
 * 
 * Centralized HTTP client for the evaluation service.
 * Handles auth headers, query params, and 401 retry logic.
 */

import { getToken, invalidateToken } from './auth';
import { Notification, NotificationsResponse, NotificationQueryParams } from './types';
import { logger } from './logger';

const BASE_URL = '/api';

/**
 * Make an authenticated GET request to the evaluation service.
 * Automatically retries once on 401 (after refreshing the token).
 */
async function authenticatedGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const token = await getToken();
  
  // Build URL with query params (relative path)
  let urlStr = `${BASE_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) urlStr += `?${qs}`;
  }

  logger.info('api', `GET ${urlStr}`);

  let response = await fetch(urlStr, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  // Retry on 401
  if (response.status === 401) {
    logger.warn('api', 'Received 401, refreshing token and retrying...');
    invalidateToken();
    const newToken = await getToken();
    response = await fetch(urlStr, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
      },
    });
  }

  if (!response.ok) {
    const errorMsg = `API request failed: ${response.status} ${response.statusText}`;
    logger.error('api', errorMsg);
    throw new Error(errorMsg);
  }

  const data = await response.json();
  logger.debug('api', `Response received for ${path}`);
  return data as T;
}

/**
 * Fetch notifications from the evaluation service.
 * Supports pagination and type filtering via query params.
 * 
 * @param params - Optional query parameters (limit, page, notification_type)
 * @returns Array of notifications
 */
export async function fetchNotifications(
  params?: NotificationQueryParams
): Promise<Notification[]> {
  try {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.page) queryParams.page = params.page;
    if (params?.notification_type) queryParams.notification_type = params.notification_type;

    const data = await authenticatedGet<NotificationsResponse>(
      '/notifications',
      queryParams
    );

    logger.info('api', `Fetched ${data.notifications?.length ?? 0} notifications`);
    return data.notifications || [];
  } catch (error) {
    logger.error('api', `Failed to fetch notifications: ${error instanceof Error ? error.message : String(error)}
`);
    throw error;
  }
}
