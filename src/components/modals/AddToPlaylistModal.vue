<template>
  <div class="modal-backdrop" @click="closeModal">
    <div class="modal-dialog" @click.stop>
      <div class="modal-header">
        <h2>Add to playlist</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div class="modal-body" v-if="selectedTrack">
        <div class="track-preview">
          <img :src="selectedTrack.cover" :alt="selectedTrack.name" class="track-thumb" />
          <div>
            <h4 class="track-title">{{ selectedTrack.name }}</h4>
            <p class="track-artist">{{ selectedTrack.artist }}</p>
          </div>
        </div>

        <button class="new-pl-btn" @click="openCreateNew">
          <div class="plus-icon-box">+</div>
          <span>New playlist</span>
        </button>

        <div class="playlists-list" v-if="customPlaylists.length > 0">
          <div 
            v-for="pl in customPlaylists" 
            :key="pl.id" 
            class="pl-item"
            @click="addTo(pl.id)"
          >
            <img :src="pl.cover" :alt="pl.title" class="pl-thumb" />
            <div class="pl-info">
              <span class="pl-name">{{ pl.title }}</span>
              <span class="pl-meta">{{ pl.tracks ? pl.tracks.length : 0 }} songs</span>
            </div>
            <span class="add-arrow">＋</span>
          </div>
        </div>

        <div v-else class="no-playlists">
          <p>You haven't created any custom playlists yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { playerStore } from '../../store/playerStore.js';

export default {
  name: 'AddToPlaylistModal',
  computed: {
    selectedTrack() {
      return playerStore.state.selectedTrackForPlaylist;
    },
    customPlaylists() {
      return playerStore.state.customPlaylists;
    }
  },
  methods: {
    closeModal() {
      playerStore.state.showAddToPlaylistModal = false;
      playerStore.state.selectedTrackForPlaylist = null;
    },
    addTo(playlistId) {
      if (this.selectedTrack) {
        playerStore.addTrackToPlaylist(playlistId, this.selectedTrack);
      }
      this.closeModal();
    },
    openCreateNew() {
      this.closeModal();
      playerStore.state.showCreatePlaylistModal = true;
    }
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-dialog {
  width: 100%;
  max-width: 420px;
  background-color: #282828;
  border-radius: 8px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.close-btn {
  color: var(--text-subdued);
  font-size: 18px;
}

.close-btn:hover {
  color: #ffffff;
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.track-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: #1e1e1e;
  border-radius: 6px;
}

.track-thumb {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  object-fit: cover;
}

.track-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.track-artist {
  font-size: 12px;
  color: var(--text-subdued);
}

.new-pl-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background-color: #333333;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  justify-content: flex-start;
  transition: background-color 0.2s;
}

.new-pl-btn:hover {
  background-color: #3e3e3e;
}

.plus-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.playlists-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pl-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.pl-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.pl-thumb {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.pl-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pl-name {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.pl-meta {
  font-size: 12px;
  color: var(--text-subdued);
}

.add-arrow {
  color: var(--text-subdued);
  font-size: 16px;
}

.pl-item:hover .add-arrow {
  color: var(--spotify-green);
}

.no-playlists {
  padding: 20px;
  text-align: center;
  color: var(--text-subdued);
  font-size: 13px;
}
</style>

