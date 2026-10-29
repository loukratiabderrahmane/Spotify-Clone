<template>
  <aside class="spotify-sidebar">
    <!-- Top Navigation Card -->
    <div class="sidebar-card nav-card">
      <div class="logo-area" @click="goHome">
        <svg class="spotify-logo-icon" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.306c-.215.353-.676.467-1.029.25-2.822-1.724-6.374-2.114-10.557-1.159-.404.092-.806-.157-.899-.561-.092-.404.157-.806.561-.899 4.582-1.047 8.513-.604 11.666 1.339.353.217.466.677.258 1.03zm1.469-3.264c-.27.44-.847.579-1.287.31-3.23-1.986-8.156-2.56-11.977-1.401-.497.151-1.025-.136-1.176-.633-.151-.497.136-1.025.633-1.176 4.37-1.326 9.805-.688 13.5 1.583.44.27.579.847.31 1.287zm.126-3.41c-3.874-2.3-10.265-2.512-13.978-1.385-.595.181-1.222-.162-1.403-.757-.181-.595.162-1.222.757-1.403 4.269-1.296 11.332-1.05 15.793 1.597.534.317.708 1.01.391 1.544-.317.535-1.009.709-1.544.391z"/>
        </svg>
        <span class="logo-text">Spotify</span>
      </div>

      <nav class="nav-links">
        <button 
          class="nav-link-btn" 
          :class="{ active: activeView === 'home' }"
          @click="goHome"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" :fill="activeView === 'home' ? '#ffffff' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </button>

        <button 
          class="nav-link-btn" 
          :class="{ active: activeView === 'search' }"
          @click="goSearch"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Search</span>
        </button>
      </nav>
    </div>

    <!-- Library Section Card -->
    <div class="sidebar-card library-card">
      <div class="library-header">
        <button class="library-title-btn" @click="activeTab = 'all'">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>Your Library</span>
        </button>

        <div class="library-actions">
          <button 
            class="icon-action-btn" 
            title="Create Playlist" 
            @click="openCreatePlaylist"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Library Filter Pills -->
      <div class="library-filter-pills">
        <button 
          class="badge-pill" 
          :class="{ active: activeTab === 'all' }" 
          @click="activeTab = 'all'"
        >
          Playlists
        </button>
        <button 
          class="badge-pill" 
          :class="{ active: activeTab === 'by-you' }" 
          @click="activeTab = 'by-you'"
        >
          By You
        </button>
      </div>

      <!-- Library Items List -->
      <div class="library-items-list">
        <!-- Liked Songs Row -->
        <div 
          v-if="activeTab === 'all'"
          class="library-item" 
          :class="{ active: activeView === 'liked' }"
          @click="goLikedSongs"
        >
          <div class="liked-songs-thumb">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div class="item-info">
            <span class="item-title">Liked Songs</span>
            <span class="item-subtitle">Playlist • {{ likedCount }} songs</span>
          </div>
          <div v-if="isPlayingLiked" class="equalizer-wrapper">
            <div class="equalizer-bar"></div>
            <div class="equalizer-bar"></div>
            <div class="equalizer-bar"></div>
          </div>
        </div>

        <!-- Custom User Playlists -->
        <div 
          v-for="pl in filteredPlaylists" 
          :key="pl.id"
          class="library-item"
          :class="{ active: isCurrentPlaylist(pl) }"
          @click="selectPlaylist(pl)"
        >
          <img :src="pl.cover" :alt="pl.title" class="playlist-thumb" />
          <div class="item-info">
            <span class="item-title">{{ pl.title }}</span>
            <span class="item-subtitle">Playlist • {{ pl.creator || 'You' }}</span>
          </div>
          <div v-if="isCurrentPlaylistPlaying(pl)" class="equalizer-wrapper">
            <div class="equalizer-bar"></div>
            <div class="equalizer-bar"></div>
            <div class="equalizer-bar"></div>
          </div>
        </div>

        <!-- Curated Playlists (when on All tab) -->
        <template v-if="activeTab === 'all'">
          <div 
            v-for="cPl in curatedPlaylists" 
            :key="cPl.id"
            class="library-item"
            :class="{ active: isCurrentPlaylist(cPl) }"
            @click="selectPlaylist(cPl)"
          >
            <img :src="cPl.cover" :alt="cPl.title" class="playlist-thumb" />
            <div class="item-info">
              <span class="item-title">{{ cPl.title }}</span>
              <span class="item-subtitle">Playlist • {{ cPl.creator }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </aside>
</template>

<script>
import { playerStore } from '../store/playerStore.js';
import { CURATED_PLAYLISTS } from '../services/defaultCatalog.js';

export default {
  name: 'Sidebar',
  data() {
    return {
      activeTab: 'all',
      curatedPlaylists: CURATED_PLAYLISTS
    };
  },
  computed: {
    activeView() {
      return playerStore.state.activeView;
    },
    likedCount() {
      return playerStore.state.likedTracks.length;
    },
    customPlaylists() {
      return playerStore.state.customPlaylists;
    },
    filteredPlaylists() {
      if (this.activeTab === 'by-you') {
        return this.customPlaylists;
      }
      return this.customPlaylists;
    },
    isPlayingLiked() {
      return playerStore.state.activeView === 'liked' && playerStore.state.isPlaying;
    }
  },
  methods: {
    goHome() {
      playerStore.setView('home');
    },
    goSearch() {
      playerStore.setView('search');
    },
    goLikedSongs() {
      playerStore.setView('liked');
    },
    selectPlaylist(playlist) {
      playerStore.openPlaylist(playlist);
    },
    openCreatePlaylist() {
      playerStore.state.showCreatePlaylistModal = true;
    },
    isCurrentPlaylist(pl) {
      return playerStore.state.activeView === 'playlist' && 
             playerStore.state.activePlaylist?.id === pl.id;
    },
    isCurrentPlaylistPlaying(pl) {
      return this.isCurrentPlaylist(pl) && playerStore.state.isPlaying;
    }
  }
};
</script>

<style scoped>
.spotify-sidebar {
  width: var(--sidebar-width);
  min-width: 240px;
  max-width: 380px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: transparent;
}

.sidebar-card {
  background-color: var(--bg-surface);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
}

.nav-card {
  gap: 16px;
  padding: 18px 20px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-base);
  transition: opacity 0.2s;
}

.logo-area:hover {
  opacity: 0.9;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-subdued);
  transition: color 0.2s ease;
  justify-content: flex-start;
}

.nav-link-btn:hover {
  color: var(--text-base);
}

.nav-link-btn.active {
  color: var(--text-base);
}

.library-card {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
}

.library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 12px 8px;
}

.library-title-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-subdued);
  transition: color 0.2s;
}

.library-title-btn:hover {
  color: var(--text-base);
}

.library-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--text-subdued);
}

.icon-action-btn:hover {
  color: var(--text-base);
  background-color: var(--bg-highlight);
}

.library-filter-pills {
  display: flex;
  gap: 8px;
  padding: 0 8px 12px 8px;
}

.library-items-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.library-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.library-item:hover {
  background-color: var(--bg-highlight);
}

.library-item.active {
  background-color: var(--bg-hover);
}

.liked-songs-thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background: linear-gradient(135deg, #450af5, #c4efd9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.playlist-thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.library-item.active .item-title {
  color: var(--spotify-green);
}

.item-subtitle {
  font-size: 12px;
  color: var(--text-subdued);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

