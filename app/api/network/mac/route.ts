import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET() {
  try {
    // Get current MAC address
    const { stdout } = await execPromise('ifconfig | grep -o -E "([[:xdigit:]]{1,2}:){5}[[:xdigit:]]{1,2}" | head -1');
    const currentMac = stdout.trim();
    
    // Get network interfaces
    const { stdout: interfaces } = await execPromise('ifconfig | grep -E "^[a-z]" | cut -d: -f1');
    const interfaceList = interfaces.trim().split('\n').filter(Boolean);

    return NextResponse.json({
      success: true,
      currentMac: currentMac || 'Not found',
      interfaces: interfaceList,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get MAC address';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { macAddress, interface: networkInterface = 'en0' } = body;

    if (!macAddress || !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macAddress)) {
      return NextResponse.json(
        { error: 'Invalid MAC address format' },
        { status: 400 }
      );
    }

    // Disable interface
    await execPromise(`sudo ifconfig ${networkInterface} down`);
    
    // Change MAC address
    await execPromise(`sudo ifconfig ${networkInterface} ether ${macAddress}`);
    
    // Enable interface
    await execPromise(`sudo ifconfig ${networkInterface} up`);

    return NextResponse.json({
      success: true,
      message: `MAC address changed to ${macAddress}`,
      newMac: macAddress,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to change MAC address';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

