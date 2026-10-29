<template>
  <div id="app" class="spotify-app">
    <!-- Main Top Content Area -->
    <div class="app-container">
      <!-- Left Navigation Sidebar -->
      <Sidebar />

      <!-- Center Dynamic Main View -->
      <main class="main-view-container" ref="mainScroll">
        <TopBar />

        <div class="scroll-content" @scroll="onScroll">
          <!-- Views -->
          <HomeView v-if="activeView === 'home'" />
          <SearchView v-else-if="activeView === 'search'" />
          <PlaylistView v-else-if="activeView === 'playlist'" />
          <LikedSongsView v-else-if="activeView === 'liked'" />

          <!-- Overlaid Synced Karaoke Lyrics View -->
          <LyricsView v-if="showLyricsView" />
        </div>
      </main>

      <!-- Optional Slide-out Queue Drawer -->
      <QueueDrawer v-if="showQueueDrawer" />
    </div>

    <!-- Bottom Persistent Web Player Bar -->
    <WebPlayer />

    <!-- Modals & Floaters -->
    <TokenModal v-if="showTokenModal" />
    <CreatePlaylistModal v-if="showCreatePlaylistModal" />
    <AddToPlaylistModal v-if="showAddToPlaylistModal" />
    <MiniPlayer />
    <FullscreenPlayer />

    <!-- Toast Notification -->
    <div 
      v-if="toast.show" 
      class="spotify-toast" 
      :class="toast.type"
    >
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>

<script>
import { playerStore } from './store/playerStore.js';
import Sidebar from './components/Sidebar.vue';
import TopBar from './components/TopBar.vue';
import WebPlayer from './components/WebPlayer.vue';
import HomeView from './components/views/HomeView.vue';
import SearchView from './components/views/SearchView.vue';
import PlaylistView from './components/views/PlaylistView.vue';
import LikedSongsView from './components/views/LikedSongsView.vue';
import LyricsView from './components/views/LyricsView.vue';
import QueueDrawer from './components/views/QueueDrawer.vue';
import MiniPlayer from './components/MiniPlayer.vue';
import FullscreenPlayer from './components/FullscreenPlayer.vue';
import TokenModal from './components/modals/TokenModal.vue';
import CreatePlaylistModal from './components/modals/CreatePlaylistModal.vue';
import AddToPlaylistModal from './components/modals/AddToPlaylistModal.vue';

export default {
  name: 'App',
  components: {
    Sidebar,
    TopBar,
    WebPlayer,
    HomeView,
    SearchView,
    PlaylistView,
    LikedSongsView,
    LyricsView,
    QueueDrawer,
    MiniPlayer,
    FullscreenPlayer,
    TokenModal,
    CreatePlaylistModal,
    AddToPlaylistModal
  },
  data() {
    return {
      isScrolled: false
    };
  },
  computed: {
    activeView() {
      return playerStore.state.activeView;
    },
    showLyricsView() {
      return playerStore.state.showLyricsView;
    },
    showQueueDrawer() {
      return playerStore.state.showQueueDrawer;
    },
    showTokenModal() {
      return playerStore.state.showTokenModal;
    },
    showCreatePlaylistModal() {
      return playerStore.state.showCreatePlaylistModal;
    },
    showAddToPlaylistModal() {
      return playerStore.state.showAddToPlaylistModal;
    },
    toast() {
      return playerStore.state.toast;
    }
  },
  mounted() {
    // Initialize audio engine & keyboard shortcuts
    playerStore.initAudio();
    // Validate Spotify initial token
    playerStore.validateSpotifyToken();
  },
  methods: {
    onScroll(e) {
      this.isScrolled = e.target.scrollTop > 50;
    }
  }
};
</script>

<style>
/* Global Layout Styles are in style.css */
</style>
