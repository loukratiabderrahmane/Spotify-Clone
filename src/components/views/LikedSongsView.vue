<template>
  <div class="liked-songs-view">
    <!-- Spotify Purple Hero Banner -->
    <header class="liked-hero">
      <div class="liked-cover-box">
        <svg viewBox="0 0 24 24" width="80" height="80" fill="#ffffff">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>

      <div class="hero-details">
        <span class="hero-badge">Playlist</span>
        <h1 class="hero-title">Liked Songs</h1>
        <div class="hero-metadata">
          <span class="creator-name">You</span>
          <span class="meta-separator">•</span>
          <span>{{ likedTracks.length }} songs</span>
        </div>
      </div>
    </header>

    <!-- Controls Bar -->
    <div class="liked-controls-bar">
      <button 
        class="spotify-play-btn large" 
        @click="playAllLiked"
        :title="isPlayingLiked ? 'Pause' : 'Play all liked songs'"
      >
        <svg v-if="isPlayingLiked" viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="26" height="26" fill="currentColor" style="margin-left: 2px;">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </button>

      <div class="search-liked-box">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Filter in Liked Songs..."
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">✕</button>
      </div>
    </div>

    <!-- Tracklist -->
    <div class="tracklist-container">
      <div class="tracklist-header">
        <div class="col-head index">#</div>
        <div class="col-head title">Title</div>
        <div class="col-head album">Album</div>
        <div class="col-head date">Date Added</div>
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
          :showDate="true"
        />
      </div>

      <div v-else class="empty-liked">
        <p>No liked songs found.</p>
        <button class="browse-btn" @click="goToSearch">Explore Songs</button>
      </div>
    </div>
  </div>
</template>

<script>
import { playerStore } from '../../store/playerStore.js';
import TrackRow from '../TrackRow.vue';

export default {
  name: 'LikedSongsView',
  components: {
    TrackRow
  },
  data() {
    return {
      searchQuery: ''
    };
  },
  computed: {
    likedTracks() {
      return playerStore.state.likedTracks;
    },
    filteredTracks() {
      if (!this.searchQuery.trim()) return this.likedTracks;
      const q = this.searchQuery.toLowerCase();
      return this.likedTracks.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.artist.toLowerCase().includes(q) ||
        (t.album && t.album.toLowerCase().includes(q))
      );
    },
    isPlayingLiked() {
      if (!playerStore.state.isPlaying || !playerStore.state.currentTrack) return false;
      return this.likedTracks.some(t => t.id === playerStore.state.currentTrack.id);
    }
  },
  methods: {
    playAllLiked() {
      if (this.likedTracks.length === 0) {
        playerStore.showToast('No liked songs yet!', 'info');
        return;
      }
      if (this.isPlayingLiked) {
        playerStore.togglePlay();
      } else {
        playerStore.playTrack(this.likedTracks[0], this.likedTracks);
      }
    },
    goToSearch() {
      playerStore.setView('search');
    }
  }
};
</script>

<style scoped>
.liked-songs-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.liked-hero {
  padding: 80px 32px 24px 32px;
  display: flex;
  align-items: flex-end;
  gap: 24px;
  background: linear-gradient(180deg, rgb(80, 56, 160) 0%, rgba(18, 18, 18, 0.8) 100%);
}

.liked-cover-box {
  width: 232px;
  height: 232px;
  border-radius: 4px;
  background: linear-gradient(135deg, #450af5, #c4efd9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
  flex-shrink: 0;
}

.hero-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #ffffff;
}

.hero-badge {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.hero-title {
  font-size: 72px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2px;
  margin: 4px 0;
}

.hero-metadata {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 12px;
}

.creator-name {
  font-weight: 700;
}

.meta-separator {
  color: rgba(255, 255, 255, 0.6);
}

.liked-controls-bar {
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-liked-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 18px;
  width: 220px;
}

.search-liked-box input {
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 12px;
  width: 100%;
}

.search-liked-box input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-btn {
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

.empty-liked {
  padding: 64px 0;
  text-align: center;
  color: var(--text-subdued);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.browse-btn {
  padding: 10px 24px;
  background-color: var(--text-base);
  color: #000000;
  font-weight: 700;
  border-radius: 20px;
  font-size: 14px;
}

.browse-btn:hover {
  transform: scale(1.04);
}
</style>

