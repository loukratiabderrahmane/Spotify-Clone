<template>
  <div class="playlist-view" v-if="playlist">
    <!-- Hero Banner with Dynamic Gradient -->
    <header class="playlist-hero" :style="{ background: heroBackground }">
      <div class="hero-cover-wrapper">
        <img :src="playlist.cover" :alt="playlist.title" class="hero-cover-img" />
      </div>

      <div class="hero-details">
        <span class="hero-badge">Playlist</span>
        <h1 class="hero-title" :class="{ 'long-title': playlist.title.length > 25 }">{{ playlist.title }}</h1>
        <p v-if="playlist.description" class="hero-description">{{ playlist.description }}</p>
        
        <div class="hero-metadata">
          <span class="creator-name">{{ playlist.creator || 'Spotify' }}</span>
          <span class="meta-separator">•</span>
          <span>{{ playlist.tracks ? playlist.tracks.length : 0 }} songs,</span>
          <span class="meta-duration">{{ totalDurationFormatted }}</span>
        </div>
      </div>
    </header>

    <!-- Playlist Controls Bar -->
    <div class="playlist-controls-bar">
      <div class="left-controls">
        <button 
          class="spotify-play-btn large" 
          @click="togglePlayPlaylist"
          :title="isPlayingThisPlaylist ? 'Pause' : 'Play'"
        >
          <svg v-if="isPlayingThisPlaylist" viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="26" height="26" fill="currentColor" style="margin-left: 2px;">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>

        <button 
          class="icon-btn heart-action-btn" 
          :class="{ liked: isPlaylistLiked }"
          @click="toggleLikePlaylist"
          title="Save to Your Library"
        >
          <svg v-if="isPlaylistLiked" viewBox="0 0 24 24" width="32" height="32" fill="var(--spotify-green)">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <!-- In-Playlist Search Filter -->
      <div class="playlist-search-box">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          v-model="filterKeyword" 
          placeholder="Filter in this playlist..."
        />
        <button v-if="filterKeyword" class="clear-filter" @click="filterKeyword = ''">✕</button>
      </div>
    </div>

    <!-- Tracklist Table -->
    <div class="tracklist-container">
      <div class="tracklist-header">
        <div class="col-head index">#</div>
        <div class="col-head title">Title</div>
        <div class="col-head album">Album</div>
        <div class="col-head actions">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
      </div>

      <div class="tracklist-rows" v-if="filteredTracks.length > 0">
        <TrackRow 
          v-for="(track, index) in filteredTracks" 
          :key="track.id" 
          :track="track" 
          :index="index"
          :trackList="filteredTracks"
          :playlistContextId="playlist.id"
          :showDate="false"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-playlist">
        <p>No tracks found in this playlist.</p>
        <button class="add-tracks-btn" @click="goToSearch">Browse and Add Music</button>
      </div>
    </div>
  </div>
</template>

<script>
import { playerStore } from '../../store/playerStore.js';
import TrackRow from '../TrackRow.vue';

export default {
  name: 'PlaylistView',
  components: {
    TrackRow
  },
  data() {
    return {
      filterKeyword: '',
      isPlaylistLiked: false
    };
  },
  computed: {
    playlist() {
      return playerStore.state.activePlaylist;
    },
    heroBackground() {
      const color = this.playlist?.color || '#3b82f6';
      return `linear-gradient(180deg, ${color} 0%, rgba(18, 18, 18, 0.8) 100%)`;
    },
    filteredTracks() {
      if (!this.playlist?.tracks) return [];
      if (!this.filterKeyword.trim()) return this.playlist.tracks;
      const kw = this.filterKeyword.toLowerCase();
      return this.playlist.tracks.filter(t => 
        t.name.toLowerCase().includes(kw) || 
        t.artist.toLowerCase().includes(kw) ||
        (t.album && t.album.toLowerCase().includes(kw))
      );
    },
    isPlayingThisPlaylist() {
      if (!playerStore.state.isPlaying || !playerStore.state.currentTrack || !this.playlist?.tracks) {
        return false;
      }
      return this.playlist.tracks.some(t => t.id === playerStore.state.currentTrack.id);
    },
    totalDurationFormatted() {
      if (!this.playlist?.tracks) return '0 min';
      const totalSec = this.playlist.tracks.reduce((acc, t) => acc + (t.duration || 30), 0);
      const min = Math.floor(totalSec / 60);
      return `${min} min`;
    }
  },
  methods: {
    togglePlayPlaylist() {
      if (!this.playlist?.tracks || this.playlist.tracks.length === 0) return;

      if (this.isPlayingThisPlaylist) {
        playerStore.togglePlay();
      } else {
        playerStore.playTrack(this.playlist.tracks[0], this.playlist.tracks);
      }
    },
    toggleLikePlaylist() {
      this.isPlaylistLiked = !this.isPlaylistLiked;
      playerStore.showToast(this.isPlaylistLiked ? 'Saved to Your Library' : 'Removed from Library', 'info');
    },
    goToSearch() {
      playerStore.setView('search');
    }
  }
};
</script>

<style scoped>
.playlist-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.playlist-hero {
  padding: 80px 32px 24px 32px;
  display: flex;
  align-items: flex-end;
  gap: 24px;
}

.hero-cover-wrapper {
  width: 232px;
  height: 232px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
  flex-shrink: 0;
}

.hero-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text-base);
}

.hero-badge {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1.5px;
  margin: 4px 0;
}

.hero-title.long-title {
  font-size: 38px;
}

.hero-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  line-height: 1.4;
}

.hero-metadata {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
}

.creator-name {
  font-weight: 700;
}

.meta-separator {
  color: rgba(255, 255, 255, 0.6);
}

.meta-duration {
  color: rgba(255, 255, 255, 0.7);
}

.playlist-controls-bar {
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 24px;
}

.heart-action-btn {
  color: var(--text-subdued);
  transition: color 0.2s, transform 0.15s;
}

.heart-action-btn:hover {
  color: var(--text-base);
  transform: scale(1.05);
}

.playlist-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 18px;
  width: 220px;
}

.playlist-search-box input {
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 12px;
  width: 100%;
}

.playlist-search-box input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-filter {
  color: var(--text-subdued);
  font-size: 12px;
}

.tracklist-container {
  padding: 0 32px 64px 32px;
  display: flex;
  flex-direction: column;
}

.tracklist-header {
  display: grid;
  grid-template-columns: [index] 40px [first] 6fr [var1] 4fr [var2] 3fr [last] minmax(120px, 1fr);
  padding: 8px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-subdued);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.col-head.index { text-align: center; }
.col-head.actions { text-align: right; }

.tracklist-rows {
  display: flex;
  flex-direction: column;
}

.empty-playlist {
  padding: 64px 0;
  text-align: center;
  color: var(--text-subdued);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.add-tracks-btn {
  padding: 10px 24px;
  background-color: var(--text-base);
  color: #000000;
  font-weight: 700;
  border-radius: 20px;
  font-size: 14px;
}

.add-tracks-btn:hover {
  transform: scale(1.04);
}
</style>

