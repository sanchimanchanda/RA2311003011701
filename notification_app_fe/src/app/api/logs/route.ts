/**
 * API Route: POST /api/logs
 * 
 * Server-side proxy to the evaluation service logs endpoint.
 * Authenticates server-side so the client logger never needs a token.
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://20.207.122.201/evaluation-service';

/** Registered credentials for server-side auth */
const CREDENTIALS = {
  email: 'sm8280@srmist.edu.in',
  name: 'sanchi manchanda',
  rollNo: 'sm8280',
  accessCode: 'QkbpxH',
  clientID: '7056c295-e5dd-4d3b-b330-c0682c63b5a3',
  clientSecret: 'KCJnaHkvEhPBhrnD',
};

/** Cached server-side token */
let serverToken: string | null = null;
let serverTokenExpiresAt: number = 0;

/**
 * Get a valid auth token server-side.
 */
async function getServerToken(): Promise<string> {
  // Return cached if still valid (60s buffer)
  if (serverToken && Date.now() < (serverTokenExpiresAt * 1000) - 60000) {
    return serverToken;
  }

  const response = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS),
  });

  if (!response.ok) {
    throw new Error(`Server auth failed: ${response.status}`);
  }

  const data = await response.json();
  serverToken = data.access_token;
  serverTokenExpiresAt = data.expires_in;
  return serverToken!;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Authenticate server-side — client doesn't need a token for logs
    const token = await getServerToken();

    const response = await fetch(`${BASE_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { status: 'ok' };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send log', details: String(error) },
      { status: 500 }
    );
  }
}
