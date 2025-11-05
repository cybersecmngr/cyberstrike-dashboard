import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface DatabaseRequest {
  host: string;
  port: number;
  dbType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DatabaseRequest = await request.json();
    const { host, port, dbType = 'mysql' } = body;

    if (!host || !port) {
      return NextResponse.json(
        { success: false, error: 'Host and port are required' },
        { status: 400 }
      );
    }

    const sanitizedHost = host.replace(/[^a-zA-Z0-9.-]/g, '');

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/database_explorer.py';
          const { stdout } = await execPromise(
            `python3 ${scriptPath} explore "${sanitizedHost}" ${port} "${dbType}"`,
            { timeout: 15000 }
          );
          
          const result = JSON.parse(stdout);
          if (result && result.success) {
            return NextResponse.json({
              success: true,
              result: result.result,
            });
          }
        } catch {
          // Fall through
        }
      }
    } catch {
      // Fall through
    }

    // Return mock data
    return NextResponse.json({
      success: true,
      mock: true,
      result: {
        host: sanitizedHost,
        port,
        type: dbType,
        databases: ['information_schema', 'mysql', 'test', 'production'],
        tables: ['users', 'products', 'orders'],
        users: ['root', 'admin', 'user'],
        vulnerabilities: ['Check for default credentials'],
      },
      message: 'Python script or database tools not available. Returning mock data.',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

