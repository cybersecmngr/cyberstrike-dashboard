import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET() {
  try {
    // Get current IP address
    const { stdout } = await execPromise('ifconfig | grep "inet " | grep -v 127.0.0.1 | awk \'{print $2}\' | head -1');
    const currentIP = stdout.trim();
    
    // Get network interfaces
    const { stdout: interfaces } = await execPromise('ifconfig | grep -E "^[a-z]" | cut -d: -f1');
    const interfaceList = interfaces.trim().split('\n').filter(Boolean);

    return NextResponse.json({
      success: true,
      currentIP: currentIP || 'Not found',
      interfaces: interfaceList,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get IP address';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ipAddress, subnetMask = '255.255.255.0', gateway, interface: networkInterface = 'en0', mode = 'static' } = body;

    if (mode === 'dhcp') {
      // Release and renew DHCP
      await execPromise(`sudo ifconfig ${networkInterface} down`);
      await execPromise(`sudo dhclient -r ${networkInterface}`);
      await execPromise(`sudo ifconfig ${networkInterface} up`);
      await execPromise(`sudo dhclient ${networkInterface}`);
      
      return NextResponse.json({
        success: true,
        message: 'IP address renewed via DHCP',
        mode: 'dhcp',
      });
    }

    if (!ipAddress || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress)) {
      return NextResponse.json(
        { error: 'Invalid IP address format' },
        { status: 400 }
      );
    }

    // Set static IP
    await execPromise(`sudo ifconfig ${networkInterface} ${ipAddress} netmask ${subnetMask}`);
    
    if (gateway) {
      await execPromise(`sudo route delete default`);
      await execPromise(`sudo route add default ${gateway}`);
    }

    return NextResponse.json({
      success: true,
      message: `IP address changed to ${ipAddress}`,
      newIP: ipAddress,
      subnetMask,
      gateway,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to change IP address';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

