import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target } = body;

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Target URL is required' },
        { status: 400 }
      );
    }

    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/ai_attack_surface_discovery.py';
          const { stdout, stderr } = await execPromise(
            `python3 ${scriptPath} "${target}"`,
            { timeout: 60000 }
          );
          
          if (stderr) {
            console.error('Python script stderr:', stderr);
          }
          
          const result = JSON.parse(stdout);
          console.log('Python script output:', JSON.stringify(result, null, 2).substring(0, 1000));
          
          if (result && result.success && result.result) {
            // Log for debugging
            console.log('Discovery result summary:', {
              endpoints_found: result.result.summary?.endpoints_found,
              attack_surface_score: result.result.summary?.attack_surface_score,
              discovery_results: result.result.discovery_results ? 'exists' : 'missing'
            });
            
            return NextResponse.json({
              success: true,
              result: result.result,
              mock: false
            });
          } else {
            console.error('Invalid result structure:', {
              hasResult: !!result,
              hasSuccess: result?.success,
              hasResultObj: !!result?.result
            });
          }
        } catch (error) {
          console.error('Python script execution error:', error);
        }
      }
    } catch (error) {
      console.error('Python check error:', error);
    }

    return NextResponse.json({
      success: true,
      mock: true,
      result: {
        target,
        discovery_results: {},
        summary: { endpoints_found: 0, attack_surface_score: 0, vulnerabilities_predicted: 0 },
        message: 'Python script not available. Returning mock data.'
      }
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

