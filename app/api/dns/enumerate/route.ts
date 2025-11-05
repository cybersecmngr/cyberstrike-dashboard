import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import dns from 'dns';
import { promisify as dnsPromisify } from 'util';

const execPromise = promisify(exec);
const resolve4 = dnsPromisify(dns.resolve4);
const resolve6 = dnsPromisify(dns.resolve6);
const resolveMx = dnsPromisify(dns.resolveMx);
const resolveTxt = dnsPromisify(dns.resolveTxt);
const resolveNs = dnsPromisify(dns.resolveNs);
const resolveCname = dnsPromisify(dns.resolveCname);

interface DNSRequest {
  domain: string;
  type?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DNSRequest = await request.json();
    const { domain, type = 'A' } = body;

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Sanitize domain
    const sanitizedDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '');

    const records: Array<{
      type: string;
      name: string;
      value: string;
      ttl?: number;
    }> = [];

    try {
      // Try Python script first (uses dnspython)
      try {
        const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
        
        if (pythonCheck.stdout) {
          try {
            const scriptPath = process.cwd() + '/scripts/dns_enum.py';
            const { stdout } = await execPromise(`python3 ${scriptPath} ${sanitizedDomain} ${type}`, {
              timeout: 15000,
            });
            
            const result = JSON.parse(stdout);
            if (result && result.records && result.records.length > 0) {
              return NextResponse.json({
                success: true,
                records: result.records,
              });
            }
          } catch {
            // Fall through to dig
          }
        }
      } catch {
        // Fall through
      }

      // Use dig if available (more detailed)
      const hasDig = await execPromise('which dig').then(() => true).catch(() => false);
      
      if (hasDig) {
        try {
          const { stdout } = await execPromise(`dig +short ${sanitizedDomain} ${type}`, {
            timeout: 10000,
          });
          
          const values = stdout.split('\n').filter(line => line.trim());
          values.forEach(value => {
            records.push({
              type,
              name: sanitizedDomain,
              value: value.trim(),
            });
          });
        } catch {
          // Fall through to Node.js dns module
        }
      }

      // Use Node.js dns module as fallback
      if (records.length === 0) {
        try {
          switch (type.toUpperCase()) {
            case 'A':
              const aRecords = await resolve4(sanitizedDomain);
              aRecords.forEach(ip => {
                records.push({ type: 'A', name: sanitizedDomain, value: ip });
              });
              break;
            case 'AAAA':
              const aaaaRecords = await resolve6(sanitizedDomain);
              aaaaRecords.forEach(ip => {
                records.push({ type: 'AAAA', name: sanitizedDomain, value: ip });
              });
              break;
            case 'MX':
              const mxRecords = await resolveMx(sanitizedDomain);
              mxRecords.forEach(mx => {
                records.push({ type: 'MX', name: sanitizedDomain, value: `${mx.priority} ${mx.exchange}` });
              });
              break;
            case 'TXT':
              const txtRecords = await resolveTxt(sanitizedDomain);
              txtRecords.forEach(txt => {
                records.push({ type: 'TXT', name: sanitizedDomain, value: Array.isArray(txt) ? txt.join(' ') : txt });
              });
              break;
            case 'NS':
              const nsRecords = await resolveNs(sanitizedDomain);
              nsRecords.forEach(ns => {
                records.push({ type: 'NS', name: sanitizedDomain, value: ns });
              });
              break;
            case 'CNAME':
              const cnameRecords = await resolveCname(sanitizedDomain);
              cnameRecords.forEach(cname => {
                records.push({ type: 'CNAME', name: sanitizedDomain, value: cname });
              });
              break;
            default:
              // Try A record as default
              const defaultRecords = await resolve4(sanitizedDomain);
              defaultRecords.forEach(ip => {
                records.push({ type: 'A', name: sanitizedDomain, value: ip });
              });
          }
        } catch {
          // Return mock data if DNS resolution fails
          return NextResponse.json({
            success: true,
            mock: true,
            records: [
              { type, name: sanitizedDomain, value: type === 'A' ? '192.0.2.1' : type === 'MX' ? '10 mail.example.com' : 'example value', ttl: 3600 },
            ],
            message: 'DNS resolution failed. Returning mock data.',
          });
        }
      }

      return NextResponse.json({
        success: true,
        records: records.length > 0 ? records : [
          { type, name: sanitizedDomain, value: 'No records found', ttl: 0 },
        ],
      });
    } catch {
      // Return mock data on error
      return NextResponse.json({
        success: true,
        mock: true,
        records: [
          { type, name: sanitizedDomain, value: type === 'A' ? '192.0.2.1' : type === 'MX' ? '10 mail.example.com' : 'example value', ttl: 3600 },
          { type, name: `www.${sanitizedDomain}`, value: type === 'A' ? '192.0.2.2' : 'example value', ttl: 3600 },
        ],
        message: 'DNS tools not available. Returning mock data.',
      });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

