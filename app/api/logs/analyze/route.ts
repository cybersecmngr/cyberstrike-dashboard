import { NextRequest, NextResponse } from 'next/server';

interface LogAnalysisRequest {
  logs: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LogAnalysisRequest = await request.json();
    const { logs } = body;

    if (!logs || !logs.trim()) {
      return NextResponse.json(
        { success: false, error: 'Log content is required' },
        { status: 400 }
      );
    }

    const lines = logs.split('\n').filter(line => line.trim());
    const entries: Array<{
      timestamp: string;
      level: 'error' | 'warning' | 'info' | 'success';
      message: string;
      source?: string;
      ip?: string;
    }> = [];

    let errors = 0;
    let warnings = 0;
    let info = 0;
    let success = 0;

    // Parse log lines
    for (const line of lines) {
      // Common log patterns
      const timestampMatch = line.match(/\[?(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})/);
      const ipMatch = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      
      let level: 'error' | 'warning' | 'info' | 'success' = 'info';
      if (line.match(/error|ERROR|Error|failed|FAILED|exception|Exception/i)) {
        level = 'error';
        errors++;
      } else if (line.match(/warn|WARN|warning|WARNING/i)) {
        level = 'warning';
        warnings++;
      } else if (line.match(/success|SUCCESS|ok|OK|200|successful/i)) {
        level = 'success';
        success++;
      } else {
        info++;
      }

      const sourceMatch = line.match(/\[([^\]]+)\]/);
      
      entries.push({
        timestamp: timestampMatch ? timestampMatch[1] : new Date().toISOString(),
        level,
        message: line.length > 200 ? line.substring(0, 200) + '...' : line,
        source: sourceMatch ? sourceMatch[1] : undefined,
        ip: ipMatch ? ipMatch[1] : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      entries: entries.slice(0, 500), // Limit to 500 entries
      stats: {
        total: entries.length,
        errors,
        warnings,
        info,
        success,
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

