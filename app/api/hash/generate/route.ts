import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execPromise = promisify(exec);

interface HashRequest {
  input: string;
  hashType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: HashRequest = await request.json();
    const { input, hashType = 'md5' } = body;

    if (!input) {
      return NextResponse.json(
        { success: false, error: 'Input is required' },
        { status: 400 }
      );
    }

    // Try Python script first (for bcrypt)
    if (hashType === 'bcrypt' || hashType === 'all') {
      try {
        const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
        
        if (pythonCheck.stdout) {
          try {
            const scriptPath = process.cwd() + '/scripts/hash_generator.py';
            const { stdout } = await execPromise(
              `python3 ${scriptPath} "${input}" "${hashType}"`,
              { timeout: 5000 }
            );
            
            const result = JSON.parse(stdout);
            if (result && result.success) {
              return NextResponse.json({
                success: true,
                hashes: result.hashes,
              });
            }
          } catch {
            // Fall through to Node.js
          }
        }
      } catch {
        // Fall through
      }
    }

    // Node.js fallback (no bcrypt)
    const hashes: Record<string, string> = {};
    
    if (hashType === 'all' || hashType === 'md5') {
      hashes['MD5'] = crypto.createHash('md5').update(input).digest('hex');
    }
    
    if (hashType === 'all' || hashType === 'sha1') {
      hashes['SHA1'] = crypto.createHash('sha1').update(input).digest('hex');
    }
    
    if (hashType === 'all' || hashType === 'sha256') {
      hashes['SHA256'] = crypto.createHash('sha256').update(input).digest('hex');
    }
    
    if (hashType === 'all' || hashType === 'sha512') {
      hashes['SHA512'] = crypto.createHash('sha512').update(input).digest('hex');
    }

    return NextResponse.json({
      success: true,
      hashes,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

