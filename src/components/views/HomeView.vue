<template>
  <div class="home-view">
    <!-- Greeting Header & Quick Grid -->
    <header class="home-header">
      <h1 class="greeting-text">{{ greeting }}</h1>

      <div class="quick-grid">
        <!-- Liked Songs Quick Tile -->
        <div class="quick-tile" @click="goLiked">
          <div class="quick-tile-thumb liked-thumb">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#ffffff">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span class="quick-tile-title">Liked Songs</span>
          <button class="spotify-play-btn small quick-tile-play" @click.stop="playLiked">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>

        <!-- Curated Playlists Quick Tiles -->
        <div 
          v-for="pl in curatedPlaylists.slice(0, 5)" 
          :key="pl.id" 
          class="quick-tile"
          @click="openPlaylist(pl)"
        >
          <img :src="pl.cover" :alt="pl.title" class="quick-tile-thumb" />
          <span class="quick-tile-title">{{ pl.title }}</span>
          <button class="spotify-play-btn small quick-tile-play" @click.stop="playPlaylist(pl)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Daft Punk Spotlight Section (Honoring user's request!) -->
    <section class="shelf-section">
      <div class="shelf-header">
        <div>
          <h2 class="shelf-title">Daft Punk Essentials</h2>
          <p class="shelf-subtitle">Timeless robotic electronic grooves from the French legends</p>
        </div>
        <button class="see-all-btn" @click="openPlaylist(curatedPlaylists[0])">Show all</button>
      </div>

      <div class="cards-grid">
        <TrackCard 
          v-for="track in daftPunkTracks" 
          :key="track.id" 
          :item="track" 
          type="track"
          :trackList="daftPunkTracks"
        />
      </div>
    </section>

    <!-- Featured Playlists Shelf -->
    <section class="shelf-section">
      <div class="shelf-header">
        <div>
          <h2 class="shelf-title">Featured Playlists</h2>
          <p class="shelf-subtitle">Curated moods, electronic hits, and top chart toppers</p>
        </div>
      </div>

      <div class="cards-grid">
        <TrackCard 
          v-for="pl in curatedPlaylists" 
          :key="pl.id" 
          :item="pl" 
          type="playlist"
        />
      </div>
    </section>

    <!-- Global Top Hits Shelf -->
    <section class="shelf-section">
      <div class="shelf-header">
        <div>
          <h2 class="shelf-title">Today's Global Top Hits</h2>
          <p class="shelf-subtitle">The hottest tracks in the world right now</p>
        </div>
        <button class="see-all-btn" @click="openPlaylist(curatedPlaylists[1])">Show all</button>
      </div>

      <div class="cards-grid">
        <TrackCard 
          v-for="track in topHitsTracks" 
          :key="track.id" 
          :item="track" 
          type="track"
          :trackList="topHitsTracks"
        />
      </div>
    </section>

    <!-- Chill & Lo-Fi Shelf -->
    <section class="shelf-section">
      <div class="shelf-header">
        <div>
          <h2 class="shelf-title">Late Night & Chill Synth</h2>
          <p class="shelf-subtitle">Atmospheric beats for deep work, coding, and driving</p>
        </div>
      </div>

      <div class="cards-grid">
        <TrackCard 
          v-for="track in chillTracks" 
          :key="track.id" 
          :item="track" 
          type="track"
          :trackList="chillTracks"
        />
      </div>
    </section>

    <!-- Recently Played (if any) -->
    <section v-if="historyTracks.length > 0" class="shelf-section">
      <div class="shelf-header">
        <h2 class="shelf-title">Recently Played</h2>
      </div>

      <div class="cards-grid">
        <TrackCard 
          v-for="track in historyTracks.slice(0, 6)" 
          :key="'hist-' + track.id" 
          :item="track" 
          type="track"
          :trackList="historyTracks"
        />
      </div>
    </section>
  </div>
</template>

<script>
import { playerStore } from '../../store/playerStore.js';
import { DAFT_PUNK_TRACKS, TOP_HITS_TRACKS, CHILL_TRACKS, CURATED_PLAYLISTS } from '../../services/defaultCatalog.js';
import TrackCard from '../TrackCard.vue';

export default {
  name: 'HomeView',
  components: {
    TrackCard
  },
  data() {
    return {
      daftPunkTracks: DAFT_PUNK_TRACKS,
      topHitsTracks: TOP_HITS_TRACKS,
      chillTracks: CHILL_TRACKS,
      curatedPlaylists: CURATED_PLAYLISTS
    };
  },
  computed: {
    greeting() {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    },
    historyTracks() {
      return playerStore.state.history;
    }
  },
  methods: {
    goLiked() {
      playerStore.setView('liked');
    },
    openPlaylist(pl) {
      playerStore.openPlaylist(pl);
    },
    playPlaylist(pl) {
      if (pl.tracks && pl.tracks.length > 0) {
        playerStore.playTrack(pl.tracks[0], pl.tracks);
      }
    },
    playLiked() {
      const liked = playerStore.state.likedTracks;
      if (liked.length > 0) {
        playerStore.playTrack(liked[0], liked);
      } else {
        playerStore.showToast('No liked songs yet! Click the heart on any song.', 'info');
      }
    }
  }
};
</script>

<style scoped>
.home-view {
  padding: 24px 32px 64px 32px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.home-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.greeting-text {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-base);
  letter-spacing: -0.5px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.quick-tile {
  height: 64px;
  background-color: rgba(255, 255, 255, 0.07);
  border-radius: 4px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.quick-tile:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.quick-tile-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  flex-shrink: 0;
}

.liked-thumb {
  background: linear-gradient(135deg, #450af5, #c4efd9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-tile-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-base);
  padding: 0 16px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quick-tile-play {
  position: absolute;
  right: 16px;
  opacity: 0;
  transform: scale(0.9);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.2s cubic-bezier(0.3, 0, 0, 1);
}

.quick-tile:hover .quick-tile-play {
  opacity: 1;
  transform: scale(1);
}

/* Shelf Sections */
.shelf-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shelf-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.shelf-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-base);
  letter-spacing: -0.3px;
}

.shelf-subtitle {
  font-size: 13px;
  color: var(--text-subdued);
  margin-top: 4px;
}

.see-all-btn {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-subdued);
  transition: color 0.2s;
}

.see-all-btn:hover {
  color: var(--text-base);
  text-decoration: underline;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}
</style>

