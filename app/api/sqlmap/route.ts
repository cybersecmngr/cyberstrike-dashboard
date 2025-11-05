import { NextRequest, NextResponse } from 'next/server';
import { executeCommand, sanitizeInput, isValidURL, isToolInstalled } from '@/lib/api-utils';

interface SQLMapRequest {
  url: string;
  data?: string;
  method?: 'GET' | 'POST';
  parameter?: string;
  level?: number;
  risk?: number;
  timeout?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SQLMapRequest = await request.json();
    const {
      url,
      data,
      method = 'GET',
      parameter,
      level = 1,
      risk = 1,
      timeout = 120000,
    } = body;

    // Validation
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `http://${targetUrl}`;
    }

    if (!isValidURL(targetUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if sqlmap is installed
    const sqlmapInstalled = await isToolInstalled('sqlmap');
    if (!sqlmapInstalled) {
      // Return mock data for development
      return NextResponse.json({
        success: true,
        mock: true,
        url: targetUrl,
        progress: {
          current: 100,
          total: 100,
          status: 'completed',
        },
        results: {
          vulnerable: true,
          injectionType: 'Boolean-based blind',
          parameter: parameter || 'id',
          databases: ['webapp_db', 'mysql'],
          tables: ['users', 'products', 'orders'],
          message: 'SQL injection vulnerability detected',
        },
        message: 'SQLMap is not installed. Returning mock data.',
      });
    }

    // Build sqlmap command
    let command = 'sqlmap';
    command += ` -u "${sanitizeInput(targetUrl)}"`;
    command += ` --batch`;
    command += ` --level=${Math.min(Math.max(level, 1), 5)}`;
    command += ` --risk=${Math.min(Math.max(risk, 1), 3)}`;
    
    if (method === 'POST' && data) {
      command += ` --data="${sanitizeInput(data)}"`;
    }
    
    if (parameter) {
      command += ` -p ${sanitizeInput(parameter)}`;
    }
    
    command += ` --dbs`; // Enumerate databases

    // Execute sqlmap (with progress tracking)
    const result = await executeCommand(command, { timeout });

    if (!result.success && result.exitCode !== 0) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'SQLMap execution failed',
          stderr: result.stderr,
        },
        { status: 500 }
      );
    }

    // Parse sqlmap output
    const output = result.stdout;
    const databases: string[] = [];
    const tables: string[] = [];
    let vulnerable = false;
    let injectionType = '';

    // Extract database names
    const dbRegex = /available databases \[(\d+)\]:\s*([\s\S]*?)(?=\n\n|\n[^\s*]|$)/;
    const dbMatch = output.match(dbRegex);
    if (dbMatch) {
      const dbList = dbMatch[2].match(/\*\s+([^\s]+)/g);
      if (dbList) {
        databases.push(...dbList.map((db) => db.replace('* ', '').trim()));
      }
    }

    // Extract vulnerability info
    if (output.includes('injectable') || output.includes('vulnerable')) {
      vulnerable = true;
      const injectionMatch = output.match(/(\w+(?:\s+\w+)*)\s+injection/i);
      if (injectionMatch) {
        injectionType = injectionMatch[1];
      }
    }

    // Extract tables (if --tables was run)
    const tableRegex = /available tables \[(\d+)\]:\s*([\s\S]*?)(?=\n\n|\n[^\s*]|$)/;
    const tableMatch = output.match(tableRegex);
    if (tableMatch) {
      const tableList = tableMatch[2].match(/\*\s+([^\s]+)/g);
      if (tableList) {
        tables.push(...tableList.map((table) => table.replace('* ', '').trim()));
      }
    }

    return NextResponse.json({
      success: true,
      url: targetUrl,
      progress: {
        current: 100,
        total: 100,
        status: 'completed',
      },
      results: {
        vulnerable,
        injectionType,
        parameter: parameter || 'auto',
        databases,
        tables,
        rawOutput: output,
      },
      scanTime: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Progress tracking endpoint (for real-time updates)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json(
      { error: 'Task ID is required' },
      { status: 400 }
    );
  }

  // In a real implementation, you would track task progress
  // For now, return mock progress
  return NextResponse.json({
    taskId,
    progress: {
      current: 75,
      total: 100,
      status: 'in_progress',
      message: 'Scanning databases...',
    },
  });
}

