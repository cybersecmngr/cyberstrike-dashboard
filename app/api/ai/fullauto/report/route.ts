import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const testResults = await request.json();
    
    // Generate report using Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_pentest_report.py');
    
    // Write test results to temp file
    const fs = await import('fs/promises');
    const tempFile = path.join(process.cwd(), 'temp_pentest_results.json');
    await fs.writeFile(tempFile, JSON.stringify(testResults, null, 2));
    
    try {
      // Run Python script to generate report
      const { stdout } = await execPromise(
        `python3 ${scriptPath} ${tempFile}`,
        { timeout: 30000 }
      );
      
      // Read generated report
      const reportMatch = stdout.match(/Report saved to: (.+)/);
      let reportText = '';
      
      if (reportMatch && reportMatch[1]) {
        const reportPath = reportMatch[1].trim();
        reportText = await fs.readFile(reportPath, 'utf-8');
        // Clean up report file
        await fs.unlink(reportPath).catch(() => {});
      } else {
        // Fallback: generate report directly
        reportText = generateReportText(testResults);
      }
      
      // Clean up temp file
      await fs.unlink(tempFile).catch(() => {});
      
      return NextResponse.json({
        success: true,
        json: testResults,
        text: reportText
      });
    } catch {
      // If Python script fails, generate report directly
      const reportText = generateReportText(testResults);
      
      // Clean up temp file
      await fs.unlink(tempFile).catch(() => {});
      
      return NextResponse.json({
        success: true,
        json: testResults,
        text: reportText
      });
    }
  } catch (error: unknown) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

interface TestResult {
  target?: string;
  test_date?: string;
  risk_score?: number;
  stages?: Array<{
    stage_name?: string;
    endpoints_found?: number;
    attack_surface_score?: number;
    vulnerabilities?: unknown[];
    high_risk_count?: number;
    exploits_successful?: number;
    access_gained?: boolean;
    data_exfiltrated?: Array<{ type?: string; data?: unknown }>;
    web_shells_deployed?: Array<{ url?: string; file_url?: string; type?: string }>;
    vulnerabilities_exploited?: Array<{ type?: string; severity?: string }>;
  }>;
  vulnerabilities_found?: Array<{
    type?: string;
    severity?: string;
    endpoint?: string;
    description?: string;
    payload?: string;
    exploited?: boolean;
  }>;
  recommendations?: string[];
  summary?: {
    exploits_successful?: number;
    access_gained?: boolean;
    duration?: string;
    total_requests?: string;
  };
  logMessages?: Array<{ timestamp?: string; message?: string }>;
}

function generateReportText(testResults: TestResult): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(80));
  lines.push('ADVANCED PENETRATION TEST REPORT');
  lines.push('='.repeat(80));
  lines.push('');
  
  // Executive Summary
  lines.push('EXECUTIVE SUMMARY');
  lines.push('-'.repeat(80));
  lines.push(`Target: ${testResults.target || 'Unknown'}`);
  lines.push(`Test Date: ${testResults.test_date || new Date().toISOString()}`);
  lines.push(`Risk Score: ${testResults.risk_score?.toFixed(1) || 0}/100`);
  lines.push(`Total Vulnerabilities: ${testResults.vulnerabilities_found?.length || 0}`);
  lines.push(`Exploits Successful: ${testResults.summary?.exploits_successful || 0}`);
  lines.push(`Access Gained: ${testResults.summary?.access_gained ? 'YES' : 'NO'}`);
  lines.push('');
  
  // Critical Findings
  lines.push('CRITICAL FINDINGS');
  lines.push('-'.repeat(80));
  const criticalFindings: string[] = [];
  
  if (testResults.stages) {
    for (const stage of testResults.stages) {
      if (stage.stage_name === 'Advanced NSA-Level Exploitation') {
        const exploits = stage.exploits_successful || 0;
        if (exploits > 0) {
          criticalFindings.push(`✓ ${exploits} successful exploitation(s) executed`);
        }
        if (stage.access_gained) {
          criticalFindings.push('✓ SYSTEM ACCESS GAINED');
        }
        const dataExfiltrated = stage.data_exfiltrated?.length || 0;
        if (dataExfiltrated > 0) {
          criticalFindings.push(`✓ ${dataExfiltrated} data items exfiltrated`);
        }
        const webShells = stage.web_shells_deployed?.length || 0;
        if (webShells > 0) {
          criticalFindings.push(`✓ ${webShells} web shell(s) deployed`);
        }
      }
    }
  }
  
  if (criticalFindings.length === 0) {
    criticalFindings.push('No critical vulnerabilities found during exploitation');
  }
  
  criticalFindings.forEach(finding => lines.push(finding));
  lines.push('');
  
  // Detailed Vulnerability Findings
  lines.push('DETAILED VULNERABILITY FINDINGS');
  lines.push('-'.repeat(80));
  const vulnerabilities = testResults.vulnerabilities_found || [];
  if (vulnerabilities.length > 0) {
    vulnerabilities.forEach((vuln, idx) => {
      lines.push(`${idx + 1}. ${vuln.type || 'Unknown'} - ${(vuln.severity || 'unknown').toUpperCase()}`);
      lines.push(`   Endpoint: ${vuln.endpoint || 'N/A'}`);
      lines.push(`   Description: ${vuln.description || 'N/A'}`);
      if (vuln.payload) {
        lines.push(`   Payload: ${vuln.payload}`);
      }
      if (vuln.exploited) {
        lines.push(`   Status: EXPLOITED`);
      }
      lines.push('');
    });
  } else {
    lines.push('No vulnerabilities found');
  }
  lines.push('');
  
  // Stage-by-Stage Results
  lines.push('STAGE-BY-STAGE RESULTS');
  lines.push('-'.repeat(80));
  if (testResults.stages) {
    testResults.stages.forEach((stage) => {
      lines.push(`Stage: ${stage.stage_name || 'Unknown'}`);
      
      if (stage.stage_name === 'Attack Surface Discovery') {
        lines.push(`  Endpoints Found: ${stage.endpoints_found || 0}`);
        if (stage.attack_surface_score) {
          lines.push(`  Attack Surface Score: ${stage.attack_surface_score.toFixed(1)}/100`);
        }
      } else if (stage.stage_name === 'Vulnerability Scanning') {
        lines.push(`  Vulnerabilities Identified: ${stage.vulnerabilities?.length || 0}`);
        if (stage.high_risk_count && stage.high_risk_count > 0) {
          lines.push(`  High Risk Findings: ${stage.high_risk_count}`);
        }
      } else if (stage.stage_name === 'Advanced NSA-Level Exploitation') {
        lines.push(`  Exploits Successful: ${stage.exploits_successful || 0}`);
        lines.push(`  Access Gained: ${stage.access_gained ? 'YES' : 'NO'}`);
        
        // Data Exfiltration Details
        const dataExfiltrated = stage.data_exfiltrated || [];
        if (dataExfiltrated.length > 0) {
          lines.push(`  Data Exfiltrated: ${dataExfiltrated.length} items`);
          dataExfiltrated.slice(0, 5).forEach((dataItem) => {
            const dataType = dataItem.type || 'unknown';
            const dataContent = typeof dataItem.data === 'string' ? dataItem.data.substring(0, 100) : JSON.stringify(dataItem.data).substring(0, 100);
            lines.push(`    - ${dataType}: ${dataContent}`);
          });
        }
        
        // Web Shells Deployed
        const webShells = stage.web_shells_deployed || [];
        if (webShells.length > 0) {
          lines.push(`  Web Shells Deployed: ${webShells.length}`);
          webShells.slice(0, 3).forEach((shell) => {
            lines.push(`    - ${shell.url || 'N/A'} (${shell.type || 'unknown'})`);
          });
        }
        
        // Exploited Vulnerabilities
        const exploitedVulns = stage.vulnerabilities_exploited || [];
        if (exploitedVulns.length > 0) {
          lines.push(`  Vulnerabilities Exploited: ${exploitedVulns.length}`);
          exploitedVulns.slice(0, 5).forEach((vuln) => {
            const vulnType = vuln.type || 'Unknown';
            const vulnSeverity = vuln.severity || 'unknown';
            lines.push(`    - ${vulnType} (${vulnSeverity})`);
          });
        }
      }
      
      lines.push('');
    });
  }
  
  // Recommendations
  lines.push('RECOMMENDATIONS');
  lines.push('-'.repeat(80));
  const recommendations = testResults.recommendations || [];
  if (recommendations.length > 0) {
    recommendations.forEach((rec, idx) => {
      lines.push(`${idx + 1}. ${rec}`);
    });
  } else {
    lines.push('1. Implement proper input validation and sanitization');
    lines.push('2. Use parameterized queries to prevent SQL injection');
    lines.push('3. Implement Content Security Policy (CSP) to prevent XSS');
    lines.push('4. Use Web Application Firewall (WAF) for additional protection');
    lines.push('5. Regularly update and patch all software components');
  }
  lines.push('');
  
  // Technical Details
  lines.push('TECHNICAL DETAILS');
  lines.push('-'.repeat(80));
  lines.push(`Test Duration: ${testResults.summary?.duration || 'N/A'}`);
  lines.push(`Stages Completed: ${testResults.stages?.length || 0}`);
  lines.push(`Total Requests: ${testResults.summary?.total_requests || 'N/A'}`);
  lines.push('');
  
  // Real-Time Log Summary
  if (testResults.logMessages && testResults.logMessages.length > 0) {
    lines.push('REAL-TIME LOG SUMMARY');
    lines.push('-'.repeat(80));
    testResults.logMessages.forEach((log) => {
      lines.push(`[${log.timestamp}] ${log.message}`);
    });
    lines.push('');
  }
  
  lines.push('='.repeat(80));
  lines.push('END OF REPORT');
  lines.push('='.repeat(80));
  
  return lines.join('\n');
}

