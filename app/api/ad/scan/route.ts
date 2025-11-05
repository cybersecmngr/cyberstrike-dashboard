import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostname, baseDN, username, password } = body;

    if (!hostname) {
      return NextResponse.json(
        { success: false, error: 'Hostname is required' },
        { status: 400 }
      );
    }

    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/ad_scanner.py';
          let command = `python3 ${scriptPath} "${hostname}"`;
          
          if (baseDN) {
            command += ` "${baseDN}"`;
            if (username) {
              command += ` "${username}"`;
              if (password) {
                command += ` "${password}"`;
              }
            }
          }
          
          const { stdout, stderr } = await execPromise(command, { timeout: 30000 });
          
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
        hostname,
        vulnerabilities: [],
        summary: { critical: 0, high: 0, medium: 0, total: 0 },
        message: 'Python script not available. Install ldap3: pip3 install ldap3'
      }
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

