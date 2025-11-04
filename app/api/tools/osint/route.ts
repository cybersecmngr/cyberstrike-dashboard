import { NextRequest, NextResponse } from 'next/server';
import { osintTools } from '@/lib/custom-tools/osint';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'shodan_search':
        const { query, limit } = params;
        if (!query) {
          return NextResponse.json(
            { error: 'Query is required' },
            { status: 400 }
          );
        }
        
        const shodanResults = await osintTools.shodanSearch(query, { limit });
        
        return NextResponse.json({
          success: true,
          results: shodanResults,
        });

      case 'shodan_host':
        const { ip } = params;
        if (!ip) {
          return NextResponse.json(
            { error: 'IP address is required' },
            { status: 400 }
          );
        }
        
        const hostResult = await osintTools.shodanHost(ip);
        
        return NextResponse.json({
          success: true,
          result: hostResult,
        });

      case 'harvester':
        const { domain, source, limit: harvesterLimit } = params;
        if (!domain) {
          return NextResponse.json(
            { error: 'Domain is required' },
            { status: 400 }
          );
        }
        
        const harvesterResults = await osintTools.theHarvester(domain, {
          source,
          limit: harvesterLimit,
        });
        
        return NextResponse.json({
          success: true,
          results: harvesterResults,
        });

      case 'social_media':
        const { username, platforms } = params;
        if (!username) {
          return NextResponse.json(
            { error: 'Username is required' },
            { status: 400 }
          );
        }
        
        const socialResults = await osintTools.searchSocialMedia(
          username,
          platforms || ['twitter', 'github', 'linkedin']
        );
        
        return NextResponse.json({
          success: true,
          results: socialResults,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const query = searchParams.get('q');
  const ip = searchParams.get('ip');
  const domain = searchParams.get('domain');
  const username = searchParams.get('username');

  if (action === 'shodan_host' && ip) {
    const result = await osintTools.shodanHost(ip);
    return NextResponse.json({
      success: true,
      result,
    });
  }

  if (action === 'shodan_search' && query) {
    const results = await osintTools.shodanSearch(query);
    return NextResponse.json({
      success: true,
      results,
    });
  }

  if (action === 'harvester' && domain) {
    const results = await osintTools.theHarvester(domain);
    return NextResponse.json({
      success: true,
      results,
    });
  }

  if (action === 'social_media' && username) {
    const results = await osintTools.searchSocialMedia(username);
    return NextResponse.json({
      success: true,
      results,
    });
  }

  return NextResponse.json(
    { error: 'Invalid parameters' },
    { status: 400 }
  );
}

