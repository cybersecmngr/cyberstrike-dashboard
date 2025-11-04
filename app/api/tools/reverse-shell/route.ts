import { NextRequest, NextResponse } from 'next/server';
import { reverseShellManager } from '@/lib/custom-tools/reverse-shell';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'generate':
        const { language, host, port, encode, oneLiner } = params;
        if (!language || !host || !port) {
          return NextResponse.json(
            { error: 'Language, host, and port are required' },
            { status: 400 }
          );
        }
        
        const payload = reverseShellManager.generatePayload(
          language,
          host,
          port,
          { encode, oneLiner }
        );
        
        return NextResponse.json({
          success: true,
          payload,
        });

      case 'listen':
        const { port: listenPort, host: listenHost, protocol } = params;
        if (!listenPort) {
          return NextResponse.json(
            { error: 'Port is required' },
            { status: 400 }
          );
        }
        
        const session = await reverseShellManager.startListener(listenPort, {
          host: listenHost,
          protocol,
        });
        
        return NextResponse.json({
          success: true,
          session,
        });

      case 'stop':
        const { sessionId } = params;
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          );
        }
        
        const stopped = await reverseShellManager.stopListener(sessionId);
        
        return NextResponse.json({
          success: stopped,
        });

      case 'generate_all':
        const { host: allHost, port: allPort } = params;
        if (!allHost || !allPort) {
          return NextResponse.json(
            { error: 'Host and port are required' },
            { status: 400 }
          );
        }
        
        const payloads = reverseShellManager.generateEncodedPayloads(allHost, allPort);
        
        return NextResponse.json({
          success: true,
          payloads,
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
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
    const session = reverseShellManager.getSession(sessionId);
    return NextResponse.json({
      success: true,
      session,
    });
  }

  const sessions = reverseShellManager.getSessions();
  return NextResponse.json({
    success: true,
    sessions,
  });
}

