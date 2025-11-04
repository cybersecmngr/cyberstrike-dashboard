import { NextRequest, NextResponse } from 'next/server';
import { executeCommand, sanitizeInput, isValidURL, isToolInstalled } from '@/lib/api-utils';

interface NiktoRequest {
  target: string;
  options?: string[];
  timeout?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: NiktoRequest = await request.json();
    const { target, options = [], timeout = 60000 } = body;

    // Validation
    if (!target) {
      return NextResponse.json(
        { error: 'Target URL is required' },
        { status: 400 }
      );
    }

    // Sanitize and validate URL
    let targetUrl = target.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `http://${targetUrl}`;
    }

    if (!isValidURL(targetUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if nikto is installed
    const niktoInstalled = await isToolInstalled('nikto');
    if (!niktoInstalled) {
      // Return mock data for development
      return NextResponse.json({
        success: true,
        mock: true,
        target: targetUrl,
        results: {
          vulnerabilities: [
            {
              id: 'NIKTO-001',
              severity: 'Low',
              description: 'Apache/2.4.41 appears to be outdated',
              cve: 'CVE-2020-11984',
            },
            {
              id: 'NIKTO-002',
              severity: 'Medium',
              description: 'OSVDB-3233: /admin/ directory found',
              cve: null,
            },
            {
              id: 'NIKTO-003',
              severity: 'High',
              description: 'OSVDB-3092: /config.php may allow remote access',
              cve: 'CVE-2019-17566',
            },
          ],
          scanTime: new Date().toISOString(),
        },
        message: 'Nikto is not installed. Returning mock data.',
      });
    }

    // Build nikto command
    let command = 'nikto';
    command += ` -h ${sanitizeInput(targetUrl)}`;
    command += ' -Format txt';
    
    // Add custom options
    options.forEach((opt) => {
      const sanitizedOpt = sanitizeInput(opt);
      command += ` ${sanitizedOpt}`;
    });

    // Execute nikto
    const result = await executeCommand(command, { timeout });

    if (!result.success && result.exitCode !== 0) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Nikto execution failed',
          stderr: result.stderr,
        },
        { status: 500 }
      );
    }

    // Parse nikto output
    const output = result.stdout;
    const vulnerabilities: Array<{
      id: string;
      severity: string;
      description: string;
      cve?: string | null;
    }> = [];

    // Extract vulnerability information
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('OSVDB') || line.includes('+')) {
        const severityMatch = line.match(/(Low|Medium|High|Critical)/i);
        const cveMatch = line.match(/CVE-\d{4}-\d+/);
        const osvdbMatch = line.match(/OSVDB-\d+/);

        if (severityMatch || osvdbMatch) {
          vulnerabilities.push({
            id: osvdbMatch ? osvdbMatch[0] : `NIKTO-${vulnerabilities.length + 1}`,
            severity: severityMatch ? severityMatch[0] : 'Unknown',
            description: line.trim(),
            cve: cveMatch ? cveMatch[0] : null,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      target: targetUrl,
      results: {
        vulnerabilities,
        rawOutput: output,
        scanTime: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

