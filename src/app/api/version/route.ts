import { NextResponse } from 'next/server';
import packageJson from '@/../package.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DockerHubTag {
  name: string;
  last_updated: string;
}

interface DockerHubResponse {
  results: DockerHubTag[];
}

export async function GET() {
  try {
    const currentVersion = packageJson.version;
    
    // Fetch latest version from Docker Hub
    const response = await fetch(
      'https://hub.docker.com/v2/repositories/ftmahringer/portfolio/tags?page_size=10',
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        current: currentVersion,
        latest: null,
        updateAvailable: false,
        error: 'Failed to fetch latest version',
      });
    }

    const data: DockerHubResponse = await response.json();
    
    // Find the latest semantic version tag (excluding 'latest')
    const versionTags = data.results
      .filter(tag => tag.name !== 'latest' && /^\d+\.\d+\.\d+$/.test(tag.name))
      .sort((a, b) => {
        const [aMajor, aMinor, aPatch] = a.name.split('.').map(Number);
        const [bMajor, bMinor, bPatch] = b.name.split('.').map(Number);
        
        if (aMajor !== bMajor) return bMajor - aMajor;
        if (aMinor !== bMinor) return bMinor - aMinor;
        return bPatch - aPatch;
      });

    const latestVersion = versionTags[0]?.name || currentVersion;
    const updateAvailable = compareVersions(latestVersion, currentVersion) > 0;

    return NextResponse.json({
      current: currentVersion,
      latest: latestVersion,
      updateAvailable,
    });
  } catch (error) {
    console.error('Error checking version:', error);
    return NextResponse.json({
      current: packageJson.version,
      latest: null,
      updateAvailable: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }

  return 0;
}
