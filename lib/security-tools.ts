import { exec } from 'child_process';
import { promisify } from 'util';
import { executeCommand, sanitizeInput, isValidIP, isValidURL } from './api-utils';
import { XMLParser } from 'fast-xml-parser';

const execAsync = promisify(exec);

// Type definitions
export interface NmapResult {
  host: {
    address: string;
    hostnames?: string[];
    ports: Port[];
    os?: {
      osmatch: Array<{
        name: string;
        accuracy: string;
      }>;
    };
  };
  scanInfo: {
    type: string;
    protocol: string;
    numServices: number;
  };
}

export interface Port {
  portid: number;
  protocol: string;
  state: string;
  service?: {
    name: string;
    product?: string;
    version?: string;
    extrainfo?: string;
  };
}

export interface NiktoResult {
  host: string;
  port: number;
  vulnerabilities: Array<{
    id: string;
    severity: string;
    description: string;
    cve?: string;
    url: string;
  }>;
}

export interface GobusterResult {
  url: string;
  status: number;
  size: number;
  path: string;
}

export interface SQLMapResult {
  target: {
    url: string;
    data?: string;
  };
  type: string;
  technique: string[];
  parameter: string;
  vulnerable: boolean;
  databases?: string[];
  tables?: string[];
}

export interface HashcatResult {
  hash: string;
  cracked: boolean;
  plaintext?: string;
  algorithm: string;
}

export interface TcpdumpPacket {
  timestamp: string;
  protocol: string;
  src: string;
  dst: string;
  length: number;
  info: string;
}

/**
 * SecurityTools - Wrapper class for security testing tools
 */
export class SecurityTools {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
    });
  }

  /**
   * Nmap port scanning
   * @param target - IP address or hostname
   * @param ports - Port range (e.g., "1-1000", "80,443,8080")
   * @param options - Additional nmap options
   */
  async nmapScan(
    target: string,
    ports?: string,
    options: {
      scanType?: 'syn' | 'tcp' | 'udp' | 'ack' | 'fin' | 'xmas' | 'null';
      serviceVersion?: boolean;
      osDetection?: boolean;
      defaultScripts?: boolean;
      timeout?: number;
    } = {}
  ): Promise<NmapResult> {
    // Validation
    const sanitizedTarget = sanitizeInput(target);
    if (!isValidIP(sanitizedTarget) && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitizedTarget)) {
      throw new Error('Invalid target IP or hostname');
    }

    // Build command
    let cmd = 'nmap';
    
    // Scan type
    const scanFlags: Record<string, string> = {
      syn: '-sS',
      tcp: '-sT',
      udp: '-sU',
      ack: '-sA',
      fin: '-sF',
      xmas: '-sX',
      null: '-sN',
    };
    
    cmd += ` ${scanFlags[options.scanType || 'syn'] || '-sS'}`;
    
    // Service version detection
    if (options.serviceVersion !== false) {
      cmd += ' -sV';
    }
    
    // OS detection
    if (options.osDetection !== false) {
      cmd += ' -O';
    }
    
    // Default scripts
    if (options.defaultScripts !== false) {
      cmd += ' -sC';
    }
    
    // Ports
    if (ports) {
      const sanitizedPorts = sanitizeInput(ports);
      cmd += ` -p ${sanitizedPorts}`;
    } else {
      cmd += ' -p-'; // All ports
    }
    
    // Output XML
    cmd += ` -oX - ${sanitizedTarget}`;

    try {
      const result = await executeCommand(cmd, {
        timeout: options.timeout || 60000,
      });

      if (!result.success) {
        throw new Error(result.error || 'Nmap scan failed');
      }

      return this.parseNmapXML(result.stdout);
    } catch (error: any) {
      throw new Error(`Nmap scan error: ${error.message}`);
    }
  }

  /**
   * Parse Nmap XML output
   */
  private parseNmapXML(xml: string): NmapResult {
    try {
      const parsed = this.xmlParser.parse(xml);
      const nmaprun = parsed.nmaprun;

      if (!nmaprun.host) {
        return {
          host: {
            address: '',
            ports: [],
          },
          scanInfo: {
            type: nmaprun.scaninfo?.['@_type'] || 'unknown',
            protocol: nmaprun.scaninfo?.['@_protocol'] || 'tcp',
            numServices: parseInt(nmaprun.scaninfo?.['@_numservices'] || '0'),
          },
        };
      }

      const host = nmaprun.host;
      const address = host.address?.['@_addr'] || '';
      const hostnames = host.hostnames?.hostname
        ? Array.isArray(host.hostnames.hostname)
          ? host.hostnames.hostname.map((h: any) => h['@_name'])
          : [host.hostnames.hostname['@_name']]
        : [];

      const ports: Port[] = [];
      if (host.ports?.port) {
        const portArray = Array.isArray(host.ports.port) ? host.ports.port : [host.ports.port];
        ports.push(
          ...portArray.map((p: any) => ({
            portid: parseInt(p['@_portid']),
            protocol: p['@_protocol'],
            state: p.state?.['@_state'] || 'unknown',
            service: p.service
              ? {
                  name: p.service['@_name'] || '',
                  product: p.service['@_product'],
                  version: p.service['@_version'],
                  extrainfo: p.service['@_extrainfo'],
                }
              : undefined,
          }))
        );
      }

      return {
        host: {
          address,
          hostnames,
          ports,
          os: host.os?.osmatch
            ? {
                osmatch: Array.isArray(host.os.osmatch)
                  ? host.os.osmatch.map((o: any) => ({
                      name: o['@_name'],
                      accuracy: o['@_accuracy'],
                    }))
                  : [
                      {
                        name: host.os.osmatch['@_name'],
                        accuracy: host.os.osmatch['@_accuracy'],
                      },
                    ],
              }
            : undefined,
        },
        scanInfo: {
          type: nmaprun.scaninfo?.['@_type'] || 'unknown',
          protocol: nmaprun.scaninfo?.['@_protocol'] || 'tcp',
          numServices: parseInt(nmaprun.scaninfo?.['@_numservices'] || '0'),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to parse Nmap XML: ${error.message}`);
    }
  }

  /**
   * Nikto web vulnerability scan
   * @param target - URL to scan
   * @param options - Additional nikto options
   */
  async niktoScan(
    target: string,
    options: {
      port?: number;
      ssl?: boolean;
      timeout?: number;
    } = {}
  ): Promise<NiktoResult> {
    // Validation
    let targetUrl = target.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `http://${targetUrl}`;
    }

    if (!isValidURL(targetUrl)) {
      throw new Error('Invalid URL format');
    }

    // Build command
    let cmd = 'nikto';
    cmd += ` -h ${sanitizeInput(targetUrl)}`;
    cmd += ' -Format json';
    
    if (options.port) {
      cmd += ` -p ${options.port}`;
    }
    
    if (options.ssl) {
      cmd += ' -ssl';
    }

    try {
      const result = await executeCommand(cmd, {
        timeout: options.timeout || 120000,
      });

      if (!result.success && result.exitCode !== 0) {
        throw new Error(result.error || 'Nikto scan failed');
      }

      return this.parseNiktoJSON(result.stdout);
    } catch (error: any) {
      throw new Error(`Nikto scan error: ${error.message}`);
    }
  }

  /**
   * Parse Nikto JSON output
   */
  private parseNiktoJSON(json: string): NiktoResult {
    try {
      // Nikto JSON output can be malformed, try to extract valid JSON
      const jsonStart = json.indexOf('{');
      const jsonEnd = json.lastIndexOf('}') + 1;
      const validJson = json.substring(jsonStart, jsonEnd);

      const parsed = JSON.parse(validJson);
      const host = parsed.host || parsed['host'] || '';
      const port = parsed.port || parsed['port'] || 80;

      const vulnerabilities: NiktoResult['vulnerabilities'] = [];
      
      if (parsed.vulnerabilities) {
        parsed.vulnerabilities.forEach((vuln: any) => {
          vulnerabilities.push({
            id: vuln.id || `NIKTO-${vulnerabilities.length + 1}`,
            severity: vuln.severity || 'Unknown',
            description: vuln.description || vuln.method || '',
            cve: vuln.cve || null,
            url: vuln.url || host,
          });
        });
      }

      // Parse text output if JSON parsing fails
      if (vulnerabilities.length === 0) {
        const lines = json.split('\n');
        for (const line of lines) {
          if (line.includes('OSVDB') || line.includes('+')) {
            const severityMatch = line.match(/(Low|Medium|High|Critical)/i);
            const cveMatch = line.match(/CVE-\d{4}-\d+/);
            const osvdbMatch = line.match(/OSVDB-\d+/);

            if (severityMatch || osvdbMatch) {
              vulnerabilities.push({
                id: osvdbMatch ? osvdbMatch[0] : `NIKTO-${vulnerabilities.length + 1}`,
                severity: severityMatch ? severityMatch[0] : 'Unknown',
                description: line.trim(),
                cve: cveMatch ? cveMatch[0] : undefined,
                url: host,
              });
            }
          }
        }
      }

      return {
        host,
        port,
        vulnerabilities,
      };
    } catch (error: any) {
      throw new Error(`Failed to parse Nikto JSON: ${error.message}`);
    }
  }

  /**
   * Gobuster directory bruteforce
   * @param target - URL to scan
   * @param wordlist - Path to wordlist file
   * @param options - Additional gobuster options
   */
  async gobusterScan(
    target: string,
    wordlist: string,
    options: {
      extensions?: string[];
      statusCodes?: number[];
      threads?: number;
      timeout?: number;
    } = {}
  ): Promise<GobusterResult[]> {
    // Validation
    let targetUrl = target.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `http://${targetUrl}`;
    }

    if (!isValidURL(targetUrl)) {
      throw new Error('Invalid URL format');
    }

    // Build command
    let cmd = 'gobuster dir';
    cmd += ` -u ${sanitizeInput(targetUrl)}`;
    cmd += ` -w ${sanitizeInput(wordlist)}`;
    cmd += ' -q'; // Quiet mode
    cmd += ' -o -'; // Output to stdout
    
    if (options.extensions && options.extensions.length > 0) {
      cmd += ` -x ${options.extensions.join(',')}`;
    }
    
    if (options.statusCodes && options.statusCodes.length > 0) {
      cmd += ` -s ${options.statusCodes.join(',')}`;
    }
    
    if (options.threads) {
      cmd += ` -t ${options.threads}`;
    }

    try {
      const result = await executeCommand(cmd, {
        timeout: options.timeout || 300000,
      });

      if (!result.success) {
        throw new Error(result.error || 'Gobuster scan failed');
      }

      return this.parseGobusterOutput(result.stdout, targetUrl);
    } catch (error: any) {
      throw new Error(`Gobuster scan error: ${error.message}`);
    }
  }

  /**
   * Parse Gobuster output
   */
  private parseGobusterOutput(output: string, baseUrl: string): GobusterResult[] {
    const results: GobusterResult[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Gobuster output format: /path/to/file (Status: 200) [Size: 1234]
      const match = line.match(/^(.*?)\s+\(Status:\s*(\d+)\)\s+\[Size:\s*(\d+)\]/);
      
      if (match) {
        const [, path, status, size] = match;
        results.push({
          url: path.startsWith('http') ? path : `${baseUrl}${path}`,
          status: parseInt(status),
          size: parseInt(size),
          path: path,
        });
      }
    }

    return results;
  }

  /**
   * SQLMap SQL injection test
   * @param url - Target URL with parameter
   * @param params - Parameters to test
   * @param options - Additional sqlmap options
   */
  async sqlmapTest(
    url: string,
    params: string[],
    options: {
      level?: number;
      risk?: number;
      technique?: string[];
      timeout?: number;
    } = {}
  ): Promise<SQLMapResult> {
    // Validation
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `http://${targetUrl}`;
    }

    if (!isValidURL(targetUrl)) {
      throw new Error('Invalid URL format');
    }

    // Build command
    let cmd = 'sqlmap';
    cmd += ` -u "${sanitizeInput(targetUrl)}"`;
    cmd += ' --batch';
    cmd += ` --level=${Math.min(Math.max(options.level || 1, 1), 5)}`;
    cmd += ` --risk=${Math.min(Math.max(options.risk || 1, 1), 3)}`;
    
    if (options.technique && options.technique.length > 0) {
      cmd += ` -t ${options.technique.join(',')}`;
    }
    
    // Add parameter flags
    if (params.length > 0) {
      cmd += ` -p ${params.map(sanitizeInput).join(',')}`;
    }
    
    cmd += ' --dbs'; // Enumerate databases

    try {
      const result = await executeCommand(cmd, {
        timeout: options.timeout || 120000,
      });

      if (!result.success && result.exitCode !== 0) {
        throw new Error(result.error || 'SQLMap test failed');
      }

      return this.parseSQLMapOutput(result.stdout, targetUrl, params);
    } catch (error: any) {
      throw new Error(`SQLMap test error: ${error.message}`);
    }
  }

  /**
   * Parse SQLMap output
   */
  private parseSQLMapOutput(
    output: string,
    url: string,
    params: string[]
  ): SQLMapResult {
    const databases: string[] = [];
    const tables: string[] = [];
    let vulnerable = false;
    let injectionType = '';
    let technique: string[] = [];

    // Extract databases
    const dbRegex = /available databases \[(\d+)\]:\s*([\s\S]*?)(?=\n\n|\n[^\s*]|$)/;
    const dbMatch = output.match(dbRegex);
    if (dbMatch) {
      const dbList = dbMatch[2].match(/\*\s+([^\s]+)/g);
      if (dbList) {
        databases.push(...dbList.map((db) => db.replace('* ', '').trim()));
      }
    }

    // Extract injection type
    const injectionMatch = output.match(/(\w+(?:\s+\w+)*)\s+injection/i);
    if (injectionMatch) {
      injectionType = injectionMatch[1];
      vulnerable = true;
      
      // Extract technique
      if (output.includes('boolean-based')) technique.push('B');
      if (output.includes('error-based')) technique.push('E');
      if (output.includes('union-based')) technique.push('U');
      if (output.includes('stacked')) technique.push('S');
      if (output.includes('time-based')) technique.push('T');
    }

    // Extract tables
    const tableRegex = /available tables \[(\d+)\]:\s*([\s\S]*?)(?=\n\n|\n[^\s*]|$)/;
    const tableMatch = output.match(tableRegex);
    if (tableMatch) {
      const tableList = tableMatch[2].match(/\*\s+([^\s]+)/g);
      if (tableList) {
        tables.push(...tableList.map((table) => table.replace('* ', '').trim()));
      }
    }

    return {
      target: {
        url,
      },
      type: injectionType,
      technique,
      parameter: params.join(',') || 'auto',
      vulnerable,
      databases: databases.length > 0 ? databases : undefined,
      tables: tables.length > 0 ? tables : undefined,
    };
  }

  /**
   * Hashcat hash cracking
   * @param hash - Hash to crack
   * @param wordlist - Path to wordlist file
   * @param options - Hashcat options
   */
  async hashcatCrack(
    hash: string,
    wordlist: string,
    options: {
      mode?: number; // Hash mode (0=MD5, 1000=NTLM, etc.)
      timeout?: number;
    } = {}
  ): Promise<HashcatResult> {
    // Validation
    if (!hash || hash.trim().length === 0) {
      throw new Error('Hash is required');
    }

    const sanitizedHash = sanitizeInput(hash);
    const sanitizedWordlist = sanitizeInput(wordlist);
    const mode = options.mode || 0; // Default to MD5

    // Build command
    let cmd = `hashcat -m ${mode} ${sanitizedHash} ${sanitizedWordlist}`;
    cmd += ' --show'; // Show cracked hashes

    try {
      const result = await executeCommand(cmd, {
        timeout: options.timeout || 300000,
      });

      // Parse output
      const output = result.stdout.trim();
      const lines = output.split('\n');
      
      if (lines.length > 0 && lines[0].includes(':')) {
        const [hashPart, plaintext] = lines[0].split(':');
        return {
          hash: sanitizedHash,
          cracked: true,
          plaintext: plaintext || '',
          algorithm: this.getHashAlgorithm(mode),
        };
      }

      return {
        hash: sanitizedHash,
        cracked: false,
        algorithm: this.getHashAlgorithm(mode),
      };
    } catch (error: any) {
      // Hashcat might return error if hash not found, but that's okay
      return {
        hash: sanitizedHash,
        cracked: false,
        algorithm: this.getHashAlgorithm(mode),
      };
    }
  }

  /**
   * Get hash algorithm name from mode
   */
  private getHashAlgorithm(mode: number): string {
    const algorithms: Record<number, string> = {
      0: 'MD5',
      100: 'SHA1',
      1000: 'NTLM',
      1400: 'SHA256',
      1700: 'SHA512',
      3200: 'bcrypt',
      5000: 'SHA3-256',
    };
    return algorithms[mode] || `Mode ${mode}`;
  }

  /**
   * Tcpdump network packet capture
   * Note: Requires sudo permissions
   * @param interface - Network interface (e.g., "en0", "eth0")
   * @param filter - BPF filter (e.g., "tcp port 80")
   * @param options - Additional options
   */
  async tcpdumpCapture(
    interfaceName: string,
    filter?: string,
    options: {
      count?: number;
      timeout?: number;
    } = {}
  ): Promise<TcpdumpPacket[]> {
    // Validation
    const sanitizedInterface = sanitizeInput(interfaceName);
    const count = options.count || 100;

    // Build command
    let cmd = 'sudo tcpdump';
    cmd += ` -i ${sanitizedInterface}`;
    cmd += ` -c ${count}`;
    cmd += ' -n'; // Don't resolve hostnames
    cmd += ' -tttt'; // Print timestamp
    cmd += ' -A'; // Print ASCII
    
    if (filter) {
      cmd += ` ${sanitizeInput(filter)}`;
    }

    try {
      const result = await executeCommand(cmd, {
        timeout: options.timeout || 30000,
      });

      if (!result.success) {
        throw new Error(result.error || 'Tcpdump capture failed');
      }

      return this.parseTcpdumpOutput(result.stdout);
    } catch (error: any) {
      throw new Error(`Tcpdump capture error: ${error.message}`);
    }
  }

  /**
   * Parse tcpdump output
   */
  private parseTcpdumpOutput(output: string): TcpdumpPacket[] {
    const packets: TcpdumpPacket[] = [];
    const lines = output.split('\n');

    let currentPacket: Partial<TcpdumpPacket> = {};
    let packetData: string[] = [];

    for (const line of lines) {
      // Packet header line: timestamp IP protocol src > dst flags info
      const headerMatch = line.match(
        /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+)\s+IP\s+([\d.]+|[\w:]+)\s+>\s+([\d.]+|[\w:]+):\s+(\w+)\s+(.*)/
      );

      if (headerMatch) {
        // Save previous packet
        if (currentPacket.timestamp) {
          packets.push({
            timestamp: currentPacket.timestamp,
            protocol: currentPacket.protocol || 'unknown',
            src: currentPacket.src || '',
            dst: currentPacket.dst || '',
            length: currentPacket.length || 0,
            info: packetData.join(' ').substring(0, 200),
          });
        }

        // Start new packet
        const [, timestamp, src, dst, protocol, info] = headerMatch;
        currentPacket = {
          timestamp,
          protocol,
          src,
          dst,
          info,
          length: 0,
        };
        packetData = [];
      } else if (currentPacket.timestamp) {
        // Packet data line
        packetData.push(line.trim());
      }
    }

    // Save last packet
    if (currentPacket.timestamp) {
      packets.push({
        timestamp: currentPacket.timestamp,
        protocol: currentPacket.protocol || 'unknown',
        src: currentPacket.src || '',
        dst: currentPacket.dst || '',
        length: currentPacket.length || 0,
        info: packetData.join(' ').substring(0, 200),
      });
    }

    return packets;
  }
}

// Singleton instance
export const securityTools = new SecurityTools();

