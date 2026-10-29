<template>
  <div class="mini-player-overlay" v-if="showMiniPlayer && currentTrack">
    <div class="mini-player-card">
      <div class="mini-player-header">
        <span class="mini-tag">Spotify Mini Player</span>
        <button class="mini-close" @click="closeMini">✕</button>
      </div>

      <div class="mini-body">
        <img :src="currentTrack.cover" :alt="currentTrack.name" class="mini-cover" />
        <div class="mini-info">
          <span class="mini-title">{{ currentTrack.name }}</span>
          <span class="mini-artist">{{ currentTrack.artist }}</span>
        </div>
      </div>

      <div class="mini-progress-bar">
        <div class="mini-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <div class="mini-controls">
        <button class="mini-btn" @click="prevTrack">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <polygon points="19 20 9 12 19 4 19 20"></polygon>
            <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="3"></line>
          </svg>
        </button>

        <button class="spotify-play-btn small" @click="togglePlay">
          <svg v-if="isPlaying" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-left: 2px;">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>

        <button class="mini-btn" @click="nextTrack">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
            <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="3"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { playerStore } from '../store/playerStore.js';

export default {
  name: 'MiniPlayer',
  computed: {
    showMiniPlayer() {
      return playerStore.state.showMiniPlayer;
    },
    currentTrack() {
      return playerStore.state.currentTrack;
    },
    isPlaying() {
      return playerStore.state.isPlaying;
    },
    currentTime() {
      return playerStore.state.currentTime;
    },
    duration() {
      return playerStore.state.duration;
    },
    progressPercent() {
      if (!this.duration) return 0;
      return (this.currentTime / this.duration) * 100;
    }
  },
  methods: {
    closeMini() {
      playerStore.state.showMiniPlayer = false;
    },
    togglePlay() {
      playerStore.togglePlay();
    },
    nextTrack() {
      playerStore.nextTrack();
    },
    prevTrack() {
      playerStore.prevTrack();
    }
  }
};
</script>

<style scoped>
.mini-player-overlay {
  position: fixed;
  bottom: 110px;
  right: 24px;
  z-index: 100;
  animation: slideIn 0.25s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.mini-player-card {
  width: 280px;
  background-color: #242424;
  border-radius: 8px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.mini-player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #1a1a1a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.mini-tag {
  font-size: 11px;
  font-weight: 700;
  color: var(--spotify-green);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mini-close {
  color: var(--text-subdued);
  font-size: 12px;
}

.mini-close:hover {
  color: #ffffff;
}

.mini-body {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-cover {
  width: 52px;
  height: 52px;
  border-radius: 4px;
  object-fit: cover;
}

.mini-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-title {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-artist {
  font-size: 11px;
  color: var(--text-subdued);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-progress-bar {
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.1);
}

.mini-fill {
  height: 100%;
  background-color: var(--spotify-green);
}

.mini-controls {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.mini-btn {
  color: var(--text-subdued);
  padding: 4px;
}

.mini-btn:hover {
  color: #ffffff;
}
</style>

