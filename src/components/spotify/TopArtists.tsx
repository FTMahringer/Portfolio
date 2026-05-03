'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Users } from 'lucide-react';

interface Artist {
  name: string;
  url: string;
  imageUrl?: string;
  genres: string[];
}

interface TopArtistsProps {
  limit?: number;
  timeRange?: 'short_term' | 'medium_term' | 'long_term';
}

export default function SpotifyTopArtists({ limit = 5, timeRange = 'medium_term' }: TopArtistsProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopArtists() {
      try {
        const response = await fetch(`/api/spotify/top-artists?limit=${limit}&time_range=${timeRange}`);
        const result = await response.json();
        setArtists(result);
      } catch (error) {
        console.error('Error fetching top artists:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopArtists();
  }, [limit, timeRange]);

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Top Artists</h3>
        </div>
        <div className="space-y-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Top Artists</h3>
        </div>
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-6 hover:border-accent transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Top Artists</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {timeRange === 'short_term' && 'Last 4 weeks'}
          {timeRange === 'medium_term' && 'Last 6 months'}
          {timeRange === 'long_term' && 'All time'}
        </span>
      </div>
      
      <div className="space-y-3">
        {artists.map((artist, index) => (
          <a
            key={artist.url}
            href={artist.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <div className="flex-shrink-0 w-8 text-center font-bold text-lg text-muted-foreground">
              {index + 1}
            </div>
            
            {artist.imageUrl ? (
              <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden">
                <Image
                  src={artist.imageUrl}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground group-hover:text-accent transition-colors truncate">
                {artist.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {artist.genres.slice(0, 2).join(', ') || 'Artist'}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
