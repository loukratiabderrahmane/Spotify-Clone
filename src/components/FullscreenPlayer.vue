<template>
  <div class="fullscreen-player" v-if="isFullscreen && currentTrack">
    <!-- Top Action Row -->
    <div class="fullscreen-top">
      <div class="playing-from">
        <span class="sub-label">Playing from playlist</span>
        <span class="pl-name">{{ activePlaylist ? activePlaylist.title : 'Spotify Essentials' }}</span>
      </div>

      <button class="exit-fullscreen-btn" @click="exitFullscreen" title="Exit Fullscreen (Esc)">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 14 10 14 10 20"></polyline>
          <polyline points="20 10 14 10 14 4"></polyline>
          <line x1="14" y1="10" x2="21" y2="3"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      </button>
    </div>

    <!-- Center Display -->
    <div class="fullscreen-center">
      <div class="giant-cover-wrapper">
        <img :src="currentTrack.cover" :alt="currentTrack.name" class="giant-cover" />
      </div>

      <div class="fullscreen-meta">
        <div class="meta-row">
          <div>
            <h1 class="giant-title">{{ currentTrack.name }}</h1>
            <h2 class="giant-artist">{{ currentTrack.artist }}</h2>
          </div>
          <button 
            class="fullscreen-heart-btn" 
            :class="{ liked: isLiked }" 
            @click="toggleLike"
          >
            <svg v-if="isLiked" viewBox="0 0 24 24" width="32" height="32" fill="var(--spotify-green)">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <!-- Big Scrubber -->
        <div class="fullscreen-scrubber-wrapper">
          <div class="spotify-slider" ref="fsProgressBar" @click="seekAtPosition">
            <div class="slider-track">
              <div class="slider-fill" :style="{ width: progressPercent + '%' }"></div>
              <div class="slider-thumb" :style="{ left: progressPercent + '%' }"></div>
            </div>
          </div>
          <div class="time-row">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- Big Controls Row -->
        <div class="fullscreen-controls">
          <button class="fs-icon-btn" :class="{ active: shuffle }" @click="toggleShuffle">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
          </button>

          <button class="fs-icon-btn" @click="prevTrack">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="3"></line>
            </svg>
          </button>

          <button class="spotify-play-btn large" @click="togglePlay">
            <svg v-if="isPlaying" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="28" height="28" fill="currentColor" style="margin-left: 2px;">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>

          <button class="fs-icon-btn" @click="nextTrack">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="3"></line>
            </svg>
          </button>

          <button class="fs-icon-btn" :class="{ active: repeatMode !== 'off' }" @click="toggleRepeat">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { playerStore } from '../store/playerStore.js';

export default {
  name: 'FullscreenPlayer',
  computed: {
    isFullscreen() {
      return playerStore.state.isFullscreen;
    },
    currentTrack() {
      return playerStore.state.currentTrack;
    },
    activePlaylist() {
      return playerStore.state.activePlaylist;
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
    shuffle() {
      return playerStore.state.shuffle;
    },
    repeatMode() {
      return playerStore.state.repeatMode;
    },
    isLiked() {
      return playerStore.isLiked(this.currentTrack);
    },
    progressPercent() {
      if (!this.duration) return 0;
      return (this.currentTime / this.duration) * 100;
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKey);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKey);
  },
  methods: {
    exitFullscreen() {
      playerStore.state.isFullscreen = false;
    },
    handleKey(e) {
      if (e.key === 'Escape') {
        this.exitFullscreen();
      }
    },
    togglePlay() {
      playerStore.togglePlay();
    },
    nextTrack() {
      playerStore.nextTrack();
    },
    prevTrack() {
      playerStore.prevTrack();
    },
    toggleShuffle() {
      playerStore.toggleShuffle();
    },
    toggleRepeat() {
      playerStore.toggleRepeat();
    },
    toggleLike() {
      playerStore.toggleLike(this.currentTrack);
    },
    formatTime(sec) {
      if (isNaN(sec)) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },
    seekAtPosition(e) {
      if (!this.$refs.fsProgressBar) return;
      const rect = this.$refs.fsProgressBar.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      playerStore.seek(pos * this.duration);
    }
  }
};
</script>

<style scoped>
.fullscreen-player {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: radial-gradient(circle at center, #1b2838 0%, #080808 100%);
  display: flex;
  flex-direction: column;
  padding: 40px 60px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fullscreen-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.playing-from {
  display: flex;
  flex-direction: column;
}

.sub-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-subdued);
}

.pl-name {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.exit-fullscreen-btn {
  color: var(--text-subdued);
  padding: 8px;
}

.exit-fullscreen-btn:hover {
  color: #ffffff;
  transform: scale(1.1);
}

.fullscreen-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 900px) {
  .fullscreen-center {
    flex-direction: column;
    gap: 40px;
  }
}

.giant-cover-wrapper {
  width: 380px;
  max-width: 40vw;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
  flex-shrink: 0;
}

.giant-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fullscreen-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-width: 320px;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.giant-title {
  font-size: 40px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
  margin-bottom: 8px;
}

.giant-artist {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-subdued);
}

.fullscreen-heart-btn {
  color: var(--text-subdued);
  padding: 8px;
}

.fullscreen-heart-btn.liked {
  color: var(--spotify-green);
}

.fullscreen-scrubber-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-subdued);
  font-variant-numeric: tabular-nums;
}

.fullscreen-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.fs-icon-btn {
  color: var(--text-subdued);
  padding: 8px;
  transition: all 0.2s;
}

.fs-icon-btn:hover {
  color: #ffffff;
  transform: scale(1.1);
}

.fs-icon-btn.active {
  color: var(--spotify-green);
}
</style>

