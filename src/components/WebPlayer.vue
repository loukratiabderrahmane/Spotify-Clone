<template>
  <footer class="spotify-web-player">
    <!-- Left: Now Playing Info -->
    <div class="player-left">
      <div v-if="currentTrack" class="track-artwork-wrapper" @click="openLyrics">
        <img :src="currentTrack.cover" :alt="currentTrack.name" class="track-artwork" />
        <div class="artwork-overlay" title="Open Lyrics">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </div>
      </div>
      <div v-else class="track-artwork-placeholder">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>

      <div class="track-metadata" v-if="currentTrack">
        <div class="track-title-container">
          <span class="track-title" :title="currentTrack.name">{{ currentTrack.name }}</span>
        </div>
        <span class="track-artist" :title="currentTrack.artist">{{ currentTrack.artist }}</span>
      </div>
      <div class="track-metadata" v-else>
        <span class="track-title">No track selected</span>
        <span class="track-artist">Select a song to play</span>
      </div>

      <button 
        v-if="currentTrack" 
        class="icon-btn heart-btn" 
        :class="{ liked: isCurrentLiked }" 
        @click="toggleLike"
        :title="isCurrentLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'"
      >
        <svg v-if="isCurrentLiked" viewBox="0 0 24 24" width="20" height="20" fill="var(--spotify-green)">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      <button 
        class="icon-btn pip-btn" 
        title="Toggle Mini-Player Mode"
        @click="toggleMiniPlayer"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <rect x="12" y="9" width="8" height="6" rx="1" ry="1"></rect>
        </svg>
      </button>
    </div>

    <!-- Center: Player Controls & Progress -->
    <div class="player-center">
      <div class="control-buttons">
        <!-- Shuffle -->
        <button 
          class="icon-btn control-btn" 
          :class="{ active: shuffle }" 
          @click="toggleShuffle"
          title="Enable Shuffle"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 3 21 3 21 8"></polyline>
            <line x1="4" y1="20" x2="21" y2="3"></line>
            <polyline points="21 16 21 21 16 21"></polyline>
            <line x1="15" y1="15" x2="21" y2="21"></line>
            <line x1="4" y1="4" x2="9" y2="9"></line>
          </svg>
          <span v-if="shuffle" class="active-dot"></span>
        </button>

        <!-- Previous -->
        <button class="icon-btn control-btn" @click="prevTrack" title="Previous (Shift+Left)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <polygon points="19 20 9 12 19 4 19 20"></polygon>
            <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="3"></line>
          </svg>
        </button>

        <!-- Play / Pause Circular Button -->
        <button 
          class="spotify-play-btn small" 
          @click="togglePlay"
          :title="isPlaying ? 'Pause (Space)' : 'Play (Space)'"
        >
          <div v-if="isLoadingAudio" class="loader-spinner"></div>
          <svg v-else-if="isPlaying" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"></rect>
            <rect x="14" y="4" width="4" height="16" rx="1"></rect>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="margin-left: 2px;">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>

        <!-- Next -->
        <button class="icon-btn control-btn" @click="nextTrack" title="Next (Shift+Right)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
            <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="3"></line>
          </svg>
        </button>

        <!-- Repeat Mode -->
        <button 
          class="icon-btn control-btn" 
          :class="{ active: repeatMode !== 'off' }" 
          @click="toggleRepeat"
          :title="repeatTooltip"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
          <span v-if="repeatMode === 'one'" class="repeat-one-badge">1</span>
          <span v-if="repeatMode === 'all'" class="active-dot"></span>
        </button>
      </div>

      <!-- Playback Scrubber Bar -->
      <div class="progress-bar-container">
        <span class="time-label">{{ formatTime(currentTime) }}</span>
        
        <div 
          class="spotify-slider progress-scrubber" 
          ref="progressBar"
          @mousedown="startSeek"
          @click="seekAtPosition"
        >
          <div class="slider-track">
            <div class="slider-fill" :style="{ width: progressPercent + '%' }"></div>
            <div class="slider-thumb" :style="{ left: progressPercent + '%' }"></div>
          </div>
        </div>

        <span class="time-label">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Right: Volume & Extra Controls -->
    <div class="player-right">
      <!-- Lyrics Button -->
      <button 
        class="icon-btn" 
        :class="{ active: showLyricsView }" 
        @click="toggleLyrics"
        title="Lyrics (Karaoke Mode)"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </button>

      <!-- Queue Button -->
      <button 
        class="icon-btn" 
        :class="{ active: showQueueDrawer }" 
        @click="toggleQueue"
        title="Queue"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>

      <!-- Volume Scrubber -->
      <div class="volume-container">
        <button class="icon-btn" @click="toggleMute" :title="isMuted ? 'Unmute (M)' : 'Mute (M)'">
          <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
          <svg v-else-if="volume < 0.5" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </button>

        <div 
          class="spotify-slider volume-slider" 
          ref="volumeBar"
          @mousedown="startVolumeSeek"
          @click="seekVolumeAtPosition"
        >
          <div class="slider-track">
            <div class="slider-fill" :style="{ width: volumePercent + '%' }"></div>
            <div class="slider-thumb" :style="{ left: volumePercent + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Fullscreen Toggle -->
      <button class="icon-btn" @click="toggleFullscreen" title="Fullscreen Player">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      </button>
    </div>
  </footer>
</template>

<script>
import { playerStore } from '../store/playerStore.js';

export default {
  name: 'WebPlayer',
  data() {
    return {
      isSeekingProgress: false,
      isSeekingVolume: false
    };
  },
  computed: {
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
    volume() {
      return playerStore.state.volume;
    },
    isMuted() {
      return playerStore.state.isMuted;
    },
    shuffle() {
      return playerStore.state.shuffle;
    },
    repeatMode() {
      return playerStore.state.repeatMode;
    },
    isLoadingAudio() {
      return playerStore.state.isLoadingAudio;
    },
    showLyricsView() {
      return playerStore.state.showLyricsView;
    },
    showQueueDrawer() {
      return playerStore.state.showQueueDrawer;
    },
    isCurrentLiked() {
      return playerStore.isLiked(this.currentTrack);
    },
    progressPercent() {
      if (!this.duration || this.duration === 0) return 0;
      return Math.min(100, Math.max(0, (this.currentTime / this.duration) * 100));
    },
    volumePercent() {
      if (this.isMuted) return 0;
      return this.volume * 100;
    },
    repeatTooltip() {
      if (this.repeatMode === 'off') return 'Enable repeat';
      if (this.repeatMode === 'all') return 'Enable repeat one';
      return 'Disable repeat';
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  },
  methods: {
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
    toggleMute() {
      playerStore.toggleMute();
    },
    toggleLyrics() {
      playerStore.state.showLyricsView = !playerStore.state.showLyricsView;
    },
    openLyrics() {
      playerStore.state.showLyricsView = true;
    },
    toggleQueue() {
      playerStore.state.showQueueDrawer = !playerStore.state.showQueueDrawer;
    },
    toggleMiniPlayer() {
      playerStore.state.showMiniPlayer = !playerStore.state.showMiniPlayer;
    },
    toggleFullscreen() {
      playerStore.state.isFullscreen = !playerStore.state.isFullscreen;
    },
    formatTime(sec) {
      if (isNaN(sec) || sec === null) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },
    startSeek(e) {
      this.isSeekingProgress = true;
      this.seekAtPosition(e);
    },
    seekAtPosition(e) {
      if (!this.$refs.progressBar) return;
      const rect = this.$refs.progressBar.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      playerStore.seek(pos * this.duration);
    },
    startVolumeSeek(e) {
      this.isSeekingVolume = true;
      this.seekVolumeAtPosition(e);
    },
    seekVolumeAtPosition(e) {
      if (!this.$refs.volumeBar) return;
      const rect = this.$refs.volumeBar.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      playerStore.setVolume(pos);
    },
    handleMouseMove(e) {
      if (this.isSeekingProgress) {
        this.seekAtPosition(e);
      } else if (this.isSeekingVolume) {
        this.seekVolumeAtPosition(e);
      }
    },
    handleMouseUp() {
      this.isSeekingProgress = false;
      this.isSeekingVolume = false;
    },
    handleKeydown(e) {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowRight' && !e.shiftKey) {
        e.preventDefault();
        playerStore.seek(this.currentTime + 5);
      } else if (e.code === 'ArrowLeft' && !e.shiftKey) {
        e.preventDefault();
        playerStore.seek(this.currentTime - 5);
      } else if (e.code === 'ArrowRight' && e.shiftKey) {
        e.preventDefault();
        this.nextTrack();
      } else if (e.code === 'ArrowLeft' && e.shiftKey) {
        e.preventDefault();
        this.prevTrack();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        this.toggleMute();
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        this.toggleLike();
      }
    }
  }
};
</script>

<style scoped>
.spotify-web-player {
  height: var(--player-height);
  background-color: var(--bg-black);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
  z-index: 50;
}

/* Left Section */
.player-left {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 30%;
  min-width: 180px;
}

.track-artwork-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.track-artwork {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.artwork-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  opacity: 0;
  transition: opacity 0.2s;
}

.track-artwork-wrapper:hover .artwork-overlay {
  opacity: 1;
}

.track-artwork-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 4px;
  background-color: var(--bg-surface);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.track-metadata {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.track-title-container {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-base);
  cursor: pointer;
}

.track-title:hover {
  text-decoration: underline;
}

.track-artist {
  font-size: 11px;
  color: var(--text-subdued);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.track-artist:hover {
  color: var(--text-base);
  text-decoration: underline;
}

.icon-btn {
  color: var(--text-subdued);
  padding: 6px;
  border-radius: 50%;
  transition: color 0.2s, transform 0.15s;
  position: relative;
}

.icon-btn:hover {
  color: var(--text-base);
  transform: scale(1.08);
}

.icon-btn.active {
  color: var(--spotify-green);
}

.heart-btn.liked {
  color: var(--spotify-green);
}

.pip-btn {
  opacity: 0.7;
}

.pip-btn:hover {
  opacity: 1;
}

/* Center Section */
.player-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 722px;
  width: 40%;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  position: relative;
}

.active-dot {
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--spotify-green);
}

.repeat-one-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 9px;
  font-weight: 800;
  color: var(--spotify-green);
}

.loader-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.time-label {
  font-size: 11px;
  color: var(--text-subdued);
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.progress-scrubber {
  flex: 1;
}

/* Right Section */
.player-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  width: 30%;
  min-width: 180px;
}

.volume-container {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 130px;
}

.volume-slider {
  flex: 1;
}
</style>

