'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Music, Circle } from 'lucide-react';

interface NowPlayingData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
  progress?: number;
  duration?: number;
}

export default function SpotifyNowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNowPlaying() {
      try {
        const response = await fetch('/api/spotify/now-playing');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching now playing:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNowPlaying();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.isPlaying) {
    return (
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Music className="w-5 h-5" />
          <div>
            <p className="font-medium">Not Playing</p>
            <p className="text-sm">No music playing right now</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-6 hover:border-accent transition-colors">
      <div className="flex items-start gap-4">
        {data.albumImageUrl && (
          <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
            <Image
              src={data.albumImageUrl}
              alt={data.album || 'Album art'}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Circle className="w-3 h-3 fill-green-500 text-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-500 uppercase tracking-wide">
              Now Playing
            </span>
          </div>
          
          <a
            href={data.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
              {data.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{data.artist}</p>
            <p className="text-xs text-muted-foreground truncate mt-1">{data.album}</p>
          </a>

          {data.progress !== undefined && data.duration !== undefined && (
            <div className="mt-3">
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${(data.progress / data.duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatDuration(data.progress)}</span>
                <span>{formatDuration(data.duration)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
