<template>
  <div 
    class="track-row" 
    :class="{ 
      'is-playing': isCurrentTrack && isPlaying, 
      'is-active': isCurrentTrack,
      'compact': compact
    }"
    @dblclick="playTrack"
    @contextmenu.prevent="openContextMenu($event)"
  >
    <!-- Column 1: Index / Play Icon / Equalizer -->
    <div class="col-index">
      <span v-if="!isHovered && (!isCurrentTrack || !isPlaying)" class="track-number">{{ index + 1 }}</span>
      <div v-else-if="isCurrentTrack && isPlaying && !isHovered" class="equalizer-wrapper">
        <div class="equalizer-bar"></div>
        <div class="equalizer-bar"></div>
        <div class="equalizer-bar"></div>
      </div>
      <button v-else class="row-play-btn" @click.stop="togglePlayRow">
        <svg v-if="isCurrentTrack && isPlaying" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </button>
    </div>

    <!-- Column 2: Artwork & Title & Artist -->
    <div class="col-title">
      <img v-if="showCover && track.cover" :src="track.cover" :alt="track.name" class="row-cover-art" />
      <div class="track-names">
        <span class="track-name" :class="{ 'text-green': isCurrentTrack }">{{ track.name }}</span>
        <span class="artist-name">{{ track.artist }}</span>
      </div>
    </div>

    <!-- Column 3: Album (optional) -->
    <div v-if="showAlbum" class="col-album">
      <span class="album-name">{{ track.album }}</span>
    </div>

    <!-- Column 4: Date Added (optional) -->
    <div v-if="showDate" class="col-date">
      <span>{{ formattedDate }}</span>
    </div>

    <!-- Column 5: Like Button, Duration & Actions -->
    <div class="col-actions">
      <button 
        class="icon-btn row-heart-btn" 
        :class="{ liked: isLiked }" 
        @click.stop="toggleLike"
        :title="isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'"
      >
        <svg v-if="isLiked" viewBox="0 0 24 24" width="16" height="16" fill="var(--spotify-green)">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      <span class="duration-label">{{ formatDuration(track.duration) }}</span>

      <div class="options-menu-wrapper" @click.stop>
        <button class="icon-btn row-more-btn" @click="toggleMenu" title="More options">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="19" cy="12" r="2"></circle>
            <circle cx="5" cy="12" r="2"></circle>
          </svg>
        </button>

        <div v-if="showMenu" class="row-dropdown-menu">
          <button class="dropdown-item" @click="addToQueue">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Add to Queue</span>
          </button>

          <button class="dropdown-item" @click="openAddToPlaylist">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add to Playlist</span>
          </button>

          <button v-if="playlistContextId" class="dropdown-item" @click="removeFromPlaylist">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>Remove from this playlist</span>
          </button>

          <button class="dropdown-item" @click="copyShareLink">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>Copy Track Link</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { playerStore } from '../store/playerStore.js';

export default {
  name: 'TrackRow',
  props: {
    track: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      default: 0
    },
    trackList: {
      type: Array,
      default: () => []
    },
    showCover: {
      type: Boolean,
      default: true
    },
    showAlbum: {
      type: Boolean,
      default: true
    },
    showDate: {
      type: Boolean,
      default: false
    },
    compact: {
      type: Boolean,
      default: false
    },
    playlistContextId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isHovered: false,
      showMenu: false
    };
  },
  computed: {
    isCurrentTrack() {
      return playerStore.state.currentTrack?.id === this.track.id;
    },
    isPlaying() {
      return playerStore.state.isPlaying;
    },
    isLiked() {
      return playerStore.isLiked(this.track);
    },
    formattedDate() {
      return this.track.addedAt ? new Date(this.track.addedAt).toLocaleDateString() : 'Just now';
    }
  },
  mounted() {
    window.addEventListener('click', this.closeMenu);
  },
  beforeUnmount() {
    window.removeEventListener('click', this.closeMenu);
  },
  methods: {
    playTrack() {
      playerStore.playTrack(this.track, this.trackList.length > 0 ? this.trackList : [this.track]);
    },
    togglePlayRow() {
      if (this.isCurrentTrack) {
        playerStore.togglePlay();
      } else {
        this.playTrack();
      }
    },
    toggleLike() {
      playerStore.toggleLike(this.track);
    },
    toggleMenu(e) {
      e.stopPropagation();
      this.showMenu = !this.showMenu;
    },
    closeMenu() {
      this.showMenu = false;
    },
    addToQueue() {
      playerStore.addToQueue(this.track);
      this.showMenu = false;
    },
    openAddToPlaylist() {
      playerStore.state.selectedTrackForPlaylist = this.track;
      playerStore.state.showAddToPlaylistModal = true;
      this.showMenu = false;
    },
    removeFromPlaylist() {
      if (this.playlistContextId) {
        playerStore.removeTrackFromPlaylist(this.playlistContextId, this.track.id);
      }
      this.showMenu = false;
    },
    copyShareLink() {
      const link = this.track.externalUrl || window.location.href;
      navigator.clipboard?.writeText(link);
      playerStore.showToast('Copied link to clipboard', 'info');
      this.showMenu = false;
    },
    openContextMenu(e) {
      this.showMenu = true;
    },
    formatDuration(sec) {
      if (!sec) return '0:30';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    }
  }
};
</script>

<style scoped>
.track-row {
  display: grid;
  grid-template-columns: [index] 40px [first] 6fr [var1] 4fr [var2] 3fr [last] minmax(120px, 1fr);
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-subdued);
  transition: background-color 0.15s ease;
  position: relative;
}

.track-row.compact {
  grid-template-columns: [index] 36px [first] 1fr [last] 100px;
}

.track-row:hover {
  background-color: var(--bg-hover);
  color: var(--text-base);
}

.track-row.is-active {
  background-color: rgba(255, 255, 255, 0.05);
}

.track-row:hover .row-heart-btn,
.track-row:hover .row-more-btn {
  opacity: 1;
}

.col-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
}

.track-number {
  font-variant-numeric: tabular-nums;
  font-size: 14px;
}

.row-play-btn {
  color: var(--text-base);
  width: 24px;
  height: 24px;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding-right: 16px;
}

.row-cover-art {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.track-names {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.track-name {
  color: var(--text-base);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.track-name:hover {
  text-decoration: underline;
}

.track-name.text-green {
  color: var(--spotify-green);
}

.artist-name {
  font-size: 12px;
  color: var(--text-subdued);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.artist-name:hover {
  color: var(--text-base);
  text-decoration: underline;
}

.col-album {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 16px;
}

.album-name {
  cursor: pointer;
}

.album-name:hover {
  color: var(--text-base);
  text-decoration: underline;
}

.col-date {
  font-size: 13px;
}

.col-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.row-heart-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.row-heart-btn.liked {
  opacity: 1;
}

.duration-label {
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  min-width: 38px;
  text-align: right;
}

.row-more-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.options-menu-wrapper {
  position: relative;
}

.row-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 210px;
  background-color: #282828;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 16px 24px rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-base);
  gap: 12px;
  justify-content: flex-start;
  border-radius: 4px;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>

