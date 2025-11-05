import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface AnalyzeRequest {
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Try Python script first
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/password_generator.py';
          const { stdout } = await execPromise(`python3 ${scriptPath} analyze "${password}"`, {
            timeout: 5000,
          });
          
          const result = JSON.parse(stdout);
          if (result && result.success) {
            return NextResponse.json({
              success: true,
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
    let score = 0;
    const feedback: string[] = [];
    
    const length = password.length;
    if (length < 8) {
      feedback.push('Password is too short (minimum 8 characters)');
    } else if (length < 12) {
      score += 10;
      feedback.push('Password length is acceptable');
    } else if (length < 16) {
      score += 20;
      feedback.push('Password length is good');
    } else {
      score += 30;
      feedback.push('Password length is excellent');
    }
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
    
    const charTypes = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
    
    if (charTypes === 1) {
      score += 5;
      feedback.push('Add more character types for better security');
    } else if (charTypes === 2) {
      score += 15;
      feedback.push('Consider adding more character types');
    } else if (charTypes === 3) {
      score += 25;
      feedback.push('Good character variety');
    } else {
      score += 35;
      feedback.push('Excellent character variety');
    }
    
    const strength = score < 30 ? 'weak' : score < 60 ? 'medium' : score < 80 ? 'strong' : 'very-strong';

    return NextResponse.json({
      success: true,
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

