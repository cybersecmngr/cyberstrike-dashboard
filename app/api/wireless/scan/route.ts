import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interface: networkInterface } = body;

    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/wireless_attacks.py';
          const interfaceName = networkInterface || 'wlan0';
          const { stdout, stderr } = await execPromise(
            `python3 ${scriptPath} scan ${interfaceName}`,
            { timeout: 15000 }
          );
          
          if (stderr) {
            console.error('Python script stderr:', stderr);
          }
          
          const result = JSON.parse(stdout) as { success: boolean; networks?: Array<{ method?: string }> };
          if (result && result.success) {
            // Check if result contains mock data
            const isMock = result.networks?.some((n) => n.method === 'mock') || false;
            const isCoreWLAN = result.networks?.some((n) => n.method === 'CoreWLAN') || false;
            
            return NextResponse.json({
              ...result,
              mock: isMock,
              note: isMock 
                ? 'WiFi scanning tools not available or require permissions. On macOS: System Settings > Privacy & Security > Location Services. Or install NetworkManager on Linux.' 
                : isCoreWLAN
                ? 'Real WiFi networks detected via macOS CoreWLAN. Some SSIDs may be hidden for privacy.'
                : undefined,
              method: result.networks?.[0]?.method || 'unknown'
            });
          }
        } catch (error) {
          console.error('Python script execution error:', error);
          // Fall through to mock data
        }
      }
    } catch (error) {
      console.error('Python check error:', error);
      // Fall through to mock data
    }

    return NextResponse.json({
      success: true,
      mock: true,
      networks: [
        { ssid: 'Test-Network', bssid: 'AA:BB:CC:DD:EE:FF', channel: 6, signal: -45, encryption: 'WPA2' },
      ],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

