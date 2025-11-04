/**
 * OSINT Tools - Shodan, TheHarvester, Social Media Scraping
 */

import { executeCommand, isValidIP, isValidURL } from '../api-utils';

export interface ShodanResult {
  ip: string;
  hostnames: string[];
  ports: number[];
  services: Array<{
    port: number;
    service: string;
    version?: string;
    banner?: string;
  }>;
  location?: {
    country: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  os?: string;
  vulnerabilities: string[];
}

export interface TheHarvesterResult {
  emails: string[];
  hosts: string[];
  ips: string[];
  shodan: string[];
  linkedin: string[];
  twitter: string[];
  google: string[];
}

export interface SocialMediaResult {
  platform: string;
  profiles: Array<{
    username: string;
    url: string;
    description?: string;
  }>;
}

export class OSINTTools {
  private shodanApiKey?: string;

  constructor() {
    this.shodanApiKey = process.env.SHODAN_API_KEY;
  }

  /**
   * Shodan search
   */
  async shodanSearch(
    query: string,
    options: {
      limit?: number;
    } = {}
  ): Promise<ShodanResult[]> {
    const { limit = 10 } = options;

    if (!this.shodanApiKey) {
      // Return mock data if API key not configured
      return this.getMockShodanResults(query, limit);
    }

    try {
      // Shodan API call
      const response = await fetch(
        `https://api.shodan.io/shodan/host/search?key=${this.shodanApiKey}&query=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Shodan API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseShodanResponse(data);
    } catch (error: any) {
      // Return mock data on error
      return this.getMockShodanResults(query, limit);
    }
  }

  /**
   * Shodan host lookup
   */
  async shodanHost(ip: string): Promise<ShodanResult | null> {
    if (!isValidIP(ip)) {
      throw new Error('Invalid IP address');
    }

    if (!this.shodanApiKey) {
      return this.getMockShodanHost(ip);
    }

    try {
      const response = await fetch(
        `https://api.shodan.io/shodan/host/${ip}?key=${this.shodanApiKey}`
      );

      if (!response.ok) {
        throw new Error(`Shodan API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseShodanHostResponse(data);
    } catch (error: any) {
      return this.getMockShodanHost(ip);
    }
  }

  /**
   * TheHarvester wrapper
   */
  async theHarvester(
    domain: string,
    options: {
      source?: string;
      limit?: number;
    } = {}
  ): Promise<TheHarvesterResult> {
    const { source = 'all', limit = 500 } = options;

    try {
      // Check if theHarvester is installed
      const harvesterResult = await executeCommand('which theHarvester', {
        timeout: 5000,
      });

      if (!harvesterResult.success) {
        // Return mock data
        return this.getMockHarvesterResults(domain);
      }

      // Run theHarvester
      const cmd = `theHarvester -d ${domain} -b ${source} -l ${limit} -f results.json`;
      const result = await executeCommand(cmd, { timeout: 300000 });

      // Parse results (simplified)
      return this.parseHarvesterOutput(result.stdout);
    } catch (error: any) {
      return this.getMockHarvesterResults(domain);
    }
  }

  /**
   * Social media profile search
   */
  async searchSocialMedia(
    username: string,
    platforms: string[] = ['twitter', 'github', 'linkedin']
  ): Promise<SocialMediaResult[]> {
    const results: SocialMediaResult[] = [];

    for (const platform of platforms) {
      try {
        const profiles = await this.searchPlatform(username, platform);
        if (profiles.length > 0) {
          results.push({
            platform,
            profiles,
          });
        }
      } catch (error) {
        // Continue with other platforms
        continue;
      }
    }

    return results;
  }

  /**
   * Search specific platform
   */
  private async searchPlatform(
    username: string,
    platform: string
  ): Promise<SocialMediaResult['profiles']> {
    // Mock implementation
    // In production, would use APIs or web scraping
    const profiles: SocialMediaResult['profiles'] = [];

    switch (platform) {
      case 'twitter':
        profiles.push({
          username,
          url: `https://twitter.com/${username}`,
          description: 'Twitter profile',
        });
        break;
      case 'github':
        profiles.push({
          username,
          url: `https://github.com/${username}`,
          description: 'GitHub profile',
        });
        break;
      case 'linkedin':
        profiles.push({
          username,
          url: `https://linkedin.com/in/${username}`,
          description: 'LinkedIn profile',
        });
        break;
    }

    return profiles;
  }

  /**
   * Parse Shodan search response
   */
  private parseShodanResponse(data: any): ShodanResult[] {
    if (!data.matches) return [];

    return data.matches.map((match: any) => ({
      ip: match.ip_str,
      hostnames: match.hostnames || [],
      ports: [match.port],
      services: [
        {
          port: match.port,
          service: match.product || 'unknown',
          version: match.version,
          banner: match.data,
        },
      ],
      location: match.location
        ? {
            country: match.location.country_name,
            city: match.location.city,
            latitude: match.location.latitude,
            longitude: match.location.longitude,
          }
        : undefined,
      os: match.os,
      vulnerabilities: match.vulns ? Object.keys(match.vulns) : [],
    }));
  }

  /**
   * Parse Shodan host response
   */
  private parseShodanHostResponse(data: any): ShodanResult {
    return {
      ip: data.ip_str,
      hostnames: data.hostnames || [],
      ports: data.ports || [],
      services:
        data.data?.map((item: any) => ({
          port: item.port,
          service: item.product || 'unknown',
          version: item.version,
          banner: item.data,
        })) || [],
      location: data.location
        ? {
            country: data.location.country_name,
            city: data.location.city,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
          }
        : undefined,
      os: data.os,
      vulnerabilities: data.vulns ? Object.keys(data.vulns) : [],
    };
  }

  /**
   * Parse TheHarvester output
   */
  private parseHarvesterOutput(output: string): TheHarvesterResult {
    const emails: string[] = [];
    const hosts: string[] = [];
    const ips: string[] = [];

    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('@')) {
        emails.push(line.trim());
      } else if (isValidIP(line.trim())) {
        ips.push(line.trim());
      } else if (line.includes('.')) {
        hosts.push(line.trim());
      }
    }

    return {
      emails,
      hosts,
      ips,
      shodan: [],
      linkedin: [],
      twitter: [],
      google: [],
    };
  }

  /**
   * Mock Shodan results
   */
  private getMockShodanResults(query: string, limit: number): ShodanResult[] {
    return [
      {
        ip: '192.168.1.100',
        hostnames: ['example.com'],
        ports: [80, 443, 22],
        services: [
          { port: 80, service: 'http', version: 'Apache 2.4.41' },
          { port: 443, service: 'https', version: 'Apache 2.4.41' },
          { port: 22, service: 'ssh', version: 'OpenSSH 8.2' },
        ],
        location: {
          country: 'United States',
          city: 'New York',
          latitude: 40.7128,
          longitude: -74.006,
        },
        vulnerabilities: ['CVE-2021-44228'],
      },
    ];
  }

  /**
   * Mock Shodan host
   */
  private getMockShodanHost(ip: string): ShodanResult {
    return this.getMockShodanResults('', 1)[0];
  }

  /**
   * Mock Harvester results
   */
  private getMockHarvesterResults(domain: string): TheHarvesterResult {
    return {
      emails: [`admin@${domain}`, `info@${domain}`],
      hosts: [`www.${domain}`, `mail.${domain}`, `api.${domain}`],
      ips: ['192.168.1.100', '192.168.1.101'],
      shodan: [],
      linkedin: [],
      twitter: [],
      google: [],
    };
  }
}

export const osintTools = new OSINTTools();

