<template>
  <div class="spotify-card" @click="onClickCard">
    <div class="card-image-wrapper">
      <img :src="item.cover || item.image" :alt="item.name || item.title" class="card-image" />
      <button 
        class="spotify-play-btn card-play-btn" 
        :class="{ 'force-visible': isCurrentPlaying }"
        @click.stop="onPlayClick"
        :title="isCurrentPlaying ? 'Pause' : 'Play'"
      >
        <svg v-if="isCurrentPlaying" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="margin-left: 2px;">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </button>
    </div>

    <div class="card-info">
      <span class="card-title">{{ item.name || item.title }}</span>
      <span class="card-subtitle">{{ item.artist || item.description || item.creator || 'Playlist' }}</span>
    </div>
  </div>
</template>

<script>
import { playerStore } from '../store/playerStore.js';

export default {
  name: 'TrackCard',
  props: {
    item: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      default: 'track' // 'track' | 'playlist' | 'album' | 'artist'
    },
    trackList: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    isCurrentPlaying() {
      if (this.type === 'track') {
        return playerStore.state.currentTrack?.id === this.item.id && playerStore.state.isPlaying;
      }
      return false;
    }
  },
  methods: {
    onClickCard() {
      if (this.type === 'playlist') {
        playerStore.openPlaylist(this.item);
      } else if (this.type === 'track') {
        playerStore.playTrack(this.item, this.trackList.length > 0 ? this.trackList : [this.item]);
      }
    },
    onPlayClick() {
      if (this.type === 'track') {
        if (this.isCurrentPlaying) {
          playerStore.togglePlay();
        } else {
          playerStore.playTrack(this.item, this.trackList.length > 0 ? this.trackList : [this.item]);
        }
      } else if (this.type === 'playlist') {
        if (this.item.tracks && this.item.tracks.length > 0) {
          playerStore.playTrack(this.item.tracks[0], this.item.tracks);
        }
      }
    }
  }
};
</script>

<style scoped>
.spotify-card {
  padding: 16px;
  background-color: var(--bg-surface);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.spotify-card:hover {
  background-color: var(--bg-hover);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 16px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-play-btn {
  position: absolute;
  right: 8px;
  bottom: 8px;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.3s cubic-bezier(0.3, 0, 0, 1);
}

.spotify-card:hover .card-play-btn {
  opacity: 1;
  transform: translateY(0);
}

.card-play-btn.force-visible {
  opacity: 1;
  transform: translateY(0);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 48px;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-subtitle {
  font-size: 12px;
  color: var(--text-subdued);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
</style>

