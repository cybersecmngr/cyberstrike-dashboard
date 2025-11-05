import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface WhoIsRequest {
  query: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WhoIsRequest = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const sanitizedQuery = query.replace(/[^a-zA-Z0-9.-]/g, '');

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/whois_lookup.py';
          const { stdout } = await execPromise(`python3 ${scriptPath} "${sanitizedQuery}"`, {
            timeout: 15000,
          });
          
          const result = JSON.parse(stdout);
          if (result && result.success) {
            return NextResponse.json({
              success: true,
              result: result.result,
            });
          }
        } catch {
          // Fall through to whois command
        }
      }
    } catch {
      // Fall through
    }

    // Try whois command directly
    try {
      const { stdout } = await execPromise(`whois ${sanitizedQuery}`, {
        timeout: 15000,
      });
      
      // Simple parsing
      const result: any = { domain: sanitizedQuery };
      const lines = stdout.split('\n');
      
      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.includes('registrar:')) {
          result.registrar = line.split(':')[1]?.trim();
        } else if (lower.includes('creation date:')) {
          result.creationDate = line.split(':')[1]?.trim();
        } else if (lower.includes('expiration date:')) {
          result.expirationDate = line.split(':')[1]?.trim();
        }
      }
      
      return NextResponse.json({
        success: true,
        result,
      });
    } catch {
      // Return mock data
      return NextResponse.json({
        success: true,
        mock: true,
        result: {
          domain: sanitizedQuery,
          registrar: 'Example Registrar',
          creationDate: '2020-01-01',
          expirationDate: '2025-01-01',
          nameServers: ['ns1.example.com', 'ns2.example.com'],
          ip: '192.0.2.1',
          country: 'US',
          organization: 'Example Organization',
        },
        message: 'WhoIs tool not available. Returning mock data.',
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

