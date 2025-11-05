import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface PasswordRequest {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: PasswordRequest = await request.json();
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = false,
    } = body;

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/password_generator.py';
          const args = [
            'generate',
            '--length', length.toString(),
            includeUppercase ? '--include-uppercase' : '',
            includeLowercase ? '--include-lowercase' : '',
            includeNumbers ? '--include-numbers' : '',
            includeSymbols ? '--include-symbols' : '',
            excludeSimilar ? '--exclude-similar' : '',
          ].filter(Boolean).join(' ');
          
          const { stdout } = await execPromise(`python3 ${scriptPath} ${args}`, {
            timeout: 5000,
          });
          
          const result = JSON.parse(stdout);
          if (result && result.password) {
            return NextResponse.json({
              success: true,
              password: result.password,
              strength: result.strength,
            });
          }
        } catch {
          // Fall through to Node.js implementation
        }
      }
    } catch {
      // Fall through
    }

    // Node.js fallback implementation
    const chars: string[] = [];
    if (includeUppercase) chars.push(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (includeLowercase) chars.push(...'abcdefghijklmnopqrstuvwxyz');
    if (includeNumbers) chars.push(...'0123456789');
    if (includeSymbols) chars.push(...'!@#$%^&*()_+-=[]{}|;:,.<>?');

    let passwordChars = chars;
    if (excludeSimilar) {
      passwordChars = passwordChars.filter(c => !'0Oo1lI5Ss'.includes(c));
    }

    if (passwordChars.length === 0) {
      passwordChars = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * passwordChars.length);
      password += passwordChars[randomIndex];
    }

    // Simple strength analysis
    let score = 0;
    const feedback: string[] = [];
    
    if (length >= 16) score += 30;
    else if (length >= 12) score += 20;
    else if (length >= 8) score += 10;
    
    const charTypes = [
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    ].filter(Boolean).length;
    
    score += charTypes * 10;
    
    const strength = score < 30 ? 'weak' : score < 60 ? 'medium' : score < 80 ? 'strong' : 'very-strong';

    return NextResponse.json({
      success: true,
      password,
      strength: {
        score: Math.min(100, score),
        strength,
        feedback,
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

