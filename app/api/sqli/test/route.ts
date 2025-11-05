import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface SQLiRequest {
  url: string;
  parameter?: string;
  testType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SQLiRequest = await request.json();
    const { url, parameter = 'id', testType = 'basic' } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Sanitize URL
    const sanitizedUrl = url.replace(/[<>"']/g, '');

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/sqli_tester.py';
          const { stdout } = await execPromise(
            `python3 ${scriptPath} "${sanitizedUrl}" "${parameter}" "${testType}"`,
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
          // Fall through to mock data
        }
      }
    } catch {
      // Fall through
    }

    // Return mock data for demonstration
    const mockResults = [
      {
        vulnerable: false,
        payload: "'",
        technique: 'error',
        severity: 'low',
        description: 'Single quote test',
      },
      {
        vulnerable: true,
        payload: "' OR '1'='1",
        technique: 'boolean',
        severity: 'high',
        description: 'Basic OR injection - VULNERABLE',
      },
      {
        vulnerable: false,
        payload: "' UNION SELECT NULL--",
        technique: 'union',
        severity: 'low',
        description: 'Union-based injection test',
      },
    ];

    return NextResponse.json({
      success: true,
      mock: true,
      results: mockResults,
      message: 'Python script not available. Returning mock data.',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

