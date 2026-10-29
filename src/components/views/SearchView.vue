<template>
  <div class="search-view">
    <!-- Search Bar (Mobile & Quick Input) -->
    <div class="search-hero">
      <div class="search-filters">
        <button 
          class="badge-pill" 
          :class="{ active: activeFilter === 'all' }" 
          @click="activeFilter = 'all'"
        >
          All
        </button>
        <button 
          class="badge-pill" 
          :class="{ active: activeFilter === 'songs' }" 
          @click="activeFilter = 'songs'"
        >
          Songs
        </button>
        <button 
          class="badge-pill" 
          :class="{ active: activeFilter === 'artists' }" 
          @click="activeFilter = 'artists'"
        >
          Artists
        </button>
        <button 
          class="badge-pill" 
          :class="{ active: activeFilter === 'albums' }" 
          @click="activeFilter = 'albums'"
        >
          Albums
        </button>
      </div>

      <!-- Quick Suggested Search Chips -->
      <div class="suggested-chips">
        <span class="chips-label">Popular Searches:</span>
        <button 
          v-for="chip in suggestedChips" 
          :key="chip" 
          class="chip-btn"
          @click="setQuery(chip)"
        >
          {{ chip }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loader-spinner large"></div>
      <p>Searching {{ isSpotifyMode ? 'Spotify Web API' : 'Public Music Engine' }}...</p>
    </div>

    <!-- Error Banner (e.g. Spotify Token expired) -->
    <div v-else-if="errorMessage" class="error-banner">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="error-text">
        <h4>{{ errorMessage }}</h4>
        <p>Spotify Bearer tokens expire in 1 hour. You can update your token or switch to the Public Music Engine which provides unlimited search and audio streaming.</p>
      </div>
      <div class="error-actions">
        <button class="action-btn-primary" @click="switchToPublicEngine">Switch to Public Music Engine</button>
        <button class="action-btn-secondary" @click="openTokenModal">Update Spotify Token</button>
      </div>
    </div>

    <!-- Search Results View -->
    <div v-else-if="hasResults" class="search-results">
      <!-- Top Result & Top Songs Split View -->
      <div v-if="activeFilter === 'all' || activeFilter === 'songs'" class="results-split-section">
        <!-- Top Result Card -->
        <div v-if="topResult" class="top-result-col">
          <h2 class="section-title">Top result</h2>
          <div class="top-result-card" @click="playTopResult">
            <img :src="topResult.cover" :alt="topResult.name" class="top-result-image" />
            <h3 class="top-result-title">{{ topResult.name }}</h3>
            <div class="top-result-meta">
              <span class="type-pill">Song</span>
              <span class="meta-artist">{{ topResult.artist }}</span>
            </div>
            <button class="spotify-play-btn top-result-play" @click.stop="playTopResult">
              <svg v-if="isTopResultPlaying" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style="margin-left: 2px;">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
          </div>
        </div>

        <!-- Songs List -->
        <div class="songs-list-col">
          <h2 class="section-title">Songs</h2>
          <div class="songs-rows">
            <TrackRow 
              v-for="(track, idx) in searchResults.tracks.slice(0, 5)" 
              :key="track.id" 
              :track="track" 
              :index="idx"
              :trackList="searchResults.tracks"
              :compact="true"
              :showAlbum="false"
            />
          </div>
        </div>
      </div>

      <!-- More Songs (if filter is Songs) -->
      <div v-if="activeFilter === 'songs' && searchResults.tracks.length > 5" class="shelf-section">
        <h2 class="section-title">All Songs</h2>
        <div class="songs-table">
          <TrackRow 
            v-for="(track, idx) in searchResults.tracks" 
            :key="'all-' + track.id" 
            :track="track" 
            :index="idx"
            :trackList="searchResults.tracks"
          />
        </div>
      </div>

      <!-- Artists Shelf -->
      <div v-if="(activeFilter === 'all' || activeFilter === 'artists') && searchResults.artists.length > 0" class="shelf-section">
        <h2 class="section-title">Artists</h2>
        <div class="artists-grid">
          <div 
            v-for="artist in searchResults.artists" 
            :key="artist.id" 
            class="artist-card"
            @click="searchArtist(artist.name)"
          >
            <div class="artist-avatar-wrapper">
              <img :src="artist.image" :alt="artist.name" class="artist-avatar" />
            </div>
            <span class="artist-name">{{ artist.name }}</span>
            <span class="artist-tag">Artist</span>
          </div>
        </div>
      </div>

      <!-- Albums Shelf -->
      <div v-if="(activeFilter === 'all' || activeFilter === 'albums') && searchResults.albums.length > 0" class="shelf-section">
        <h2 class="section-title">Albums</h2>
        <div class="cards-grid">
          <TrackCard 
            v-for="album in searchResults.albums" 
            :key="album.id" 
            :item="album" 
            type="album"
          />
        </div>
      </div>
    </div>

    <!-- Empty Search State: Browse All Categories -->
    <div v-else class="browse-categories-section">
      <h2 class="section-title">Browse all</h2>
      <div class="categories-grid">
        <div 
          v-for="cat in genres" 
          :key="cat.id" 
          class="category-card"
          :style="{ backgroundColor: cat.color }"
          @click="selectCategory(cat)"
        >
          <span class="category-name">{{ cat.name }}</span>
          <div class="category-decoration">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="rgba(255, 255, 255, 0.2)">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10 8 16 12 10 16 10 8"></polygon>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { playerStore } from '../../store/playerStore.js';
import { spotifyService } from '../../services/spotifyService.js';
import { musicService } from '../../services/musicService.js';
import TrackRow from '../TrackRow.vue';
import TrackCard from '../TrackCard.vue';

export default {
  name: 'SearchView',
  components: {
    TrackRow,
    TrackCard
  },
  data() {
    return {
      activeFilter: 'all',
      isLoading: false,
      errorMessage: null,
      suggestedChips: ['Daft Punk', 'The Weeknd', 'Taylor Swift', 'Dua Lipa', 'French House', 'Synthwave', 'Harder Better Faster'],
      searchResults: {
        tracks: [],
        artists: [],
        albums: []
      },
      genres: musicService.getGenres(),
      debounceTimer: null
    };
  },
  computed: {
    searchQuery() {
      return playerStore.state.searchQuery;
    },
    searchSource() {
      return playerStore.state.searchSource;
    },
    isSpotifyMode() {
      return this.searchSource === 'spotify';
    },
    hasResults() {
      return this.searchResults.tracks.length > 0 || 
             this.searchResults.artists.length > 0 || 
             this.searchResults.albums.length > 0;
    },
    topResult() {
      return this.searchResults.tracks[0] || null;
    },
    isTopResultPlaying() {
      return this.topResult && playerStore.state.currentTrack?.id === this.topResult.id && playerStore.state.isPlaying;
    }
  },
  watch: {
    searchQuery(newQuery) {
      this.handleSearch(newQuery);
    },
    searchSource() {
      if (this.searchQuery) {
        this.performSearch(this.searchQuery);
      }
    }
  },
  mounted() {
    if (this.searchQuery) {
      this.performSearch(this.searchQuery);
    }
  },
  methods: {
    handleSearch(query) {
      clearTimeout(this.debounceTimer);
      if (!query || !query.trim()) {
        this.searchResults = { tracks: [], artists: [], albums: [] };
        this.errorMessage = null;
        return;
      }
      this.debounceTimer = setTimeout(() => {
        this.performSearch(query);
      }, 350);
    },
    async performSearch(query) {
      this.isLoading = true;
      this.errorMessage = null;

      try {
        if (this.isSpotifyMode) {
          // Direct Spotify API Search with user's Bearer token
          const res = await spotifyService.search(query, 20);
          this.searchResults = res;
          playerStore.state.spotifyStatus = 'active';
        } else {
          // Public Music API Search (iTunes Engine)
          const tracks = await musicService.searchPublicMusic(query, 25);
          this.searchResults = {
            tracks,
            artists: [],
            albums: []
          };
        }
      } catch (err) {
        console.error('Search failed:', err);
        if (this.isSpotifyMode) {
          playerStore.state.spotifyStatus = 'invalid';
          this.errorMessage = err.message || 'Spotify Bearer Token is expired or invalid.';
        } else {
          this.errorMessage = 'Failed to load public music results. Please try again.';
        }
      } finally {
        this.isLoading = false;
      }
    },
    setQuery(query) {
      playerStore.state.searchQuery = query;
    },
    selectCategory(cat) {
      this.setQuery(cat.query);
    },
    searchArtist(artistName) {
      this.setQuery(artistName);
    },
    playTopResult() {
      if (this.topResult) {
        if (this.isTopResultPlaying) {
          playerStore.togglePlay();
        } else {
          playerStore.playTrack(this.topResult, this.searchResults.tracks);
        }
      }
    },
    switchToPublicEngine() {
      playerStore.state.searchSource = 'itunes';
      this.errorMessage = null;
      if (this.searchQuery) {
        this.performSearch(this.searchQuery);
      }
    },
    openTokenModal() {
      playerStore.state.showTokenModal = true;
    }
  }
};
</script>

<style scoped>
.search-view {
  padding: 24px 32px 64px 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.search-hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-filters {
  display: flex;
  gap: 8px;
}

.suggested-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.chips-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.chip-btn {
  padding: 4px 12px;
  background-color: var(--bg-surface);
  border-radius: 14px;
  font-size: 12px;
  color: var(--text-subdued);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;
}

.chip-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-base);
  border-color: rgba(255, 255, 255, 0.2);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;
  color: var(--text-subdued);
}

.loader-spinner.large {
  width: 36px;
  height: 36px;
  border-width: 3px;
  border-color: rgba(255, 255, 255, 0.1);
  border-top-color: var(--spotify-green);
}

.error-banner {
  background-color: rgba(233, 20, 41, 0.1);
  border: 1px solid rgba(233, 20, 41, 0.3);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.error-icon {
  color: var(--spotify-red);
}

.error-text h4 {
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 6px;
}

.error-text p {
  font-size: 13px;
  color: var(--text-subdued);
  line-height: 1.4;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.action-btn-primary {
  padding: 8px 16px;
  background-color: var(--spotify-green);
  color: #000000;
  font-weight: 700;
  font-size: 13px;
  border-radius: 20px;
}

.action-btn-primary:hover {
  background-color: var(--spotify-green-hover);
}

.action-btn-secondary {
  padding: 8px 16px;
  background-color: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  font-size: 13px;
  border-radius: 20px;
}

.action-btn-secondary:hover {
  border-color: #ffffff;
}

/* Results Layout */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.results-split-section {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .results-split-section {
    grid-template-columns: 1fr;
  }
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-base);
  margin-bottom: 16px;
  letter-spacing: -0.3px;
}

.top-result-card {
  background-color: var(--bg-surface);
  border-radius: 8px;
  padding: 20px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
}

.top-result-card:hover {
  background-color: var(--bg-hover);
}

.top-result-image {
  width: 92px;
  height: 92px;
  border-radius: 4px;
  object-fit: cover;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.top-result-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-base);
  margin-bottom: 8px;
  line-height: 1.2;
}

.top-result-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.type-pill {
  padding: 4px 10px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  font-weight: 700;
  font-size: 12px;
}

.meta-artist {
  color: var(--text-subdued);
}

.top-result-play {
  position: absolute;
  right: 20px;
  bottom: 20px;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.2s cubic-bezier(0.3, 0, 0, 1);
}

.top-result-card:hover .top-result-play {
  opacity: 1;
  transform: translateY(0);
}

.songs-list-col {
  display: flex;
  flex-direction: column;
}

.songs-rows {
  display: flex;
  flex-direction: column;
}

/* Artists Grid */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

.artist-card {
  padding: 16px;
  background-color: var(--bg-surface);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: background-color 0.2s;
}

.artist-card:hover {
  background-color: var(--bg-hover);
}

.artist-avatar-wrapper {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.artist-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--text-base);
  margin-bottom: 4px;
}

.artist-tag {
  font-size: 12px;
  color: var(--text-subdued);
}

/* Browse Categories */
.browse-categories-section {
  display: flex;
  flex-direction: column;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.category-card {
  aspect-ratio: 1;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.category-card:hover {
  transform: scale(1.02);
}

.category-name {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  word-break: break-word;
  line-height: 1.2;
}

.category-decoration {
  position: absolute;
  bottom: -5px;
  right: -5px;
  transform: rotate(25deg);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}
</style>

