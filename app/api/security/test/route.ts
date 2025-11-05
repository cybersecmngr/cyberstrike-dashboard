import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface APITestRequest {
  baseUrl: string;
  endpoints?: string;
  testType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: APITestRequest = await request.json();
    const { baseUrl, endpoints = '', testType = 'authentication' } = body;

    if (!baseUrl) {
      return NextResponse.json(
        { success: false, error: 'Base URL is required' },
        { status: 400 }
      );
    }

    const sanitizedUrl = baseUrl.replace(/[<>"']/g, '');
    const endpointList = endpoints.split('\n').filter(e => e.trim()).map(e => e.trim());

    // Try Python script if available
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/api_security_tester.py';
          const endpointsArg = endpointList.length > 0 ? endpointList.join(',') : '';
          const { stdout } = await execPromise(
            `python3 ${scriptPath} "${sanitizedUrl}" "${endpointsArg}" "${testType}"`,
            { timeout: 30000 }
          );
          
          const result = JSON.parse(stdout);
          if (result && result.success) {
            return NextResponse.json({
              success: true,
              results: result.results,
            });
          }
        } catch {
          // Fall through
        }
      }
    } catch {
      // Fall through
    }

    // Return mock results for demonstration
    const results = endpointList.length > 0 
      ? endpointList.map(endpoint => ({
          endpoint,
          method: 'GET',
          status: 200,
          vulnerable: Math.random() > 0.7,
          issue: Math.random() > 0.7 ? 'Missing authentication' : undefined,
          severity: (['critical', 'high', 'medium', 'low'] as const)[Math.floor(Math.random() * 4)],
        }))
      : [
          {
            endpoint: '/api/users',
            method: 'GET',
            status: 200,
            vulnerable: true,
            issue: 'Missing authentication',
            severity: 'high' as const,
          },
          {
            endpoint: '/api/admin',
            method: 'GET',
            status: 403,
            vulnerable: false,
            severity: 'low' as const,
          },
          {
            endpoint: '/api/data',
            method: 'POST',
            status: 200,
            vulnerable: true,
            issue: 'No rate limiting',
            severity: 'medium' as const,
          },
        ];

    return NextResponse.json({
      success: true,
      mock: true,
      results,
      message: 'Returning mock API test results.',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

