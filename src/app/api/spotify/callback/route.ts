import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: 'Authorization failed', details: error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  try {
    // Exchange code for tokens
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    // Use configured redirect URI instead of request.nextUrl.origin
    // This ensures the redirect URI matches what's configured in Spotify app settings
    // Falls back to the public domain if not configured
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'https://portfolio.ftmahringer.com/api/spotify/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Spotify credentials not configured' }, { status: 500 });
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error_description || data.error }, { status: 400 });
    }

    // Return the tokens in a user-friendly HTML page
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Authorization Success</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #1db954; }
            .token-box {
              background: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 15px;
              margin: 20px 0;
              word-break: break-all;
              font-family: monospace;
            }
            .label {
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .instructions {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            code {
              background: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Spotify Authorization Successful!</h1>
            
            <div class="instructions">
              <p><strong>📝 Next Steps:</strong></p>
              <p>Copy the <strong>Refresh Token</strong> below and add it to your <code>.env</code> file:</p>
            </div>

            <div class="label">Refresh Token (add this to .env):</div>
            <div class="token-box">${data.refresh_token}</div>

            <div class="label">Access Token (temporary, for testing):</div>
            <div class="token-box">${data.access_token}</div>

            <div class="instructions">
              <p><strong>Update your .env file:</strong></p>
              <p><code>SPOTIFY_REFRESH_TOKEN=${data.refresh_token}</code></p>
            </div>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Spotify OAuth error:', error);
    return NextResponse.json({ 
      error: 'Failed to exchange code for tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
