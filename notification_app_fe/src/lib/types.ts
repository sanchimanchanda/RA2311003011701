/**
 * Notification Type Definitions
 */

/** Notification types from the API */
export type NotificationType = 'Event' | 'Result' | 'Placement';

/** Raw notification from the API */
export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

/** API response shape for GET /notifications */
export interface NotificationsResponse {
  notifications: Notification[];
}

/** Notification enriched with computed fields */
export interface EnrichedNotification extends Notification {
  priorityScore: number;
  isRead: boolean;
}

/** Type weight map for priority calculation */
export const TYPE_WEIGHTS: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
} as const;

/** Query parameters for the notifications API */
export interface NotificationQueryParams {
  limit?: number;
  page?: number;
  notification_type?: NotificationType;
}

/** Auth credentials from registration */
export interface AuthCredentials {
  clientId: string;
  clientSecret: string;
}

/** Auth token response */
export interface AuthTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}
