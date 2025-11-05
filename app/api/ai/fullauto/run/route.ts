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
      console.log(`[AI Full Auto Pentest] Initializing for target: ${target}`);
      console.log(`[AI Full Auto Pentest] Progress key: ${progressKey}`);
      
      // Initialize progress
      progressStore.set(progressKey, {
        currentStage: 'Initializing Python script...',
        stageProgress: {},
        result: null,
        completed: false
      });
      
      console.log(`[AI Full Auto Pentest] Progress initialized, store size: ${progressStore.size}`);

      // Run test in background (don't await)
      (async () => {
        try {
          const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
          if (pythonCheck.stdout) {
            try {
              const scriptPath = process.cwd() + '/scripts/ai_full_auto_pentest.py';
              
              console.log(`[AI Full Auto Pentest] Starting test for: ${target}`);
              console.log(`[AI Full Auto Pentest] Script path: ${scriptPath}`);
              
              // Execute script and capture output line by line
              const pythonProcess = spawn('python3', [scriptPath, target], {
                cwd: process.cwd(),
                env: process.env
              });
              
              pythonProcess.on('error', (error) => {
                console.error('[AI Full Auto Pentest] Process error:', error);
                const stored = progressStore.get(progressKey);
                if (stored) {
                  stored.currentStage = `Error: ${error.message}`;
                  stored.completed = true;
                  progressStore.set(progressKey, stored);
                }
              });
              
              let stdout = '';
              
              pythonProcess.stdout.on('data', (data: Buffer) => {
                stdout += data.toString();
              });
              
              pythonProcess.stderr.on('data', (data: Buffer) => {
                const lines = data.toString().split('\n');
                
                for (const line of lines) {
                  if (line.trim().startsWith('{')) {
                    try {
                      const update = JSON.parse(line.trim()) as ProgressUpdate & { discovery?: string; [key: string]: unknown };
                      
                      if (update.stage) {
                        const stored = progressStore.get(progressKey);
                        if (stored) {
                          stored.currentStage = update.message || `${update.stage}: ${update.status}`;
                          // CRITICAL: For exploitation stage, preserve exploits_successful
                          if (update.stage === 'exploitation' && update.exploits_successful !== undefined) {
                            stored.stageProgress[update.stage] = {
                              ...update,
                              exploits_successful: update.exploits_successful,
                              vulnerabilities_exploited: update.vulnerabilities_exploited || update.vulnerabilities_exploited_count || 0,
                              access_gained: update.access_gained || false
                            };
                          } else {
                            stored.stageProgress[update.stage] = update;
                          }
                          progressStore.set(progressKey, stored);
                          console.log(`[AI Full Auto Pentest] Stage update: ${update.stage} - ${update.status}`, update.exploits_successful !== undefined ? `exploits_successful: ${update.exploits_successful}` : '');
                        }
                      } else if (update.discovery) {
                        // Handle discovery progress updates - CRITICAL: Log all discovery messages
                        const stored = progressStore.get(progressKey);
                        if (stored) {
                          // Update current stage with discovery message
                          if (update.message) {
                            stored.currentStage = update.message;
                          }
                          // Store discovery progress separately (always update, don't replace)
                          (stored as { discovery_progress?: unknown }).discovery_progress = {
                            ...update,
                            timestamp: Date.now() // Add timestamp to make each update unique
                          };
                          progressStore.set(progressKey, stored);
                          console.log(`[AI Full Auto Pentest] Discovery progress: ${update.message || 'No message'}`, {
                            method: update.method,
                            found: update.found,
                            stage: update.stage,
                            tech_stack: update.tech_stack
                          });
                        }
                      } else if (update.message && (
                        update.message.includes('discovery') || 
                        update.message.includes('Discovery') ||
                        update.message.includes('Scanning') ||
                        update.message.includes('pattern') ||
                        update.message.includes('Technology') ||
                        update.message.includes('Upgrading to NSA-level')
                      )) {
                        // CRITICAL: Also catch discovery messages that might not have discovery key
                        const stored = progressStore.get(progressKey);
                        if (stored) {
                          stored.currentStage = update.message;
                          (stored as { discovery_progress?: unknown }).discovery_progress = {
                            discovery: true,
                            message: update.message,
                            timestamp: Date.now()
                          };
                          progressStore.set(progressKey, stored);
                          console.log(`[AI Full Auto Pentest] Discovery message (from general): ${update.message}`);
                        }
                      } else if (update.stage === 'exploitation' && update.status === 'completed') {
                        // CRITICAL: Handle exploitation completion with exploits_successful
                        const stored = progressStore.get(progressKey);
                        if (stored) {
                          if (!stored.stageProgress) {
                            stored.stageProgress = {};
                          }
                          stored.stageProgress['exploitation'] = {
                            stage: 'exploitation',
                            status: 'completed',
                            message: update.message || 'Exploitation completed',
                            exploits_successful: update.exploits_successful || 0,
                            vulnerabilities_exploited: update.vulnerabilities_exploited_count || 0,
                            access_gained: update.access_gained || false,
                            critical_findings: update.critical_findings || 0
                          };
                          stored.currentStage = update.message || 'Exploitation completed';
                          progressStore.set(progressKey, stored);
                          console.log(`[AI Full Auto Pentest] Exploitation completed: ${update.exploits_successful || 0} exploits successful`);
                        }
                      } else if (update.stage === 'exploitation' && update.status === 'in_progress') {
                        // CRITICAL: Handle exploitation in-progress updates
                        const stored = progressStore.get(progressKey);
                        if (stored) {
                          if (!stored.stageProgress) {
                            stored.stageProgress = {};
                          }
                          stored.stageProgress['exploitation'] = {
                            stage: 'exploitation',
                            status: 'in_progress',
                            message: 'Exploitation in progress...',
                            exploits_successful: update.exploits_successful || 0,
                            vulnerabilities_exploited: update.vulnerabilities_exploited || 0,
                            access_gained: update.access_gained || false
                          };
                          progressStore.set(progressKey, stored);
                          console.log(`[AI Full Auto Pentest] Exploitation in progress: ${update.exploits_successful || 0} exploits successful`);
                        }
                      } else if (update.exploitation === 'results_summary') {
                        // CRITICAL: Handle exploitation results summary
                        const stored = progressStore.get(progressKey);
                        if (stored) {
                          if (!stored.stageProgress) {
                            stored.stageProgress = {};
                          }
                          stored.stageProgress['exploitation'] = {
                            stage: 'exploitation',
                            status: 'completed',
                            message: update.message || 'Exploitation completed',
                            exploits_successful: update.exploits_successful || 0,
                            vulnerabilities_exploited: update.vulnerabilities_exploited_count || 0,
                            access_gained: update.access_gained || false,
                            critical_findings: 0
                          };
                          stored.currentStage = update.message || 'Exploitation completed';
                          progressStore.set(progressKey, stored);
                          console.log(`[AI Full Auto Pentest] Exploitation summary: ${update.exploits_successful || 0} exploits successful`);
                        }
                      }
                    } catch {
                      // Log non-JSON lines for debugging
                      if (line.trim() && !line.trim().startsWith('{')) {
                        console.log(`[AI Full Auto Pentest] Python stderr: ${line.trim()}`);
                      }
                    }
                  } else if (line.trim()) {
                    // Log non-JSON stderr output for debugging
                    console.log(`[AI Full Auto Pentest] Python stderr (non-JSON): ${line.trim()}`);
                  }
                }
              });
              
              pythonProcess.on('close', async (code) => {
                console.log(`[AI Full Auto Pentest] Python process closed with code: ${code}`);
                console.log(`[AI Full Auto Pentest] stdout length: ${stdout.length}`);
                
                try {
                  if (stdout.trim()) {
                    const result = JSON.parse(stdout);
                    if (result && result.success && result.result) {
                      const stored = progressStore.get(progressKey);
                      if (stored) {
                        stored.result = result.result;
                        stored.completed = true;
                        stored.currentStage = 'Test completed';
                        progressStore.set(progressKey, stored);
                        console.log('[AI Full Auto Pentest] Test completed successfully');
                      }
                    } else {
                      console.error('[AI Full Auto Pentest] Invalid result format:', result);
                    }
                  } else {
                    console.error('[AI Full Auto Pentest] No stdout output from Python script');
                    const stored = progressStore.get(progressKey);
                    if (stored) {
                      stored.currentStage = 'Error: No output from Python script';
                      stored.completed = true;
                      progressStore.set(progressKey, stored);
                    }
                  }
                } catch (error) {
                  console.error('[AI Full Auto Pentest] Error parsing result:', error);
                  console.error('[AI Full Auto Pentest] stdout content:', stdout.substring(0, 500));
                  const stored = progressStore.get(progressKey);
                  if (stored) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    stored.currentStage = `Error: ${errorMessage}`;
                    stored.completed = true;
                    stored.result = {
                      target: target,
                      stages: [],
                      vulnerabilities_found: [],
                      risk_score: 0,
                      status: 'error',
                      summary: {
                        exploits_successful: 0,
                        access_gained: false,
                        duration: 'N/A',
                        total_requests: 'N/A'
                      }
                    };
                    // Store error message in currentStage for frontend
                    stored.currentStage = `Error: ${errorMessage}`;
                    progressStore.set(progressKey, stored);
                  }
                }
              });
            } catch (error) {
              console.error('[AI Full Auto Pentest] Python script execution error:', error);
              const stored = progressStore.get(progressKey);
              if (stored) {
                stored.currentStage = `Error: ${error instanceof Error ? error.message : 'Execution failed'}`;
                stored.completed = true;
                progressStore.set(progressKey, stored);
              }
            }
          } else {
            console.error('[AI Full Auto Pentest] Python3 not found');
            const stored = progressStore.get(progressKey);
            if (stored) {
              stored.currentStage = 'Error: Python3 not found';
              stored.completed = true;
              progressStore.set(progressKey, stored);
            }
          }
        } catch (error) {
          console.error('[AI Full Auto Pentest] Python check error:', error);
          const stored = progressStore.get(progressKey);
          if (stored) {
            stored.currentStage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            stored.completed = true;
            progressStore.set(progressKey, stored);
          }
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

