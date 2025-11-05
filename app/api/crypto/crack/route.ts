import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hashValue, method = 'dictionary' } = body;

    if (!hashValue) {
      return NextResponse.json(
        { success: false, error: 'Hash value is required' },
        { status: 400 }
      );
    }

    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/advanced_crypto_breaker.py';
          const { stdout, stderr } = await execPromise(
            `python3 ${scriptPath} "${hashValue}" "${method}"`,
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
        }
      }
    } catch (error) {
      console.error('Python check error:', error);
    }

    return NextResponse.json({
      success: true,
      mock: true,
      result: {
        hash_value: hashValue,
        method,
        summary: { cracked: false, attempts: 0 },
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

