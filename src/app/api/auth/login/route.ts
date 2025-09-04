import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login attempt for:', email);
    console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/login`);
    
    // Call your actual backend API (based on your React Native code)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email, // Your API uses "email" not "identifier"
        password: password 
      }),
    });
    
    const responseData = await response.json();
    console.log('Backend response:', { status: response.status, data: responseData });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.message || 'Invalid credentials' },
        { status: response.status }
      );
    }
    
    // Your API returns { token, user } structure
    return NextResponse.json({
      token: responseData.token,
      user: responseData.user
    });
    
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}