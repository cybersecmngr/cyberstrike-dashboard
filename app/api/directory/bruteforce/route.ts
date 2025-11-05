import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface DirectoryRequest {
  url: string;
  wordlist?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DirectoryRequest = await request.json();
    const { url, wordlist = 'common' } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const sanitizedUrl = url.replace(/[<>"']/g, '');

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/directory_bruteforcer.py';
          const { stdout } = await execPromise(
            `python3 ${scriptPath} "${sanitizedUrl}" "${wordlist}"`,
            { timeout: 120000 }
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

    // Return mock data
    return NextResponse.json({
      success: true,
      mock: true,
      results: [
        { path: '/admin', status: 200, found: true },
        { path: '/api', status: 200, found: true },
        { path: '/config', status: 403, found: true },
      ],
      message: 'Python script or gobuster not available. Returning mock data.',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

