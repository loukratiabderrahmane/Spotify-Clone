import { reactive } from 'vue';
import { DAFT_PUNK_TRACKS, CURATED_PLAYLISTS } from '../services/defaultCatalog.js';
import { spotifyService } from '../services/spotifyService.js';
import { musicService } from '../services/musicService.js';

// Load saved data from localStorage with auto-migration of stale audio URLs
const loadSaved = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);

    // Sanitize liked songs against stale rotated preview URLs
    if (key === 'spotify_liked' && Array.isArray(parsed)) {
      return parsed.map(track => {
        const match = DAFT_PUNK_TRACKS.find(d => d.id === track.id || d.name === track.name);
        if (match && match.audioUrl) {
          return { ...track, audioUrl: match.audioUrl, cover: match.cover };
        }
        return track;
      });
    }

    return parsed;
  } catch (e) {
    return fallback;
  }
};

const save = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

const defaultCustomPlaylists = [
  {
    id: 'user-playlist-1',
    title: 'Daft Punk & French Electro',
    description: 'My favorite Daft Punk dance tracks and funky grooves.',
    cover: DAFT_PUNK_TRACKS[0].cover,
    color: '#E91429',
    creator: 'You',
    createdAt: new Date().toLocaleDateString(),
    tracks: [DAFT_PUNK_TRACKS[0], DAFT_PUNK_TRACKS[1], DAFT_PUNK_TRACKS[2]]
  }
];

export const state = reactive({
  // Playback state
  currentTrack: DAFT_PUNK_TRACKS[0],
  isPlaying: false,
  currentTime: 0,
  duration: 337,
  volume: Number(loadSaved('spotify_volume', 0.8)),
  isMuted: false,
  previousVolume: 0.8,
  shuffle: false,
  repeatMode: 'off', // 'off' | 'all' | 'one'
  isLoadingAudio: false,
  hasRetriedCurrentTrack: false,

  // Queue & History
  queue: [...DAFT_PUNK_TRACKS],
  queueIndex: 0,
  history: loadSaved('spotify_history', []),

  // User Library
  likedTracks: loadSaved('spotify_liked', [DAFT_PUNK_TRACKS[0], DAFT_PUNK_TRACKS[1]]),
  customPlaylists: loadSaved('spotify_playlists', defaultCustomPlaylists),
  
  // Navigation & Views
  activeView: 'home', // 'home' | 'search' | 'playlist' | 'liked' | 'lyrics'
  activePlaylist: CURATED_PLAYLISTS[0],
  searchQuery: '',
  searchSource: 'itunes', // 'itunes' (Instant Public API) or 'spotify' (Bearer Token API)

  // Spotify Auth & Status
  spotifyToken: spotifyService.getToken(),
  spotifyStatus: 'active', // 'active' | 'invalid' | 'checking'
  spotifyError: null,

  // UI Modals & Drawers
  showTokenModal: false,
  showCreatePlaylistModal: false,
  showAddToPlaylistModal: false,
  selectedTrackForPlaylist: null,
  showQueueDrawer: false,
  showLyricsView: false,
  showMiniPlayer: false,
  isFullscreen: false,

  // Notification Toast
  toast: {
    show: false,
    message: '',
    type: 'info' // 'info' | 'success' | 'error'
  }
});

// Audio HTML5 element instance
let audio = new Audio();
audio.preload = 'auto';

export const playerStore = {
  state,

  initAudio() {
    audio.volume = state.volume;

    audio.addEventListener('timeupdate', () => {
      state.currentTime = audio.currentTime;
      if (audio.duration && !isNaN(audio.duration)) {
        state.duration = audio.duration;
      }
    });

    audio.addEventListener('play', () => {
      state.isPlaying = true;
      state.isLoadingAudio = false;
    });

    audio.addEventListener('pause', () => {
      state.isPlaying = false;
    });

    audio.addEventListener('ended', () => {
      if (state.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      } else {
        this.nextTrack();
      }
    });

    // Smart auto-recovery on audio stream error (e.g. expired CDN token)
    audio.addEventListener('error', async (e) => {
      console.warn('Audio stream error, automatically resolving fresh live stream:', e);
      if (state.currentTrack && !state.hasRetriedCurrentTrack) {
        state.hasRetriedCurrentTrack = true;
        state.isLoadingAudio = true;
        this.showToast(`Re-syncing audio stream for "${state.currentTrack.name}"...`, 'info');

        const freshUrl = await musicService.resolveAudioPreview(state.currentTrack, true);
        if (freshUrl && freshUrl !== audio.src) {
          state.currentTrack.audioUrl = freshUrl;
          audio.src = freshUrl;
          audio.load();
          try {
            await audio.play();
            state.isPlaying = true;
            state.isLoadingAudio = false;
            return;
          } catch (err) {
            console.warn('Playback error after auto-recovery:', err);
          }
        }
      }

      state.isLoadingAudio = false;
      this.showToast('Audio preview unavailable for this track', 'error');
    });

    // Setup media session metadata
    if ('mediaSession' in navigator) {
      this.updateMediaSession();
    }

    // Set initial audio source with fresh URL
    if (state.currentTrack && state.currentTrack.audioUrl) {
      audio.src = state.currentTrack.audioUrl;
    }
  },

  async playTrack(track, queueList = null) {
    if (!track) return;
    state.hasRetriedCurrentTrack = false;

    if (queueList && Array.isArray(queueList) && queueList.length > 0) {
      state.queue = [...queueList];
      const foundIdx = state.queue.findIndex(t => t.id === track.id);
      state.queueIndex = foundIdx !== -1 ? foundIdx : 0;
    } else {
      const existingIdx = state.queue.findIndex(t => t.id === track.id);
      if (existingIdx !== -1) {
        state.queueIndex = existingIdx;
      } else {
        state.queue.splice(state.queueIndex + 1, 0, track);
        state.queueIndex += 1;
      }
    }

    state.currentTrack = track;
    state.isLoadingAudio = true;

    // Check if playable preview is present. If missing (or from Spotify search), resolve it!
    let streamUrl = track.audioUrl;
    if (!streamUrl) {
      this.showToast(`Loading audio for "${track.name}"...`, 'info');
      streamUrl = await musicService.resolveAudioPreview(track);
    }

    if (streamUrl) {
      audio.src = streamUrl;
      audio.load();
      try {
        await audio.play();
        state.isPlaying = true;
        this.addToHistory(track);
        this.updateMediaSession();
      } catch (err) {
        console.warn('Play prevented or interrupted:', err);
        state.isPlaying = false;
      }
    } else {
      this.showToast(`Audio preview not available for "${track.name}"`, 'error');
    }

    state.isLoadingAudio = false;
  },

  togglePlay() {
    if (!state.currentTrack) {
      if (state.queue.length > 0) {
        this.playTrack(state.queue[0]);
      }
      return;
    }

    if (state.isPlaying) {
      audio.pause();
    } else {
      if (!audio.src && state.currentTrack.audioUrl) {
        audio.src = state.currentTrack.audioUrl;
      }
      audio.play().catch(err => {
        console.warn('Failed to resume playback:', err);
      });
    }
  },

  pause() {
    audio.pause();
  },

  resume() {
    audio.play().catch(console.warn);
  },

  nextTrack() {
    if (state.queue.length === 0) return;

    if (state.shuffle) {
      let nextIdx = Math.floor(Math.random() * state.queue.length);
      if (state.queue.length > 1 && nextIdx === state.queueIndex) {
        nextIdx = (nextIdx + 1) % state.queue.length;
      }
      state.queueIndex = nextIdx;
      this.playTrack(state.queue[state.queueIndex]);
      return;
    }

    if (state.queueIndex < state.queue.length - 1) {
      state.queueIndex += 1;
      this.playTrack(state.queue[state.queueIndex]);
    } else if (state.repeatMode === 'all') {
      state.queueIndex = 0;
      this.playTrack(state.queue[0]);
    } else {
      audio.pause();
      state.isPlaying = false;
    }
  },

  prevTrack() {
    if (state.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (state.queueIndex > 0) {
      state.queueIndex -= 1;
      this.playTrack(state.queue[state.queueIndex]);
    } else {
      audio.currentTime = 0;
    }
  },

  seek(seconds) {
    if (isNaN(seconds)) return;
    const target = Math.max(0, Math.min(seconds, state.duration));
    audio.currentTime = target;
    state.currentTime = target;
  },

  setVolume(level) {
    const vol = Math.max(0, Math.min(1, level));
    state.volume = vol;
    state.isMuted = vol === 0;
    audio.volume = vol;
    save('spotify_volume', vol);
  },

  toggleMute() {
    if (state.isMuted) {
      this.setVolume(state.previousVolume || 0.8);
      state.isMuted = false;
    } else {
      state.previousVolume = state.volume > 0 ? state.volume : 0.8;
      this.setVolume(0);
      state.isMuted = true;
    }
  },

  toggleShuffle() {
    state.shuffle = !state.shuffle;
    this.showToast(state.shuffle ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
  },

  toggleRepeat() {
    if (state.repeatMode === 'off') {
      state.repeatMode = 'all';
      this.showToast('Repeat all', 'info');
    } else if (state.repeatMode === 'all') {
      state.repeatMode = 'one';
      this.showToast('Repeat one', 'info');
    } else {
      state.repeatMode = 'off';
      this.showToast('Repeat off', 'info');
    }
  },

  // Library & Likes
  isLiked(track) {
    if (!track) return false;
    return state.likedTracks.some(t => t.id === track.id || (t.name === track.name && t.artist === track.artist));
  },

  toggleLike(track) {
    if (!track) return;
    const index = state.likedTracks.findIndex(t => t.id === track.id || (t.name === track.name && t.artist === track.artist));
    if (index !== -1) {
      state.likedTracks.splice(index, 1);
      this.showToast(`Removed "${track.name}" from Liked Songs`, 'info');
    } else {
      state.likedTracks.unshift({ ...track, addedAt: new Date().toISOString() });
      this.showToast(`Added "${track.name}" to Liked Songs`, 'success');
    }
    save('spotify_liked', state.likedTracks);
  },

  // Queue actions
  addToQueue(track) {
    if (!track) return;
    state.queue.push(track);
    this.showToast(`Added "${track.name}" to queue`, 'success');
  },

  clearQueue() {
    if (state.currentTrack) {
      state.queue = [state.currentTrack];
      state.queueIndex = 0;
    } else {
      state.queue = [];
      state.queueIndex = 0;
    }
    this.showToast('Queue cleared', 'info');
  },

  removeQueueItem(index) {
    if (index === state.queueIndex) return;
    state.queue.splice(index, 1);
    if (index < state.queueIndex) {
      state.queueIndex -= 1;
    }
  },

  // Custom Playlists
  createPlaylist(title, description = '') {
    const newPlaylist = {
      id: `user-playlist-${Date.now()}`,
      title: title.trim() || 'My Playlist',
      description: description.trim() || 'Created with Spotify Web Player',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      color: '#1db954',
      creator: 'You',
      createdAt: new Date().toLocaleDateString(),
      tracks: []
    };
    state.customPlaylists.unshift(newPlaylist);
    save('spotify_playlists', state.customPlaylists);
    this.showToast(`Playlist "${newPlaylist.title}" created`, 'success');
    this.openPlaylist(newPlaylist);
    return newPlaylist;
  },

  addTrackToPlaylist(playlistId, track) {
    const pl = state.customPlaylists.find(p => p.id === playlistId);
    if (!pl) return;
    if (pl.tracks.some(t => t.id === track.id)) {
      this.showToast(`Already in playlist "${pl.title}"`, 'info');
      return;
    }
    pl.tracks.push(track);
    if (pl.tracks.length === 1 && track.cover) {
      pl.cover = track.cover;
    }
    save('spotify_playlists', state.customPlaylists);
    this.showToast(`Added to "${pl.title}"`, 'success');
  },

  removeTrackFromPlaylist(playlistId, trackId) {
    const pl = state.customPlaylists.find(p => p.id === playlistId);
    if (!pl) return;
    pl.tracks = pl.tracks.filter(t => t.id !== trackId);
    save('spotify_playlists', state.customPlaylists);
    this.showToast(`Removed from "${pl.title}"`, 'info');
  },

  addToHistory(track) {
    state.history = [track, ...state.history.filter(t => t.id !== track.id)].slice(0, 30);
    save('spotify_history', state.history);
  },

  // Spotify Token Management
  setSpotifyToken(newToken) {
    spotifyService.setToken(newToken);
    state.spotifyToken = spotifyService.getToken();
    this.validateSpotifyToken();
  },

  async validateSpotifyToken() {
    state.spotifyStatus = 'checking';
    const res = await spotifyService.validateToken();
    if (res.valid) {
      state.spotifyStatus = 'active';
      state.spotifyError = null;
    } else {
      state.spotifyStatus = 'invalid';
      state.spotifyError = res.error;
    }
    return res;
  },

  // Navigation
  setView(viewName) {
    state.activeView = viewName;
    if (viewName !== 'lyrics') {
      state.showLyricsView = false;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openPlaylist(playlist) {
    state.activePlaylist = playlist;
    this.setView('playlist');
  },

  // Toast
  showToast(message, type = 'info') {
    state.toast.message = message;
    state.toast.type = type;
    state.toast.show = true;
    setTimeout(() => {
      if (state.toast.message === message) {
        state.toast.show = false;
      }
    }, 3500);
  },

  // MediaSession API
  updateMediaSession() {
    if ('mediaSession' in navigator && state.currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: state.currentTrack.name,
        artist: state.currentTrack.artist,
        album: state.currentTrack.album,
        artwork: [
          { src: state.currentTrack.cover, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => this.togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => this.togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) this.seek(details.seekTime);
      });
    }
  }
};
