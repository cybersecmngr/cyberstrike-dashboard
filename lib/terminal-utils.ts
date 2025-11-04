/**
 * Terminal Security Utilities
 * Security-focused functions for command sanitization and validation
 */

/**
 * Sanitize command input to prevent injection attacks
 */
export function sanitizeCommand(command: string): string | null {
  if (!command || typeof command !== 'string') {
    return null;
  }

  // Remove leading/trailing whitespace
  let sanitized = command.trim();

  // Remove multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Block command chaining attempts
  const dangerousPatterns = [
    /[;&|`$(){}[\]]/, // Command chaining characters
    /&&|\|\|/, // Logical operators
    />\s*>|<|>>/, // Redirection operators (except single >)
    /\$\{?[A-Z_]+\}?/, // Variable expansion
    /`[^`]*`/, // Command substitution
    /\$\([^)]*\)/, // Command substitution
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      return null;
    }
  }

  // Block comments
  if (sanitized.includes('#') && !sanitized.startsWith('#')) {
    return null;
  }

  // Block newlines and tabs
  if (sanitized.includes('\n') || sanitized.includes('\t') || sanitized.includes('\r')) {
    return null;
  }

  return sanitized;
}

/**
 * Check if a command is allowed based on whitelist and blacklist
 */
export function isCommandAllowed(
  command: string,
  allowedCommands: string[],
  blockedCommands: string[]
): boolean {
  // Extract base command (first word)
  const baseCommand = command.split(' ')[0].toLowerCase();

  // Check against blocked commands (substring match)
  for (const blocked of blockedCommands) {
    if (command.toLowerCase().includes(blocked.toLowerCase())) {
      return false;
    }
  }

  // Check against allowed commands (exact match for base command)
  const isAllowed = allowedCommands.some(
    (allowed) => baseCommand === allowed.toLowerCase()
  );

  if (!isAllowed) {
    // Allow some safe built-in shell commands
    const safeBuiltins = ['cd', 'pwd', 'echo', 'export', 'alias', 'unalias'];
    return safeBuiltins.includes(baseCommand);
  }

  return true;
}

/**
 * Sanitize command output to prevent XSS
 */
export function sanitizeOutput(output: string): string {
  if (!output) return '';

  return output
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Format command for display
 */
export function formatCommandPrompt(cwd: string): string {
  const shortPath = cwd.split('/').slice(-2).join('/') || '~';
  return `zencefil@cyberstrike:${shortPath}$ `;
}

/**
 * Parse command history
 */
export function parseCommandHistory(command: string): {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
} {
  const parts = command.trim().split(/\s+/);
  const cmd = parts[0] || '';
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('--')) {
      // Long flag: --flag=value or --flag
      const [key, value] = part.substring(2).split('=');
      flags[key] = value !== undefined ? value : true;
    } else if (part.startsWith('-')) {
      // Short flag: -f value or -f
      const key = part.substring(1);
      if (i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
        flags[key] = parts[++i];
      } else {
        flags[key] = true;
      }
    } else {
      args.push(part);
    }
  }

  return { command: cmd, args, flags };
}

/**
 * Auto-complete suggestions for commands
 */
export function getAutoCompleteSuggestions(
  partial: string,
  commandHistory: string[]
): string[] {
  if (!partial) return [];

  const suggestions: string[] = [];
  const lowerPartial = partial.toLowerCase();

  // Common commands
  const commonCommands = [
    'ls', 'cd', 'pwd', 'cat', 'grep', 'find', 'ps', 'top',
    'nmap', 'nikto', 'gobuster', 'sqlmap', 'hashcat',
    'ifconfig', 'netstat', 'ping', 'curl', 'wget',
    'python3', 'node', 'npm', 'git', 'docker',
    'ssh', 'scp', 'history', 'clear', 'help'
  ];

  // Match from common commands
  for (const cmd of commonCommands) {
    if (cmd.startsWith(lowerPartial)) {
      suggestions.push(cmd);
    }
  }

  // Match from history
  for (const cmd of commandHistory) {
    const baseCmd = cmd.split(' ')[0].toLowerCase();
    if (baseCmd.startsWith(lowerPartial) && !suggestions.includes(baseCmd)) {
      suggestions.push(baseCmd);
    }
  }

  return suggestions.slice(0, 10); // Limit to 10 suggestions
}

