/**
 * API Route: GET /api/notifications
 * 
 * Server-side proxy to the evaluation service notifications endpoint.
 * Forwards query params and auth header.
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://20.207.122.201/evaluation-service';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const { searchParams } = new URL(request.url);

    // Build target URL with query params
    const targetUrl = new URL(`${BASE_URL}/notifications`);
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: String(error) },
      { status: 500 }
    );
  }
}
