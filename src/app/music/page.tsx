import { SpotifyNowPlaying, SpotifyTopArtists, SpotifyTopTracks } from '@/components/spotify';

export const metadata = {
  title: 'Music - Fynn Mahringer',
  description: 'My music taste and listening stats from Spotify',
};

export default function MusicPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Music</h1>
        <p className="text-lg text-muted-foreground">
          My music taste and what I&apos;m currently listening to on Spotify
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Now Playing - Full width on mobile, half on desktop */}
        <div className="lg:col-span-2">
          <SpotifyNowPlaying />
        </div>

        {/* Top Artists */}
        <div>
          <SpotifyTopArtists limit={5} timeRange="medium_term" />
        </div>

        {/* Top Tracks */}
        <div>
          <SpotifyTopTracks limit={10} timeRange="medium_term" />
        </div>
      </div>

      {/* Additional time ranges */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Favorites</h2>
          <p className="text-sm text-muted-foreground mb-4">Last 4 weeks</p>
          <div className="space-y-6">
            <SpotifyTopArtists limit={3} timeRange="short_term" />
            <SpotifyTopTracks limit={5} timeRange="short_term" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">All-Time Favorites</h2>
          <p className="text-sm text-muted-foreground mb-4">Since I joined Spotify</p>
          <div className="space-y-6">
            <SpotifyTopArtists limit={3} timeRange="long_term" />
            <SpotifyTopTracks limit={5} timeRange="long_term" />
          </div>
        </div>
      </div>
    </div>
  );
}
