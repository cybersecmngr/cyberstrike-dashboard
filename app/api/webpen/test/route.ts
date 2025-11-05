import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUrl, scanDepth = 'medium' } = body;

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: 'Target URL is required' },
        { status: 400 }
      );
    }

    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/web_pen_framework.py';
          const { stdout, stderr } = await execPromise(
            `python3 ${scriptPath} "${targetUrl}" "${scanDepth}"`,
            { timeout: 120000 }
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
        }
      }
    } catch (error) {
      console.error('Python check error:', error);
    }

    return NextResponse.json({
      success: true,
      mock: true,
      result: {
        target: targetUrl,
        endpoints_discovered: [],
        vulnerabilities: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
        message: 'Python script not available. Returning mock data.'
      }
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

