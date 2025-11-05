import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface EncodeRequest {
  input: string;
  format: 'base64' | 'url' | 'hex' | 'html';
  mode: 'encode' | 'decode';
}

export async function POST(request: NextRequest) {
  try {
    const body: EncodeRequest = await request.json();
    const { input, format, mode } = body;

    if (!input) {
      return NextResponse.json(
        { success: false, error: 'Input is required' },
        { status: 400 }
      );
    }

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/encoder_decoder.py';
          const { stdout } = await execPromise(
            `python3 ${scriptPath} "${input.replace(/"/g, '\\"')}" "${format}" "${mode}"`,
            { timeout: 5000 }
          );
          
          const result = JSON.parse(stdout);
          if (result && result.success) {
            return NextResponse.json({
              success: true,
              output: result.output,
            });
          }
        } catch {
          // Fall through to Node.js
        }
      }
    } catch {
      // Fall through
    }

    let output = '';

    if (mode === 'encode') {
      switch (format) {
        case 'base64':
          output = Buffer.from(input, 'utf8').toString('base64');
          break;
        case 'url':
          output = encodeURIComponent(input);
          break;
        case 'hex':
          output = Buffer.from(input, 'utf8').toString('hex');
          break;
        case 'html':
          output = input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          break;
      }
    } else {
      switch (format) {
        case 'base64':
          try {
            output = Buffer.from(input, 'base64').toString('utf8');
          } catch {
            output = 'Invalid Base64';
          }
          break;
        case 'url':
          try {
            output = decodeURIComponent(input);
          } catch {
            output = 'Invalid URL encoding';
          }
          break;
        case 'hex':
          try {
            output = Buffer.from(input.replace(/[^0-9a-fA-F]/g, ''), 'hex').toString('utf8');
          } catch {
            output = 'Invalid Hex';
          }
          break;
        case 'html':
          output = input
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
          break;
      }
    }

    return NextResponse.json({
      success: true,
      output,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

