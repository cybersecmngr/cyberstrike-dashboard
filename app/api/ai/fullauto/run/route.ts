import { NextRequest, NextResponse } from 'next/server';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { progressStore, type ProgressUpdate } from '@/lib/progress-store';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target, action } = body;

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Target URL is required' },
        { status: 400 }
      );
    }

    const progressKey = `pentest_${target}`;

    // If action is 'get_result', return stored result
    if (action === 'get_result') {
      const stored = progressStore.get(progressKey);
      if (stored && stored.completed) {
        return NextResponse.json({
          success: true,
          result: stored.result,
          mock: false
        });
      }
      return NextResponse.json({
        success: false,
        error: 'Test not completed yet'
      });
    }

    // Start the test in background
    if (action === 'start') {
      // Initialize progress
      progressStore.set(progressKey, {
        currentStage: 'Initializing...',
        stageProgress: {},
        result: null,
        completed: false
      });

      // Run test in background (don't await)
      (async () => {
        try {
          const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
          if (pythonCheck.stdout) {
            try {
              const scriptPath = process.cwd() + '/scripts/ai_full_auto_pentest.py';
              
              // Execute script and capture output line by line
              const pythonProcess = spawn('python3', [scriptPath, target]);
              
              let stdout = '';
              
              pythonProcess.stdout.on('data', (data: Buffer) => {
                stdout += data.toString();
              });
              
              pythonProcess.stderr.on('data', (data: Buffer) => {
                const lines = data.toString().split('\n');
                
                for (const line of lines) {
                  if (line.trim().startsWith('{')) {
                    try {
                      const update = JSON.parse(line.trim()) as ProgressUpdate;
                      if (update.stage) {
                        const stored = progressStore.get(progressKey);
                        if (stored) {
                          stored.currentStage = update.message || `${update.stage}: ${update.status}`;
                          stored.stageProgress[update.stage] = update;
                          progressStore.set(progressKey, stored);
                        }
                      }
                    } catch {
                      // Ignore parse errors
                    }
                  }
                }
              });
              
              pythonProcess.on('close', async () => {
                try {
                  const result = JSON.parse(stdout);
                  if (result && result.success && result.result) {
                    const stored = progressStore.get(progressKey);
                    if (stored) {
                      stored.result = result.result;
                      stored.completed = true;
                      progressStore.set(progressKey, stored);
                    }
                  }
                } catch (error) {
                  console.error('Error parsing result:', error);
                }
              });
            } catch (error) {
              console.error('Python script execution error:', error);
            }
          }
        } catch (error) {
          console.error('Python check error:', error);
        }
      })();

      return NextResponse.json({
        success: true,
        message: 'Test started'
      });
    }

    // Default: run synchronously (for backward compatibility)
    try {
      const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
      if (pythonCheck.stdout) {
        try {
          const scriptPath = process.cwd() + '/scripts/ai_full_auto_pentest.py';
          const { stdout, stderr } = await execPromise(
            `python3 ${scriptPath} "${target}" 2>&1`,
            { timeout: 300000 } // 5 minutes timeout
          );
          
          // Parse stderr for progress updates (they're JSON logs)
          const progressLines = stderr.split('\n').filter(line => line.trim().startsWith('{'));
          const progressUpdates: ProgressUpdate[] = [];
          
          for (const line of progressLines) {
            try {
              const update = JSON.parse(line) as ProgressUpdate;
              if (update.stage) {
                progressUpdates.push(update);
              }
            } catch {
              // Ignore parse errors
            }
          }
          
          const result = JSON.parse(stdout);
          if (result && result.success && result.result) {
            console.log('Full auto pentest completed:', {
              stages: result.result.stages?.length,
              vulnerabilities: result.result.vulnerabilities_found?.length,
              risk_score: result.result.risk_score
            });
            
            return NextResponse.json({
              success: true,
              result: {
                ...result.result,
                progress_updates: progressUpdates
              },
              mock: false
            });
          } else {
            console.error('Invalid result structure:', result);
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
        stages: [],
        vulnerabilities_found: [],
        risk_score: 0,
        recommendations: ['Python script not available. Returning mock data.'],
        status: 'completed'
      }
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

