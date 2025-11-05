import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUrl, payload } = body;

    if (!targetUrl || !payload) {
      return NextResponse.json(
        { success: false, error: 'Target URL and payload are required' },
        { status: 400 }
      );
    }

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/waf_bypass.py';
          const { stdout, stderr } = await execPromise(
            `python3 ${scriptPath} "${targetUrl}" "${payload.replace(/"/g, '\\"')}"`,
            { timeout: 30000 }
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

    // Fallback to basic obfuscation
    const bypassMethods = [
      'URL encoding',
      'Unicode encoding',
      'Case variation',
      'Whitespace manipulation',
      'Comment insertion',
      'Function name obfuscation',
    ];

    const obfuscatedPayload = payload
      .replace(/SELECT/gi, 'SeLeCt')
      .replace(/FROM/gi, 'FrOm')
      .replace(/ /g, '/**/')
      .replace(/'/g, "\\'");

    return NextResponse.json({
      success: true,
      mock: true,
      result: {
        wafDetected: false,
        bypassMethods,
        obfuscatedPayload,
        note: 'Python script not available. Returning basic obfuscation. Install requests library: pip3 install requests',
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

