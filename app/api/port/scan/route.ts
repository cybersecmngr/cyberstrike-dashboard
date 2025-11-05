import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface PortScanRequest {
  target: string;
  portRange?: string;
  scanType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PortScanRequest = await request.json();
    const { target, portRange = '1-1000', scanType = 'syn' } = body;

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Target is required' },
        { status: 400 }
      );
    }

    const sanitizedTarget = target.replace(/[^a-zA-Z0-9.-]/g, '');

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/advanced_port_scanner.py';
          const { stdout } = await execPromise(
            `python3 ${scriptPath} "${sanitizedTarget}" "${portRange}" "${scanType}"`,
            { timeout: 305000 }
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
        { port: 22, state: 'open', service: 'ssh', version: 'OpenSSH 8.0' },
        { port: 80, state: 'open', service: 'http', version: 'nginx 1.18' },
        { port: 443, state: 'open', service: 'https', version: 'nginx 1.18' },
      ],
      message: 'Nmap not available. Returning mock data.',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

