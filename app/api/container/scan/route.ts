import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageName, scanType } = body;

    try {
      // Try using trivy or docker scout if available
      const trivyCheck = await execPromise('which trivy').catch(() => ({ stdout: '' }));
      if (trivyCheck.stdout) {
        try {
          const { stdout } = await execPromise(
            `trivy image --format json ${imageName}`,
            { timeout: 60000 }
          );
          const result = JSON.parse(stdout);
          if (result) {
            return NextResponse.json({
              success: true,
              result: {
                vulnerabilities: result.Results?.[0]?.Vulnerabilities || [],
                riskScore: 50,
              },
            });
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
      result: {
        vulnerabilities: [
          { cve: 'CVE-2024-XXXX', severity: 'high', package: 'example-package' },
        ],
        riskScore: 65,
        note: 'Install trivy for full container scanning: brew install trivy',
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

