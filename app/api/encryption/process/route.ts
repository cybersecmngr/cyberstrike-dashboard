import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execPromise = promisify(exec);

interface EncryptionRequest {
  input: string;
  key?: string;
  algorithm: 'aes256' | 'rsa' | 'base64' | 'md5' | 'sha256';
  mode: 'encrypt' | 'decrypt' | 'generate';
}

export async function POST(request: NextRequest) {
  try {
    const body: EncryptionRequest = await request.json();
    const { input, key, algorithm, mode } = body;

    // Generate key
    if (mode === 'generate') {
      try {
        const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
        
        if (pythonCheck.stdout) {
          try {
            const scriptPath = process.cwd() + '/scripts/advanced_encryption.py';
            const { stdout } = await execPromise(
              `python3 ${scriptPath} generate ${algorithm === 'aes256' ? 'aes' : algorithm}`,
              { timeout: 5000 }
            );
            
            const result = JSON.parse(stdout);
            if (result && result.success) {
              return NextResponse.json({
                success: true,
                key: result.key,
              });
            }
          } catch {
            // Fall through
          }
        }
      } catch {
        // Fall through
      }

      // Node.js fallback
      if (algorithm === 'aes256') {
        const generatedKey = crypto.randomBytes(32).toString('base64');
        return NextResponse.json({
          success: true,
          key: generatedKey,
        });
      }
    }

    if (!input) {
      return NextResponse.json(
        { success: false, error: 'Input is required' },
        { status: 400 }
      );
    }

    // Try Python script for advanced encryption
    if (algorithm === 'aes256' || algorithm === 'rsa') {
      try {
        const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
        
        if (pythonCheck.stdout && key) {
          try {
            const scriptPath = process.cwd() + '/scripts/advanced_encryption.py';
            const action = mode === 'encrypt' ? 'encrypt' : 'decrypt';
            const algo = algorithm === 'aes256' ? 'aes' : 'rsa';
            const { stdout } = await execPromise(
              `python3 ${scriptPath} ${action} "${input.replace(/"/g, '\\"')}" "${key}" ${algo}`,
              { timeout: 5000 }
            );
            
            const result = JSON.parse(stdout);
            if (result && result.success) {
              return NextResponse.json({
                success: true,
                output: result.encrypted || result.decrypted,
              });
            }
          } catch {
            // Fall through
          }
        }
      } catch {
        // Fall through
      }
    }

    // Node.js fallback
    let output = '';
    
    if (mode === 'encrypt') {
      switch (algorithm) {
        case 'base64':
          output = Buffer.from(input, 'utf8').toString('base64');
          break;
        case 'md5':
          output = crypto.createHash('md5').update(input).digest('hex');
          break;
        case 'sha256':
          output = crypto.createHash('sha256').update(input).digest('hex');
          break;
        default:
          output = 'Algorithm not supported in Node.js fallback';
      }
    } else {
      switch (algorithm) {
        case 'base64':
          try {
            output = Buffer.from(input, 'base64').toString('utf8');
          } catch {
            output = 'Invalid Base64';
          }
          break;
        default:
          output = 'Decryption not supported for this algorithm';
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

