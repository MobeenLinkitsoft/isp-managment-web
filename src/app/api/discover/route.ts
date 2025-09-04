import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test different common Strapi endpoints
    const endpoints = [
      '/auth/local',
      '/auth/local/register',
      '/users',
      '/users-permissions/roles',
      '/content-type-builder/content-types',
      '/upload'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        results.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
        });
      } catch (error) {
        results.push({
          endpoint,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      results
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      apiUrl: process.env.NEXT_PUBLIC_API_URL
    }, { status: 500 });
  }
}