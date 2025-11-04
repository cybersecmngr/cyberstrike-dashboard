import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { sanitizeCommand, isCommandAllowed } from '@/lib/terminal-utils';

const execAsync = promisify(exec);

// Whitelist of allowed commands for security
const ALLOWED_COMMANDS = [
  'ls', 'cd', 'pwd', 'cat', 'grep', 'find', 'ps', 'top', 'df', 'du',
  'whoami', 'hostname', 'uname', 'date', 'echo', 'which', 'whereis',
  'nmap', 'nikto', 'gobuster', 'sqlmap', 'hashcat', 'tcpdump',
  'ifconfig', 'netstat', 'ss', 'ping', 'curl', 'wget',
  'python3', 'python', 'node', 'npm', 'git', 'docker', 'kubectl',
  'ssh', 'scp', 'rsync',
  'cat', 'head', 'tail', 'less', 'more', 'grep', 'awk', 'sed',
  'tar', 'zip', 'unzip', 'gzip',
  'history', 'clear', 'help'
];

// Dangerous commands to block
const BLOCKED_COMMANDS = [
  'rm -rf', 'rm -r', 'rm -f', 'rmdir', 'del', 'format',
  'sudo', 'su', 'chmod 777', 'chown', 'chmod +x',
  'dd if=', 'mkfs', 'fdisk', 'parted',
  'shutdown', 'reboot', 'halt', 'poweroff',
  'curl.*-X.*DELETE', 'wget.*--delete',
  '> /dev/', '>> /dev/', '&> /dev/'
];

export async function POST(request: NextRequest) {
  try {
    const { command, cwd } = await request.json();

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    // Security: Sanitize and validate command
    const sanitized = sanitizeCommand(command);
    
    if (!sanitized) {
      return NextResponse.json(
        { error: 'Invalid command format' },
        { status: 400 }
      );
    }

    // Check if command is allowed
    if (!isCommandAllowed(sanitized, ALLOWED_COMMANDS, BLOCKED_COMMANDS)) {
      return NextResponse.json(
        { error: 'Command not allowed for security reasons' },
        { status: 403 }
      );
    }

    // Security: Limit command execution time
    const timeout = 30000; // 30 seconds

    // Execute command with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const { stdout, stderr } = await execAsync(sanitized, {
        cwd: cwd || process.cwd(),
        maxBuffer: 1024 * 1024, // 1MB max output
        signal: controller.signal,
        env: {
          ...process.env,
          // Limit environment variables exposure
          PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
        },
      });

      clearTimeout(timeoutId);

      return NextResponse.json({
        success: true,
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: 0,
      });
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error.signal === 'SIGTERM') {
        return NextResponse.json(
          { error: 'Command execution timeout' },
          { status: 408 }
        );
      }

      // Handle other execution errors
      return NextResponse.json({
        success: false,
        stdout: '',
        stderr: error.message || 'Command execution failed',
        exitCode: error.code || 1,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

