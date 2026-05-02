/**
 * API Route: POST /api/register
 * 
 * Server-side proxy to the evaluation service registration endpoint.
 * Bypasses CORS by making the request from the server.
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://20.207.122.201/evaluation-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed', details: String(error) },
      { status: 500 }
    );
  }
}
