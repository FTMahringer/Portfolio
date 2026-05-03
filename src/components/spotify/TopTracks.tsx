'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Music2 } from 'lucide-react';

interface Track {
  name: string;
  artist: string;
  album: string;
  url: string;
  albumImageUrl?: string;
}

interface TopTracksProps {
  limit?: number;
  timeRange?: 'short_term' | 'medium_term' | 'long_term';
}

export default function SpotifyTopTracks({ limit = 10, timeRange = 'medium_term' }: TopTracksProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopTracks() {
      try {
        const response = await fetch(`/api/spotify/top-tracks?limit=${limit}&time_range=${timeRange}`);
        const result = await response.json();
        setTracks(result);
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopTracks();
  }, [limit, timeRange]);

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Music2 className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Top Tracks</h3>
        </div>
        <div className="space-y-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Music2 className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Top Tracks</h3>
        </div>
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-6 hover:border-accent transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <Music2 className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Top Tracks</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {timeRange === 'short_term' && 'Last 4 weeks'}
          {timeRange === 'medium_term' && 'Last 6 months'}
          {timeRange === 'long_term' && 'All time'}
        </span>
      </div>
      
      <div className="space-y-3">
        {tracks.map((track, index) => (
          <a
            key={track.url}
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <div className="flex-shrink-0 w-8 text-center font-bold text-lg text-muted-foreground">
              {index + 1}
            </div>
            
            {track.albumImageUrl ? (
              <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={track.albumImageUrl}
                  alt={track.album}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-12 h-12 flex-shrink-0 rounded bg-muted flex items-center justify-center">
                <Music2 className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground group-hover:text-accent transition-colors truncate">
                {track.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {track.artist}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
