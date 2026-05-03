'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface VersionData {
  current: string;
  latest: string | null;
  updateAvailable: boolean;
  error?: string;
}

export function VersionInfo() {
  const [version, setVersion] = useState<VersionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVersion() {
      try {
        const response = await fetch('/api/version');
        const data = await response.json();
        setVersion(data);
      } catch (error) {
        console.error('Failed to fetch version:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVersion();
    // Check for updates every 5 minutes
    const interval = setInterval(fetchVersion, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !version) {
    return null;
  }

  if (version.updateAvailable && version.latest) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <span className="text-muted-foreground">v{version.current}</span>
        <span className="inline-flex items-center gap-1 text-yellow-500 hover:text-yellow-400 transition-colors" title={`Update available: v${version.latest}`}>
          <AlertCircle className="w-3 h-3" />
          <span className="hidden sm:inline">Update available</span>
        </span>
      </span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">
      v{version.current}
    </span>
  );
}
