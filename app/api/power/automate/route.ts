import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface AutomationRequest {
  target: string;
  tool?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AutomationRequest = await request.json();
    const { target, tool = 'exploit-chain' } = body;

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
          const scriptPath = process.cwd() + '/scripts/power_tools_automation.py';
          const { stdout } = await execPromise(
            `python3 ${scriptPath} "${sanitizedTarget}"`,
            { timeout: 60000 }
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
        reconnaissance: {
          open_ports: [22, 80, 443],
          web_server: 'nginx/1.18',
          technologies: ['React', 'Node.js'],
        },
        vulnerabilities: [
          {
            url: `http://${sanitizedTarget}/admin`,
            severity: 'high',
            issue: 'Exposed sensitive directory',
            status: 200,
          },
        ],
        exploits: [
          {
            vulnerability: 'Exposed sensitive directory',
            status: 'simulated',
            message: 'Exploit attempt simulated',
          },
        ],
        post_exploitation: [],
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

