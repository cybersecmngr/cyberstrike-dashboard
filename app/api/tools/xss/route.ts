import { NextRequest, NextResponse } from 'next/server';
import { xssScanner } from '@/lib/custom-tools/xss-scanner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, parameters, type = 'all' } = body;

    if (!url || !parameters || !Array.isArray(parameters)) {
      return NextResponse.json(
        { error: 'URL and parameters array are required' },
        { status: 400 }
      );
    }

    const result = await xssScanner.testXSS(url, parameters, { type });
    
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as 'reflected' | 'stored' | 'dom' | undefined;

  const payloads = xssScanner.generatePayloads(type);
  
  return NextResponse.json({
    success: true,
    payloads,
  });
}

