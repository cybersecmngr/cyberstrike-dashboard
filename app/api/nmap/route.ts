import { NextRequest, NextResponse } from 'next/server';
import { executeCommand, sanitizeInput, isValidIP, isToolInstalled } from '@/lib/api-utils';

interface NmapRequest {
  target: string;
  ports?: string;
  scanType?: 'syn' | 'tcp' | 'udp' | 'ack' | 'fin' | 'xmas' | 'null';
  options?: string[];
  timeout?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: NmapRequest = await request.json();
    const { target, ports = '1-1000', scanType = 'syn', options = [], timeout = 30000 } = body;

    // Validation
    if (!target) {
      return NextResponse.json(
        { error: 'Target is required' },
        { status: 400 }
      );
    }

    // Sanitize target
    const sanitizedTarget = sanitizeInput(target);
    
    // Validate IP or hostname
    if (!isValidIP(sanitizedTarget) && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitizedTarget)) {
      return NextResponse.json(
        { error: 'Invalid target IP or hostname' },
        { status: 400 }
      );
    }

    // Check if nmap is installed
    const nmapInstalled = await isToolInstalled('nmap');
    if (!nmapInstalled) {
      // Return mock data for development
      return NextResponse.json({
        success: true,
        mock: true,
        target: sanitizedTarget,
        scanType,
        results: {
          host: sanitizedTarget,
          status: 'up',
          ports: [
            { port: 22, state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
            { port: 80, state: 'open', service: 'http', version: 'Apache 2.4.41' },
            { port: 443, state: 'open', service: 'https', version: 'Apache 2.4.41' },
            { port: 3306, state: 'open', service: 'mysql', version: 'MySQL 8.0' },
          ],
          scanTime: new Date().toISOString(),
        },
        message: 'Nmap is not installed. Returning mock data.',
      });
    }

    // Build nmap command
    let command = 'nmap';
    
    // Add scan type
    const scanFlags: Record<string, string> = {
      syn: '-sS',
      tcp: '-sT',
      udp: '-sU',
      ack: '-sA',
      fin: '-sF',
      xmas: '-sX',
      null: '-sN',
    };
    
    command += ` ${scanFlags[scanType] || '-sS'}`;
    
    // Add ports
    if (ports) {
      const sanitizedPorts = sanitizeInput(ports);
      command += ` -p ${sanitizedPorts}`;
    }
    
    // Add options
    command += ' -sV -sC'; // Version detection and default scripts
    
    // Add custom options
    options.forEach((opt) => {
      const sanitizedOpt = sanitizeInput(opt);
      command += ` ${sanitizedOpt}`;
    });
    
    // Add target
    command += ` ${sanitizedTarget}`;

    // Execute nmap
    const result = await executeCommand(command, { timeout });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Nmap execution failed',
          stderr: result.stderr,
        },
        { status: 500 }
      );
    }

    // Parse nmap output (simplified)
    const output = result.stdout;
    const parsedPorts: Array<{
      port: number;
      state: string;
      service: string;
      version?: string;
    }> = [];

    // Extract port information
    const portRegex = /(\d+)\/(tcp|udp)\s+(\w+)\s+(.+)/g;
    let match;
    while ((match = portRegex.exec(output)) !== null) {
      parsedPorts.push({
        port: parseInt(match[1]),
        state: match[3],
        service: match[4].split(' ')[0],
        version: match[4].substring(match[4].indexOf(' ') + 1) || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      target: sanitizedTarget,
      scanType,
      results: {
        host: sanitizedTarget,
        status: output.includes('Host is up') ? 'up' : 'down',
        ports: parsedPorts,
        rawOutput: output,
        scanTime: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint for quick scan
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const target = searchParams.get('target');
  const ports = searchParams.get('ports') || '1-1000';

  if (!target) {
    return NextResponse.json(
      { error: 'Target parameter is required' },
      { status: 400 }
    );
  }

  // Use POST handler logic
  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ target, ports }),
    })
  );
}

