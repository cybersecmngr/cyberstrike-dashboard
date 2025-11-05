import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface ShieldRequest {
  target: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ShieldRequest = await request.json();
    const { target } = body;

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
          const scriptPath = process.cwd() + '/scripts/security_shield.py';
          const { stdout } = await execPromise(
            `python3 ${scriptPath} "${sanitizedTarget}"`,
            { timeout: 30000 }
          );
          
          const result = JSON.parse(stdout);
          if (result && result.success) {
            return NextResponse.json({
              success: true,
              result: result.result,
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
      result: {
        target: sanitizedTarget,
        port_scan: [
          { port: 22, state: 'open', service: 'SSH' },
          { port: 80, state: 'open', service: 'HTTP' },
          { port: 443, state: 'open', service: 'HTTPS' },
        ],
        vulnerabilities: [
          { severity: 'high', issue: 'Outdated TLS version' },
        ],
        security_headers: [
          { missing: 'X-Frame-Options', description: 'Clickjacking protection', severity: 'medium' },
        ],
        recommendations: [
          'Update TLS configuration',
          'Implement security headers',
        ],
      },
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

