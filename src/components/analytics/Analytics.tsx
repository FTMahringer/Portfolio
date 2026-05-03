'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface AnalyticsConfig {
  provider: 'umami' | 'plausible' | 'none';
  umami?: {
    enabled: boolean;
    websiteId: string;
    scriptUrl: string;
  };
  plausible?: {
    enabled: boolean;
    domain: string;
    scriptUrl: string;
  };
}

interface AnalyticsProps {
  config: AnalyticsConfig;
}

export function Analytics({ config }: AnalyticsProps) {
  // Only run analytics in production
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    if (!isProduction) {
      console.log('[Analytics] Disabled in development mode');
    }
  }, [isProduction]);

  if (!isProduction || config.provider === 'none') {
    return null;
  }

  // Umami Analytics
  if (config.provider === 'umami' && config.umami?.enabled && config.umami.websiteId) {
    return (
      <Script
        async
        src={config.umami.scriptUrl}
        data-website-id={config.umami.websiteId}
        strategy="afterInteractive"
      />
    );
  }

  // Plausible Analytics
  if (config.provider === 'plausible' && config.plausible?.enabled && config.plausible.domain) {
    return (
      <Script
        async
        defer
        data-domain={config.plausible.domain}
        src={config.plausible.scriptUrl}
        strategy="afterInteractive"
      />
    );
  }

  return null;
}
