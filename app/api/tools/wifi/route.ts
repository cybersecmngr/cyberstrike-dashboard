import { NextRequest, NextResponse } from 'next/server';
import { wifiAnalyzer } from '@/lib/custom-tools/wifi-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'scan':
        const networks = await wifiAnalyzer.scanNetworks();
        return NextResponse.json({
          success: true,
          networks,
        });

      case 'handshake':
        const { interface: interfaceName, bssid, channel, duration, outputFile } = params;
        if (!interfaceName || !bssid || !channel) {
          return NextResponse.json(
            { error: 'Interface, BSSID, and channel are required' },
            { status: 400 }
          );
        }
        
        const handshake = await wifiAnalyzer.captureHandshake(
          interfaceName,
          bssid,
          channel,
          { duration, outputFile }
        );
        
        return NextResponse.json({
          success: true,
          handshake,
        });

      case 'deauth':
        const { interface: iface, targetBSSID, targetChannel, packets, duration: deauthDuration } = params;
        if (!iface || !targetBSSID || !targetChannel) {
          return NextResponse.json(
            { error: 'Interface, target BSSID, and channel are required' },
            { status: 400 }
          );
        }
        
        const deauth = await wifiAnalyzer.deauthAttack(
          iface,
          targetBSSID,
          targetChannel,
          { packets, duration: deauthDuration }
        );
        
        return NextResponse.json({
          success: true,
          deauth,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: scan, handshake, or deauth' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const networks = await wifiAnalyzer.scanNetworks();
    return NextResponse.json({
      success: true,
      networks,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

