import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/sarvam';


export async function GET() {
  try {
    const data = await testConnection();
    return NextResponse.json(
      {
        status: 'ok',
        model: data?.model || 'sarvam-105b-conversations',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Connection failed' },
      { status: 500 }
    );
  }
}
