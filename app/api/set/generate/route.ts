import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface SETRequest {
  toolType: string;
  targetEmail?: string;
  targetUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SETRequest = await request.json();
    const { toolType, targetEmail, targetUrl } = body;

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/set_toolkit.py';
          let command = '';
          
          if (toolType === 'phishing' && targetEmail) {
            command = `python3 ${scriptPath} phishing "${targetEmail}"`;
          } else if (toolType === 'harvest' && targetUrl) {
            command = `python3 ${scriptPath} harvest "${targetUrl}"`;
          } else if (toolType === 'clone' && targetUrl) {
            command = `python3 ${scriptPath} clone "${targetUrl}"`;
          } else if (toolType === 'qr' && targetUrl) {
            command = `python3 ${scriptPath} qr "${targetUrl}"`;
          } else if (toolType === 'osint' && targetEmail) {
            command = `python3 ${scriptPath} osint "${targetEmail.split('@')[0]}"`;
          }
          
          if (command) {
            const { stdout } = await execPromise(command, { timeout: 15000 });
            const result = JSON.parse(stdout);
            if (result && result.success) {
              return NextResponse.json({
                success: true,
                result: result.result,
              });
            }
          }
        } catch {
          // Fall through
        }
      }
    } catch {
      // Fall through
    }

    // Return mock data
    return NextResponse.json({
      success: true,
      mock: true,
      result: {
        type: toolType,
        output: `Mock ${toolType} output - Install Python tools for full functionality`,
        url: targetUrl || 'http://example.com',
        note: 'Python script not available. Returning mock data.',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

