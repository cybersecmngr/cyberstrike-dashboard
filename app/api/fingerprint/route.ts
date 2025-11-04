import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return fingerprint configuration options
    return NextResponse.json({
      success: true,
      options: {
        userAgent: [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        ],
        languages: ['en-US', 'en-GB', 'tr-TR', 'de-DE', 'fr-FR'],
        timezone: ['America/New_York', 'Europe/London', 'Europe/Istanbul', 'Asia/Tokyo'],
        screenResolution: ['1920x1080', '1366x768', '2560x1440', '1440x900'],
        platform: ['Win32', 'MacIntel', 'Linux x86_64'],
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get fingerprint options';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAgent, language, timezone, screenResolution, platform } = body;

    // Generate fingerprint script that can be injected into browser
    const fingerprintScript = `
      // Fingerprint spoofing script
      Object.defineProperty(navigator, 'userAgent', {
        get: () => '${userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}',
        configurable: true
      });
      
      Object.defineProperty(navigator, 'language', {
        get: () => '${language || 'en-US'}',
        configurable: true
      });
      
      Object.defineProperty(navigator, 'platform', {
        get: () => '${platform || 'Win32'}',
        configurable: true
      });
      
      // Canvas fingerprint spoofing
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function() {
        const context = this.getContext('2d');
        if (context) {
          const imageData = context.getImageData(0, 0, this.width, this.height);
          // Add noise to canvas fingerprint
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] += Math.floor(Math.random() * 3) - 1;
          }
          context.putImageData(imageData, 0, 0);
        }
        return originalToDataURL.apply(this, arguments);
      };
      
      // WebGL fingerprint spoofing
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
          return 'Intel Inc.';
        }
        if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
          return 'Intel Iris OpenGL Engine';
        }
        return getParameter.apply(this, arguments);
      };
    `;

    return NextResponse.json({
      success: true,
      message: 'Fingerprint spoofing script generated',
      script: fingerprintScript,
      config: {
        userAgent: userAgent || 'Default',
        language: language || 'en-US',
        timezone: timezone || 'UTC',
        screenResolution: screenResolution || '1920x1080',
        platform: platform || 'Win32',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate fingerprint';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

