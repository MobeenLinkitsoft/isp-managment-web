import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@example.com',
        password: 'testpassword'
      }),
    });
    
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      apiUrl: process.env.NEXT_PUBLIC_API_URL
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      apiUrl: process.env.NEXT_PUBLIC_API_URL
    }, { status: 500 });
  }
}