/**
 * Authentication Manager
 * 
 * Handles the complete auth flow:
 * 1. Register → get clientID + clientSecret (one-time, already done)
 * 2. Authenticate → get access_token
 * 3. Auto-refresh on token expiry
 * 
 * IMPORTANT: Field names are case-sensitive:
 * - clientID (NOT clientId)
 * - clientSecret (NOT client_secret)
 */

import { logger } from './logger';

const BASE_URL = '/api';

/** Registered credentials (one-time registration already completed) */
const REGISTERED_CREDENTIALS = {
  email: 'sm8280@srmist.edu.in',
  name: 'sanchi manchanda',
  rollNo: 'sm8280',
  accessCode: 'QkbpxH',
  clientID: '7056c295-e5dd-4d3b-b330-c0682c63b5a3',
  clientSecret: 'KCJnaHkvEhPBhrnD',
};

interface AuthResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

/** Singleton state for token */
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Authenticate with the evaluation service.
 * Uses the pre-registered client credentials.
 * Returns an access token.
 */
export async function authenticate(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < (tokenExpiresAt * 1000) - 60000) {
    return cachedToken;
  }

  logger.info('auth', 'Requesting new access token...');

  const response = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(REGISTERED_CREDENTIALS),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.message || `${response.status} ${response.statusText}`;
    logger.error('auth', `Authentication failed: ${errorMsg}`);
    throw new Error(`Authentication failed: ${errorMsg}`);
  }

  const data: AuthResponse = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = data.expires_in; // Unix timestamp in seconds

  logger.info('auth', 'Authentication successful, token acquired');
  return cachedToken;
}

/**
 * Get the current access token, authenticating if necessary.
 */
export async function getToken(): Promise<string> {
  return authenticate();
}

/**
 * Force token refresh (e.g., after a 401 response).
 */
export function invalidateToken(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}
