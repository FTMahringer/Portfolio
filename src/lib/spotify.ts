/**
 * Spotify API Client
 * Handles authentication, token refresh, and API requests
 */

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

// Cache for access token
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get Spotify configuration from environment
 */
function getSpotifyConfig(): SpotifyConfig | null {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  return { clientId, clientSecret, refreshToken };
}

/**
 * Check if Spotify is configured
 */
export function isSpotifyConfigured(): boolean {
  return getSpotifyConfig() !== null;
}

/**
 * Get access token (handles refresh automatically)
 */
async function getAccessToken(): Promise<string> {
  const config = getSpotifyConfig();
  if (!config) {
    throw new Error('Spotify is not configured');
  }

  // Return cached token if still valid (with 5 minute buffer)
  const now = Date.now();
  if (cachedAccessToken && tokenExpiresAt > now + 5 * 60 * 1000) {
    return cachedAccessToken;
  }

  // Refresh token
  const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${authHeader}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Spotify token: ${response.statusText}`);
  }

  const data: SpotifyTokenResponse = await response.json();
  
  cachedAccessToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;

  return cachedAccessToken;
}

/**
 * Make authenticated request to Spotify API
 */
async function spotifyRequest<T>(endpoint: string): Promise<T> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get currently playing track
 */
export interface NowPlayingTrack {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
  progress?: number;
  duration?: number;
}

export async function getNowPlaying(): Promise<NowPlayingTrack> {
  if (!isSpotifyConfigured()) {
    return { isPlaying: false };
  }

  try {
    const response = await spotifyRequest<{
      is_playing: boolean;
      item?: {
        name: string;
        artists: Array<{ name: string }>;
        album: { name: string; images: Array<{ url: string }> };
        external_urls: { spotify: string };
        duration_ms: number;
      };
      progress_ms?: number;
    }>('/me/player/currently-playing');
    
    if (!response || !response.item) {
      return { isPlaying: false };
    }

    return {
      isPlaying: response.is_playing,
      title: response.item.name,
      artist: response.item.artists.map(artist => artist.name).join(', '),
      album: response.item.album.name,
      albumImageUrl: response.item.album.images[0]?.url,
      songUrl: response.item.external_urls.spotify,
      progress: response.progress_ms,
      duration: response.item.duration_ms,
    };
  } catch (error) {
    console.error('Error fetching now playing:', error);
    return { isPlaying: false };
  }
}

/**
 * Get top artists
 */
export interface SpotifyArtist {
  name: string;
  url: string;
  imageUrl?: string;
  genres: string[];
}

export async function getTopArtists(limit: number = 5, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyArtist[]> {
  if (!isSpotifyConfigured()) {
    return [];
  }

  try {
    const response = await spotifyRequest<{
      items: Array<{
        name: string;
        external_urls: { spotify: string };
        images: Array<{ url: string }>;
        genres: string[];
      }>;
    }>(`/me/top/artists?limit=${limit}&time_range=${timeRange}`);
    
    return response.items.map(artist => ({
      name: artist.name,
      url: artist.external_urls.spotify,
      imageUrl: artist.images[0]?.url,
      genres: artist.genres,
    }));
  } catch (error) {
    console.error('Error fetching top artists:', error);
    return [];
  }
}

/**
 * Get top tracks
 */
export interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  url: string;
  albumImageUrl?: string;
}

export async function getTopTracks(limit: number = 10, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[]> {
  if (!isSpotifyConfigured()) {
    return [];
  }

  try {
    const response = await spotifyRequest<{
      items: Array<{
        name: string;
        artists: Array<{ name: string }>;
        album: { name: string; images: Array<{ url: string }> };
        external_urls: { spotify: string };
      }>;
    }>(`/me/top/tracks?limit=${limit}&time_range=${timeRange}`);
    
    return response.items.map(track => ({
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      url: track.external_urls.spotify,
      albumImageUrl: track.album.images[0]?.url,
    }));
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return [];
  }
}

/**
 * Get recently played tracks
 */
export async function getRecentlyPlayed(limit: number = 5): Promise<SpotifyTrack[]> {
  if (!isSpotifyConfigured()) {
    return [];
  }

  try {
    const response = await spotifyRequest<{
      items: Array<{
        track: {
          name: string;
          artists: Array<{ name: string }>;
          album: { name: string; images: Array<{ url: string }> };
          external_urls: { spotify: string };
        };
      }>;
    }>(`/me/player/recently-played?limit=${limit}`);
    
    return response.items.map(item => ({
      name: item.track.name,
      artist: item.track.artists.map(artist => artist.name).join(', '),
      album: item.track.album.name,
      url: item.track.external_urls.spotify,
      albumImageUrl: item.track.album.images[0]?.url,
    }));
  } catch (error) {
    console.error('Error fetching recently played:', error);
    return [];
  }
}
