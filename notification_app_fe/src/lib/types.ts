export type NotificationType = 'Event' | 'Result' | 'Placement';

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface EnrichedNotification extends Notification {
  priorityScore: number;
  isRead: boolean;
}

export const TYPE_WEIGHTS: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
} as const;

export interface NotificationQueryParams {
  limit?: number;
  page?: number;
  notification_type?: NotificationType;
}

export interface AuthCredentials {
  clientId: string;
  clientSecret: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}
