import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface KeyRequest {
  action: 'generate' | 'analyze' | 'certificate';
  keyType?: string;
  bits?: number;
  keyPath?: string;
  commonName?: string;
  days?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: KeyRequest = await request.json();
    const { action, keyType = 'rsa', bits = 2048, keyPath, commonName, days = 365 } = body;

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/key_manager.py';
          let command = '';
          
          if (action === 'generate') {
            command = `python3 ${scriptPath} generate ${keyType} ${bits}`;
          } else if (action === 'analyze' && keyPath) {
            command = `python3 ${scriptPath} analyze "${keyPath}"`;
          } else if (action === 'certificate' && commonName) {
            command = `python3 ${scriptPath} certificate "${commonName}" ${days}`;
          }
          
          if (command) {
            const { stdout } = await execPromise(command, { timeout: 10000 });
            const result = JSON.parse(stdout);
            if (result && result.success) {
              return NextResponse.json({
                success: true,
                ...result,
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
    if (action === 'generate') {
      return NextResponse.json({
        success: true,
        mock: true,
        private_key: '-----BEGIN PRIVATE KEY-----\nMOCK_KEY\n-----END PRIVATE KEY-----',
        public_key: f'ssh-rsa AAAAB3... mock-public-key-{keyType}',
        key_type: keyType,
        bits,
        message: 'Python script not available. Returning mock data.',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Action not supported',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

