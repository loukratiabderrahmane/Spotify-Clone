<template>
  <aside class="queue-drawer">
    <div class="queue-header">
      <h2 class="queue-title">Play Queue</h2>
      <button class="close-queue-btn" @click="closeQueue" title="Close queue">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="queue-content">
      <!-- Now Playing Section -->
      <section class="queue-section" v-if="currentTrack">
        <h3 class="section-label">Now playing</h3>
        <div class="now-playing-card">
          <img :src="currentTrack.cover" :alt="currentTrack.name" class="queue-thumb" />
          <div class="queue-meta">
            <span class="track-name text-green">{{ currentTrack.name }}</span>
            <span class="artist-name">{{ currentTrack.artist }}</span>
          </div>
          <div class="equalizer-wrapper" v-if="isPlaying">
            <div class="equalizer-bar"></div>
            <div class="equalizer-bar"></div>
            <div class="equalizer-bar"></div>
          </div>
        </div>
      </section>

      <!-- Next in Queue Section -->
      <section class="queue-section">
        <div class="section-header-row">
          <h3 class="section-label">Next in queue ({{ upcomingQueue.length }})</h3>
          <button v-if="upcomingQueue.length > 0" class="clear-queue-btn" @click="clearQueue">Clear queue</button>
        </div>

        <div class="queue-items-list" v-if="upcomingQueue.length > 0">
          <div 
            v-for="(item, idx) in upcomingQueue" 
            :key="'queue-' + item.id + '-' + idx"
            class="queue-item"
            @click="playFromQueue(queueStartIndex + idx)"
          >
            <span class="queue-index">{{ idx + 1 }}</span>
            <img :src="item.cover" :alt="item.name" class="queue-thumb-small" />
            <div class="queue-meta">
              <span class="track-name">{{ item.name }}</span>
              <span class="artist-name">{{ item.artist }}</span>
            </div>
            <button class="remove-queue-btn" @click.stop="removeQueueItem(queueStartIndex + idx)" title="Remove from queue">
              ✕
            </button>
          </div>
        </div>

        <div v-else class="empty-queue-msg">
          <p>No songs currently queued up.</p>
        </div>
      </section>
    </div>
  </aside>
</template>

<script>
import { playerStore } from '../../store/playerStore.js';

export default {
  name: 'QueueDrawer',
  computed: {
    currentTrack() {
      return playerStore.state.currentTrack;
    },
    isPlaying() {
      return playerStore.state.isPlaying;
    },
    queue() {
      return playerStore.state.queue;
    },
    queueIndex() {
      return playerStore.state.queueIndex;
    },
    queueStartIndex() {
      return this.queueIndex + 1;
    },
    upcomingQueue() {
      if (this.queue.length <= 1) return [];
      return this.queue.slice(this.queueIndex + 1);
    }
  },
  methods: {
    closeQueue() {
      playerStore.state.showQueueDrawer = false;
    },
    clearQueue() {
      playerStore.clearQueue();
    },
    playFromQueue(index) {
      if (this.queue[index]) {
        playerStore.state.queueIndex = index;
        playerStore.playTrack(this.queue[index]);
      }
    },
    removeQueueItem(index) {
      playerStore.removeQueueItem(index);
    }
  }
};
</script>

<style scoped>
.queue-drawer {
  width: 320px;
  background-color: var(--bg-surface);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.queue-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-base);
}

.close-queue-btn {
  color: var(--text-subdued);
  padding: 4px;
}

.close-queue-btn:hover {
  color: var(--text-base);
}

.queue-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.queue-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-subdued);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.clear-queue-btn {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-subdued);
}

.clear-queue-btn:hover {
  color: var(--text-base);
  text-decoration: underline;
}

.now-playing-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background-color: var(--bg-highlight);
  border-radius: 6px;
}

.queue-thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.queue-thumb-small {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.queue-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.track-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
}

.queue-items-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.queue-item:hover {
  background-color: var(--bg-highlight);
}

.queue-index {
  font-size: 12px;
  color: var(--text-subdued);
  min-width: 16px;
  text-align: center;
}

.remove-queue-btn {
  color: var(--text-subdued);
  opacity: 0;
  font-size: 12px;
  padding: 4px;
}

.queue-item:hover .remove-queue-btn {
  opacity: 1;
}

.remove-queue-btn:hover {
  color: var(--spotify-red);
}

.empty-queue-msg {
  padding: 16px 0;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}
</style>

