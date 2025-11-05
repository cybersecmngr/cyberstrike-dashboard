import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

// In-memory storage for streaming progress
const progressStore = new Map<string, {
  phases: any[];
  currentPhase: number;
  updates: any[];
  totalFindings: number;
  totalEvidence: number;
  riskScore: number;
  completed: boolean;
  result: any;
}>();

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

    const progressKey = `iq200_${target}`;

    // Get progress updates
    if (action === 'get_progress') {
      const stored = progressStore.get(progressKey);
      if (stored) {
        return NextResponse.json({
          success: true,
          progress: stored
        });
      }
      return NextResponse.json({
        success: false,
        error: 'No test running'
      });
    }

    // Get final result
    if (action === 'get_result') {
      const stored = progressStore.get(progressKey);
      if (stored && stored.completed) {
        return NextResponse.json({
          success: true,
          result: stored.result
        });
      }
      return NextResponse.json({
        success: false,
        error: 'Test not completed yet'
      });
    }

    // Start the test
    if (action === 'start') {
      console.log(`[IQ 200] Starting test for target: ${target}`);

      // Initialize all 15 phases
      const initialPhases = [
        { phase_number: 1, phase_name: 'Target Reconnaissance', description: 'Deep intelligence gathering', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 2, phase_name: 'WAF Detection', description: 'Security controls analysis', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 3, phase_name: 'Attack Surface Mapping', description: 'NSA-level discovery', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 4, phase_name: 'Payload Generation', description: 'Genetic algorithm (30×10)', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 5, phase_name: 'Vulnerability Scanning', description: 'AI-powered detection', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 6, phase_name: 'Automated Exploitation', description: 'Multi-vector attacks', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 7, phase_name: 'SQL Injection & Data Exfiltration', description: 'Database compromise', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 8, phase_name: 'Command Injection & File Hunting', description: 'System access & data theft', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 9, phase_name: 'XSS & Client-Side Attacks', description: 'Browser exploitation', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 10, phase_name: 'Authentication Bypass', description: 'Access control bypass', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 11, phase_name: 'Business Logic Testing', description: 'Application logic flaws', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 12, phase_name: 'Post-Exploitation', description: 'Privilege escalation', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 13, phase_name: 'Evidence Collection', description: 'Proof of compromise', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 14, phase_name: 'Risk Assessment', description: 'CVSS & impact analysis', status: 'pending', progress: 0, findings: [], sub_tasks: [] },
        { phase_number: 15, phase_name: 'Report Generation', description: 'Professional documentation', status: 'pending', progress: 0, findings: [], sub_tasks: [] }
      ];

      // Initialize progress
      progressStore.set(progressKey, {
        phases: initialPhases,
        currentPhase: 0,
        updates: [],
        totalFindings: 0,
        totalEvidence: 0,
        riskScore: 0,
        completed: false,
        result: null
      });

      // Run test in background
      (async () => {
        try {
          const scriptPath = process.cwd() + '/scripts/ai_iq200_ultimate_pentest.py';

          console.log(`[IQ 200] Script path: ${scriptPath}`);
          console.log(`[IQ 200] Target: ${target}`);

          // Execute Python script
          const pythonProcess = spawn('python3', [scriptPath, target], {
            cwd: process.cwd(),
            env: process.env
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
                  const update = JSON.parse(line.trim());
                  const stored = progressStore.get(progressKey);

                  if (stored && update) {
                    // Handle phase start
                    if (update.type === 'phase_start') {
                      stored.currentPhase = update.phase_number;
                      stored.updates.push(update);

                      // Update or add phase
                      const phaseIndex = stored.phases.findIndex(p => p.phase_number === update.phase_number);
                      if (phaseIndex >= 0) {
                        stored.phases[phaseIndex] = {
                          ...stored.phases[phaseIndex],
                          status: 'running',
                          started_at: update.timestamp
                        };
                      } else {
                        stored.phases.push({
                          phase_number: update.phase_number,
                          phase_name: update.phase_name,
                          description: update.message,
                          status: 'running',
                          progress: 0,
                          started_at: update.timestamp,
                          findings: [],
                          sub_tasks: []
                        });
                      }

                      console.log(`[IQ 200] Phase ${update.phase_number} started: ${update.phase_name}`);
                    }

                    // Handle phase progress
                    else if (update.type === 'phase_progress') {
                      const phaseIndex = stored.phases.findIndex(p => p.phase_number === update.phase_number);
                      if (phaseIndex >= 0) {
                        stored.phases[phaseIndex].progress = update.progress || 0;

                        // Add sub-task
                        if (update.sub_task) {
                          if (!stored.phases[phaseIndex].sub_tasks) {
                            stored.phases[phaseIndex].sub_tasks = [];
                          }
                          stored.phases[phaseIndex].sub_tasks.push({
                            name: update.sub_task,
                            timestamp: update.timestamp,
                            status: 'completed'
                          });
                        }
                      }
                      stored.updates.push(update);
                    }

                    // Handle phase complete
                    else if (update.type === 'phase_complete') {
                      const phaseIndex = stored.phases.findIndex(p => p.phase_number === update.phase_number);
                      if (phaseIndex >= 0) {
                        stored.phases[phaseIndex].status = 'completed';
                        stored.phases[phaseIndex].completed_at = update.timestamp;
                        stored.phases[phaseIndex].progress = 100;

                        // Add findings from update
                        if (update.findings_count) {
                          const findings = Array(update.findings_count).fill({ type: 'vulnerability' });
                          stored.phases[phaseIndex].findings = findings;
                          stored.totalFindings += update.findings_count;
                        }
                      }
                      stored.updates.push(update);
                      console.log(`[IQ 200] Phase ${update.phase_number} completed`);
                    }

                    // Handle test complete
                    else if (update.type === 'test_complete') {
                      stored.completed = true;
                      stored.updates.push(update);
                      console.log(`[IQ 200] Test completed`);
                    }

                    progressStore.set(progressKey, stored);
                  }
                } catch (e) {
                  // Ignore JSON parse errors
                  if (line.trim() && !line.includes('FutureWarning')) {
                    console.log(`[IQ 200] stderr: ${line.trim()}`);
                  }
                }
              }
            }
          });

          pythonProcess.on('error', (error) => {
            console.error('[IQ 200] Process error:', error);
            const stored = progressStore.get(progressKey);
            if (stored) {
              stored.completed = true;
              progressStore.set(progressKey, stored);
            }
          });

          pythonProcess.on('close', async (code) => {
            console.log(`[IQ 200] Process closed with code: ${code}`);
            console.log(`[IQ 200] stdout length: ${stdout.length}`);

            try {
              if (stdout.trim()) {
                const result = JSON.parse(stdout);
                const stored = progressStore.get(progressKey);

                if (stored && result) {
                  stored.result = result;
                  stored.completed = true;

                  // Update final metrics from result
                  if (result.summary) {
                    stored.totalFindings = result.summary.total_findings || stored.totalFindings;
                    stored.totalEvidence = result.summary.total_evidence || stored.totalEvidence;
                    stored.riskScore = result.risk_assessment?.overall_score || stored.riskScore;
                  }

                  progressStore.set(progressKey, stored);
                  console.log('[IQ 200] Test completed successfully');
                }
              }
            } catch (error) {
              console.error('[IQ 200] Error parsing result:', error);
            }
          });
        } catch (error) {
          console.error('[IQ 200] Error starting test:', error);
          const stored = progressStore.get(progressKey);
          if (stored) {
            stored.completed = true;
            progressStore.set(progressKey, stored);
          }
        }
      })();

      return NextResponse.json({
        success: true,
        message: 'IQ 200 Ultimate Pentest started'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
