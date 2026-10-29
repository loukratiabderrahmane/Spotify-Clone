<template>
  <div class="lyrics-overlay" :style="{ background: ambientBackground }">
    <!-- Lyrics Top Navigation -->
    <div class="lyrics-header">
      <div class="track-summary" v-if="currentTrack">
        <img :src="currentTrack.cover" :alt="currentTrack.name" class="track-cover-mini" />
        <div>
          <h3 class="track-title">{{ currentTrack.name }}</h3>
          <p class="track-artist">{{ currentTrack.artist }}</p>
        </div>
      </div>

      <button class="close-lyrics-btn" @click="closeLyrics" title="Close lyrics">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Lyrics Stream -->
    <div class="lyrics-container" ref="lyricsScroll">
      <div 
        v-for="(line, idx) in lyrics" 
        :key="idx"
        class="lyric-line"
        :class="{ 
          'active': idx === activeLineIndex,
          'passed': idx < activeLineIndex 
        }"
        @click="jumpToLine(line)"
      >
        {{ line.text }}
      </div>
    </div>
  </div>
</template>

<script>
import { playerStore } from '../../store/playerStore.js';
import { lyricsService } from '../../services/lyricsService.js';

export default {
  name: 'LyricsView',
  data() {
    return {
      lyrics: []
    };
  },
  computed: {
    currentTrack() {
      return playerStore.state.currentTrack;
    },
    currentTime() {
      return playerStore.state.currentTime;
    },
    activeLineIndex() {
      if (this.lyrics.length === 0) return -1;
      let activeIdx = 0;
      for (let i = 0; i < this.lyrics.length; i++) {
        if (this.currentTime >= this.lyrics[i].time) {
          activeIdx = i;
        } else {
          break;
        }
      }
      return activeIdx;
    },
    ambientBackground() {
      return 'linear-gradient(180deg, #1e3a5f 0%, #0d1b2a 100%)';
    }
  },
  watch: {
    currentTrack: {
      immediate: true,
      handler(track) {
        this.lyrics = lyricsService.getLyricsForTrack(track);
      }
    },
    activeLineIndex(newIdx) {
      this.scrollToActiveLine(newIdx);
    }
  },
  methods: {
    closeLyrics() {
      playerStore.state.showLyricsView = false;
    },
    jumpToLine(line) {
      playerStore.seek(line.time);
    },
    scrollToActiveLine(idx) {
      const el = this.$refs.lyricsScroll;
      if (!el) return;
      const lines = el.querySelectorAll('.lyric-line');
      if (lines[idx]) {
        lines[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
};
</script>

<style scoped>
.lyrics-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  display: flex;
  flex-direction: column;
  padding: 32px 64px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.lyrics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.track-summary {
  display: flex;
  align-items: center;
  gap: 16px;
}

.track-cover-mini {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  object-fit: cover;
}

.track-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.track-artist {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.close-lyrics-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
  color: #ffffff;
}

.close-lyrics-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: scale(1.08);
}

.lyrics-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 64px 0 120px 0;
}

.lyric-line {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
}

.lyric-line:hover {
  color: rgba(255, 255, 255, 0.7);
}

.lyric-line.active {
  color: #ffffff;
  transform: scale(1.02);
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}

.lyric-line.passed {
  color: rgba(255, 255, 255, 0.6);
}
</style>

