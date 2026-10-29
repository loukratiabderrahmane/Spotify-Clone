<template>
  <header class="top-bar" :class="{ 'is-scrolled': isScrolled }">
    <!-- Left Navigation Arrows -->
    <div class="nav-arrows">
      <button class="arrow-btn" title="Go back" @click="goBack" :disabled="historyStack.length <= 1">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button class="arrow-btn" title="Go forward" @click="goForward">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Search Input in TopBar (Active on Search view) -->
    <div v-if="activeView === 'search'" class="search-input-wrapper">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          ref="searchInput"
          type="text" 
          v-model="searchQuery" 
          placeholder="What do you want to play? (e.g. Daft Punk)"
          @input="onSearchInput"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Quick Engine Toggle -->
      <div class="engine-toggle">
        <button 
          class="engine-btn" 
          :class="{ active: searchSource === 'spotify' }"
          @click="setEngine('spotify')"
          title="Search Spotify Web API directly with your Bearer token"
        >
          <span class="status-dot" :class="spotifyStatusClass"></span>
          Spotify API
        </button>
        <button 
          class="engine-btn" 
          :class="{ active: searchSource === 'itunes' }"
          @click="setEngine('itunes')"
          title="High quality 30s open preview audio stream without auth expiry"
        >
          <span class="status-dot green"></span>
          Public Music
        </button>
      </div>
    </div>

    <!-- Right Side Actions -->
    <div class="top-bar-right">
      <!-- Spotify Token Modal Trigger -->
      <button class="token-status-pill" @click="openTokenModal" title="Manage Spotify Bearer Token & Settings">
        <span class="status-dot" :class="spotifyStatusClass"></span>
        <span class="token-label">{{ tokenStatusText }}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      <!-- User Profile Dropdown -->
      <div class="user-menu-wrapper" @click="toggleMenu">
        <div class="user-avatar-btn">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" class="avatar-img" />
        </div>

        <div v-if="showUserMenu" class="user-dropdown-menu" @click.stop>
          <div class="menu-item user-info-item">
            <span class="user-name">Spotify Explorer</span>
            <span class="user-plan">Options API Edition</span>
          </div>
          <div class="menu-divider"></div>
          <button class="menu-item" @click="openTokenModal">
            <span>Spotify API Settings</span>
          </button>
          <button class="menu-item" @click="quickDaftPunkSearch">
            <span>Search Daft Punk</span>
          </button>
          <button class="menu-item" @click="clearStorage">
            <span>Reset Local Library</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { playerStore } from '../store/playerStore.js';

export default {
  name: 'TopBar',
  data() {
    return {
      isScrolled: false,
      searchQuery: '',
      showUserMenu: false,
      historyStack: ['home'],
      historyIndex: 0
    };
  },
  computed: {
    activeView() {
      return playerStore.state.activeView;
    },
    searchSource() {
      return playerStore.state.searchSource;
    },
    spotifyStatusClass() {
      if (playerStore.state.spotifyStatus === 'active') return 'green';
      if (playerStore.state.spotifyStatus === 'checking') return 'yellow';
      return 'red';
    },
    tokenStatusText() {
      if (playerStore.state.spotifyStatus === 'active') return 'Spotify Active';
      if (playerStore.state.spotifyStatus === 'checking') return 'Checking...';
      return 'Token Expired';
    }
  },
  watch: {
    'playerStore.state.searchQuery'(newVal) {
      this.searchQuery = newVal;
    },
    activeView(newVal) {
      if (this.historyStack[this.historyIndex] !== newVal) {
        this.historyStack.push(newVal);
        this.historyIndex = this.historyStack.length - 1;
      }
    }
  },
  mounted() {
    window.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    window.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    handleOutsideClick() {
      this.showUserMenu = false;
    },
    toggleMenu(e) {
      e.stopPropagation();
      this.showUserMenu = !this.showUserMenu;
    },
    goBack() {
      if (this.historyIndex > 0) {
        this.historyIndex -= 1;
        playerStore.setView(this.historyStack[this.historyIndex]);
      }
    },
    goForward() {
      if (this.historyIndex < this.historyStack.length - 1) {
        this.historyIndex += 1;
        playerStore.setView(this.historyStack[this.historyIndex]);
      }
    },
    onSearchInput() {
      playerStore.state.searchQuery = this.searchQuery;
    },
    clearSearch() {
      this.searchQuery = '';
      playerStore.state.searchQuery = '';
      if (this.$refs.searchInput) {
        this.$refs.searchInput.focus();
      }
    },
    setEngine(source) {
      playerStore.state.searchSource = source;
      playerStore.showToast(`Switched search source to ${source === 'spotify' ? 'Spotify API' : 'Public Music Engine'}`, 'info');
    },
    openTokenModal() {
      playerStore.state.showTokenModal = true;
      this.showUserMenu = false;
    },
    quickDaftPunkSearch() {
      playerStore.setView('search');
      this.searchQuery = 'daft punk';
      playerStore.state.searchQuery = 'daft punk';
      this.showUserMenu = false;
    },
    clearStorage() {
      if (confirm('Reset your custom playlists and liked tracks?')) {
        localStorage.removeItem('spotify_liked');
        localStorage.removeItem('spotify_playlists');
        localStorage.removeItem('spotify_history');
        window.location.reload();
      }
    }
  }
};
</script>

<style scoped>
.top-bar {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.3s ease;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.top-bar.is-scrolled {
  background-color: rgba(18, 18, 18, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.nav-arrows {
  display: flex;
  gap: 8px;
}

.arrow-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  color: var(--text-base);
  transition: background-color 0.2s, opacity 0.2s;
}

.arrow-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.9);
  transform: scale(1.04);
}

.arrow-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 620px;
  margin: 0 20px;
}

.search-box {
  flex: 1;
  height: 40px;
  background-color: var(--bg-highlight);
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 10px;
  border: 1px solid transparent;
  transition: border-color 0.2s, background-color 0.2s;
}

.search-box:focus-within {
  border-color: #ffffff;
  background-color: var(--bg-active);
}

.search-icon {
  color: var(--text-subdued);
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-base);
  font-size: 14px;
  font-family: inherit;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  color: var(--text-subdued);
  padding: 2px;
}

.clear-btn:hover {
  color: var(--text-base);
}

.engine-toggle {
  display: flex;
  background-color: var(--bg-highlight);
  border-radius: 20px;
  padding: 2px;
}

.engine-btn {
  padding: 5px 12px;
  border-radius: 18px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-subdued);
  gap: 6px;
  transition: all 0.2s;
}

.engine-btn.active {
  background-color: var(--bg-surface);
  color: var(--text-base);
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-dot.green { background-color: var(--spotify-green); }
.status-dot.yellow { background-color: #eab308; }
.status-dot.red { background-color: var(--spotify-red); }

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.token-status-pill {
  height: 36px;
  padding: 0 14px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-base);
  transition: background-color 0.2s;
}

.token-status-pill:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.user-menu-wrapper {
  position: relative;
}

.user-avatar-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.user-avatar-btn:hover {
  transform: scale(1.05);
  border-color: #ffffff;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-dropdown-menu {
  position: absolute;
  top: 48px;
  right: 0;
  width: 200px;
  background-color: #282828;
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 16px 24px rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  flex-direction: column;
}

.menu-item {
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-base);
  justify-content: flex-start;
  border-radius: 4px;
  text-align: left;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-info-item {
  flex-direction: column;
  align-items: flex-start;
  pointer-events: none;
}

.user-name {
  font-weight: 700;
  font-size: 14px;
}

.user-plan {
  font-size: 11px;
  color: var(--text-subdued);
}

.menu-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 4px 0;
}
</style>

