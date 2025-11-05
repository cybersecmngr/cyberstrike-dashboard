import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, scanTypes } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/web_app_scanner.py';
          const scanTypesStr = Array.isArray(scanTypes) ? scanTypes.join(',') : scanTypes || 'sqli,xss';
          
          const { stdout, stderr } = await execPromise(
            `python3 ${scriptPath} "${url}" "${scanTypesStr}"`,
            { timeout: 60000 }
          );
          
          if (stderr) {
            console.error('Python script stderr:', stderr);
          }
          
          const result = JSON.parse(stdout);
          if (result && result.success) {
            return NextResponse.json({
              success: true,
              result: result.result,
              mock: false
            });
          }
        } catch (error) {
          console.error('Python script execution error:', error);
          // Fall through to mock data
        }
      }
    } catch (error) {
      console.error('Python check error:', error);
      // Fall through to mock data
    }

    // Fallback to mock data
    return NextResponse.json({
      success: true,
      mock: true,
      result: {
        url,
        vulnerabilities: [
          {
            vulnerability: 'SQL Injection',
            severity: 'high',
            parameter: 'id',
            payload: "' OR '1'='1",
            statusCode: 200,
            evidence: 'Mock vulnerability detection'
          }
        ],
        summary: {
          critical: 0,
          high: 1,
          medium: 0,
          low: 0,
          total: 1
        },
        message: 'Python script not available. Returning mock data.',
        note: 'Install requests library: pip3 install requests'
      }
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

