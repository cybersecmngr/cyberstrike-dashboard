import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
}

/**
 * Safely execute shell commands with timeout
 */
export async function executeCommand(
  command: string,
  options: {
    timeout?: number;
    maxBuffer?: number;
    env?: NodeJS.ProcessEnv;
  } = {}
): Promise<CommandResult> {
  const { timeout = 30000, maxBuffer = 10 * 1024 * 1024, env } = options;

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout,
      maxBuffer,
      env: { ...process.env, ...env },
    });

    return {
      success: true,
      stdout,
      stderr,
      exitCode: 0,
    };
  } catch (error: any) {
    return {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.code || 1,
      error: error.message,
    };
  }
}

/**
 * Sanitize input to prevent command injection
 */
export function sanitizeInput(input: string): string {
  // Remove dangerous characters
  return input.replace(/[;&|`$(){}[\]<>]/g, '');
}

/**
 * Validate IP address
 */
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if tool is installed
 */
export async function isToolInstalled(tool: string): Promise<boolean> {
  try {
    const result = await executeCommand(`which ${tool}`, { timeout: 5000 });
    return result.success && result.stdout.trim().length > 0;
  } catch {
    return false;
  }
}

