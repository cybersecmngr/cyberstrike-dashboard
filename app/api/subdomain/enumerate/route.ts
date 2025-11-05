import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface SubdomainRequest {
  domain: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubdomainRequest = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Sanitize domain
    const sanitizedDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '');

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/subdomain_enum.py';
          const { stdout } = await execPromise(`python3 ${scriptPath} ${sanitizedDomain}`, {
            timeout: 35000,
          });
          
          const result = JSON.parse(stdout);
          if (result && result.subdomains) {
            return NextResponse.json({
              success: true,
              subdomains: result.subdomains.slice(0, 50),
            });
          }
        } catch {
          // Fall through to sublist3r/amass
        }
      }
    } catch {
      // Fall through
    }

    // Check for sublist3r or amass
    const hasSublist3r = await execPromise('which sublist3r').then(() => true).catch(() => false);
    const hasAmass = await execPromise('which amass').then(() => true).catch(() => false);

    if (hasSublist3r) {
      try {
        const { stdout } = await execPromise(`sublist3r -d ${sanitizedDomain} -t 10`, {
          timeout: 30000,
        });
        
        const subdomains = stdout
          .split('\n')
          .filter(line => line.trim() && !line.includes('[') && !line.includes(']'))
          .map(line => line.trim())
          .filter(line => line.includes(sanitizedDomain))
          .map(line => ({
            subdomain: line,
            status: 'active' as const,
          }));

        return NextResponse.json({
          success: true,
          subdomains: subdomains.slice(0, 50), // Limit to 50
        });
      } catch (error) {
        // Fall through to mock data
      }
    }

    if (hasAmass) {
      try {
        const { stdout } = await execPromise(`amass enum -d ${sanitizedDomain} -passive`, {
          timeout: 30000,
        });
        
        const subdomains = stdout
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.trim())
          .map(line => ({
            subdomain: line,
            status: 'active' as const,
          }));

        return NextResponse.json({
          success: true,
          subdomains: subdomains.slice(0, 50),
        });
      } catch (error) {
        // Fall through to mock data
      }
    }

    // Return mock data if tools are not available
    const commonSubdomains = [
      'www', 'mail', 'ftp', 'admin', 'api', 'blog', 'cdn', 'dev', 'test',
      'staging', 'prod', 'www2', 'shop', 'store', 'support', 'help', 'docs',
      'portal', 'app', 'web', 'ns1', 'ns2', 'mx', 'smtp', 'pop', 'imap',
      'remote', 'vpn', 'secure', 'login', 'auth', 'sso', 'dashboard',
    ];

    const mockSubdomains = commonSubdomains
      .slice(0, Math.floor(Math.random() * 15) + 10)
      .map(sub => ({
        subdomain: `${sub}.${sanitizedDomain}`,
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        status: Math.random() > 0.3 ? 'active' as const : 'inactive' as const,
      }));

    return NextResponse.json({
      success: true,
      mock: true,
      subdomains: mockSubdomains,
      message: 'Sublist3r/Amass not installed. Returning mock data.',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

