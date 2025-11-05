import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface CodeAnalyzeRequest {
  code: string;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CodeAnalyzeRequest = await request.json();
    const { code, language = 'python' } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      );
    }

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/code_analyzer.py';
          const { stdout } = await execPromise(
            `python3 ${scriptPath} "${code.replace(/"/g, '\\"')}" "${language}"`,
            { timeout: 10000 }
          );
          
          const result = JSON.parse(stdout);
          if (result && result.success) {
            return NextResponse.json({
              success: true,
              ...result,
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
      vulnerabilities: [
        {
          line: 15,
          severity: 'high',
          issue: 'Use of eval() - Code injection risk',
          code: 'result = eval(user_input)',
        },
        {
          line: 42,
          severity: 'medium',
          issue: 'Unvalidated user input',
          code: 'data = input("Enter data: ")',
        },
      ],
      total: 2,
      critical: 0,
      high: 1,
      medium: 1,
      message: 'Python script not available. Returning mock data.',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

