import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target, reconType } = body;

    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/advanced_recon.py';
          const { stdout } = await execPromise(
            `python3 ${scriptPath} ${reconType} "${target}"`,
            { timeout: 30000 }
          );
          const result = JSON.parse(stdout);
          if (result && result.success) {
            return NextResponse.json(result);
          }
        } catch {
          // Fall through
        }
      }
    } catch {
      // Fall through
    }

    return NextResponse.json({
      success: true,
      mock: true,
      result: { note: `Reconnaissance ${reconType} simulated for ${target}` },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

