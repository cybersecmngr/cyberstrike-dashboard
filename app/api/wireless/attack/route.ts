import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attackType, interface: networkInterface, targetBSSID } = body;

    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/wireless_attacks.py';
          let command = '';
          if (attackType === 'handshake') {
            command = `python3 ${scriptPath} handshake ${networkInterface} "${targetBSSID}"`;
          } else if (attackType === 'wps') {
            command = `python3 ${scriptPath} wps ${networkInterface} "${targetBSSID}"`;
          } else if (attackType === 'deauth') {
            command = `python3 ${scriptPath} deauth ${networkInterface} "${targetBSSID}" 10`;
          }
          
          if (command) {
            try {
              const { stdout, stderr } = await execPromise(command, { timeout: 30000 });
              
              if (stderr) {
                console.error('Python script stderr:', stderr);
              }
              
              const result = JSON.parse(stdout);
              if (result) {
                // Return both success and failure cases with proper messages
                return NextResponse.json({
                  success: result.success || false,
                  message: result.result?.message || result.message || `Attack ${result.success ? 'initiated' : 'failed'}: ${attackType} on ${targetBSSID}`,
                  note: result.result?.note || result.note || (result.success ? undefined : 'Install aircrack-ng suite for real attacks'),
                  mock: !result.success
                });
              }
            } catch (parseError) {
              console.error('Failed to parse Python script output:', parseError);
              // Fall through to mock data
            }
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
      message: `Attack simulated: ${attackType} on ${targetBSSID}`,
      note: 'Install aircrack-ng suite for real attacks',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

