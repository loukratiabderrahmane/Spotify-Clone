// Spotify Web API Integration Service

const DEFAULT_TOKEN = 'BQAkjCPYxtRRGibJ1M1nJzCrvrkBg4_x0_447u-VtpOuRwY4a4ed0pFVo5NL-nwdBypK9gQcNOAP2ldXVkISQzfZdTA5W3oXfzrG3zafKVmGkZU_WaTb5EHYPTH_0X0Y43ats9OftwJi';

class SpotifyService {
  constructor() {
    this.token = localStorage.getItem('spotify_bearer_token') || DEFAULT_TOKEN;
  }

  getToken() {
    return this.token;
  }

  setToken(newToken) {
    if (newToken) {
      this.token = newToken.trim();
      localStorage.setItem('spotify_bearer_token', this.token);
    }
  }

  resetToken() {
    this.token = DEFAULT_TOKEN;
    localStorage.setItem('spotify_bearer_token', DEFAULT_TOKEN);
    return this.token;
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Validate the current or a new token with Spotify API
  async validateToken(tokenToTest = null) {
    const testToken = tokenToTest || this.token;
    try {
      const res = await fetch('https://api.spotify.com/v1/search?q=daft+punk&type=track&limit=1', {
        headers: {
          'Authorization': `Bearer ${testToken}`
        }
      });
      if (res.ok) {
        return { valid: true, status: res.status };
      }
      const data = await res.json().catch(() => ({}));
      return { 
        valid: false, 
        status: res.status, 
        error: data.error?.message || `HTTP ${res.status} Unauthorized` 
      };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  // Search Spotify for tracks, artists, and albums
  async search(query, limit = 20) {
    if (!query || !query.trim()) return { tracks: [], artists: [], albums: [] };
    const encoded = encodeURIComponent(query.trim());
    const url = `https://api.spotify.com/v1/search?q=${encoded}&type=track,artist,album&limit=${limit}`;

    const res = await fetch(url, { headers: this.getHeaders() });
    
    if (res.status === 401) {
      throw new Error('Spotify Bearer Token expired or invalid. Please update the token in Settings.');
    }
    if (!res.ok) {
      throw new Error(`Spotify API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return {
      tracks: (data.tracks?.items || []).map(item => this.normalizeTrack(item)),
      artists: (data.artists?.items || []).map(item => this.normalizeArtist(item)),
      albums: (data.albums?.items || []).map(item => this.normalizeAlbum(item))
    };
  }

  normalizeTrack(item) {
    const cover = item.album?.images?.[0]?.url || 
                  item.album?.images?.[1]?.url || 
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';
    
    return {
      id: `spotify-${item.id}`,
      spotifyId: item.id,
      name: item.name,
      artist: item.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
      artists: item.artists || [],
      album: item.album?.name || 'Unknown Album',
      albumId: item.album?.id,
      cover,
      audioUrl: item.preview_url || null, // Might be null due to recent Spotify API deprecation; handled by resolver
      duration: Math.round((item.duration_ms || 0) / 1000),
      spotifyUri: item.uri,
      externalUrl: item.external_urls?.spotify || `https://open.spotify.com/track/${item.id}`,
      source: 'spotify'
    };
  }

  normalizeArtist(item) {
    return {
      id: item.id,
      name: item.name,
      image: item.images?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      genres: item.genres || [],
      followers: item.followers?.total || 0,
      popularity: item.popularity || 0,
      externalUrl: item.external_urls?.spotify
    };
  }

  normalizeAlbum(item) {
    return {
      id: item.id,
      name: item.name,
      artist: item.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
      cover: item.images?.[0]?.url || '',
      releaseDate: item.release_date || '',
      totalTracks: item.total_tracks || 0,
      externalUrl: item.external_urls?.spotify
    };
  }
}

export const spotifyService = new SpotifyService();
export default spotifyService;

