#!/usr/bin/env node

/**
 * Spotify OAuth Helper Script
 * Generates a refresh token for accessing Spotify API
 * 
 * Usage: node scripts/spotify-auth.mjs
 */

import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  }
});

const CLIENT_ID = env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET;
// Use env var if set, otherwise default to localhost for local development
const REDIRECT_URI = env.SPOTIFY_REDIRECT_URI || 'http://localhost:3888/callback';
const SCOPES = 'user-read-currently-playing user-read-recently-played user-top-read';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env file');
  process.exit(1);
}

// Check if using production redirect URI
const isProduction = REDIRECT_URI !== 'http://localhost:3888/callback';

console.log('🎵 Spotify OAuth Helper\n');

if (isProduction) {
  console.log('⚠️  Production mode detected!');
  console.log(`   Using redirect URI: ${REDIRECT_URI}\n`);
  console.log('   This script will generate an authorization URL.');
  console.log('   Visit the URL in your browser to complete OAuth.\n');
} else {
  console.log('📋 Before continuing, make sure you have added this redirect URI to your Spotify app:');
  console.log(`   ${REDIRECT_URI}\n`);
  console.log('   1. Go to https://developer.spotify.com/dashboard');
  console.log('   2. Select your app');
  console.log('   3. Click "Edit Settings"');
  console.log('   4. Add the redirect URI above to "Redirect URIs"');
  console.log('   5. Save\n');
}

// For production mode, just print the URL and exit
if (isProduction) {
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', SCOPES);

  console.log('🔗 Authorization URL:\n');
  console.log(authUrl.toString());
  console.log('\n');
  console.log('📋 Next steps:');
  console.log('   1. Visit the URL above in your browser');
  console.log('   2. Authorize the app');
  console.log('   3. Copy the refresh token from the success page');
  console.log('   4. Add it to your environment as SPOTIFY_REFRESH_TOKEN\n');
  process.exit(0);
}

// Create HTTP server to handle OAuth callback (local development only)
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    
    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>Error: No authorization code received</h1>');
      server.close();
      return;
    }

    try {
      // Exchange code for tokens
      const tokenUrl = 'https://accounts.spotify.com/api/token';
      const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authHeader}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error_description || data.error);
      }

      // Update .env file with refresh token
      const updatedEnv = envContent.replace(
        /SPOTIFY_REFRESH_TOKEN=.*/,
        `SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`
      );
      fs.writeFileSync(envPath, updatedEnv);

      console.log('\n✅ Success! Refresh token saved to .env file');
      console.log(`\nSPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>Success!</title></head>
          <body style="font-family: system-ui; padding: 2rem; text-align: center;">
            <h1>✅ Success!</h1>
            <p>Your Spotify refresh token has been saved to .env</p>
            <p>You can close this window and return to the terminal.</p>
          </body>
        </html>
      `);

      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);

    } catch (error) {
      console.error('\n❌ Error exchanging code for token:', error.message);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>Error: ${error.message}</h1>`);
      server.close();
      process.exit(1);
    }
  }
});

// Start server
server.listen(3888, () => {
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', SCOPES);

  console.log('🚀 Starting authorization flow...\n');
  console.log('Opening browser to authenticate with Spotify...');
  console.log('If the browser does not open, visit this URL:\n');
  console.log(authUrl.toString());
  console.log('\n');

  // Open browser
  const platform = process.platform;
  const cmd = platform === 'win32' ? 'start' : platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${cmd} "${authUrl.toString()}"`);
});

// Handle errors
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});
