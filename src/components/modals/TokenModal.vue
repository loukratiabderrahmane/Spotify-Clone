<template>
  <div class="modal-backdrop" @click="closeModal">
    <div class="modal-dialog" @click.stop>
      <div class="modal-header">
        <div class="header-title-box">
          <svg class="spotify-green-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.306c-.215.353-.676.467-1.029.25-2.822-1.724-6.374-2.114-10.557-1.159-.404.092-.806-.157-.899-.561-.092-.404.157-.806.561-.899 4.582-1.047 8.513-.604 11.666 1.339.353.217.466.677.258 1.03zm1.469-3.264c-.27.44-.847.579-1.287.31-3.23-1.986-8.156-2.56-11.977-1.401-.497.151-1.025-.136-1.176-.633-.151-.497.136-1.025.633-1.176 4.37-1.326 9.805-.688 13.5 1.583.44.27.579.847.31 1.287zm.126-3.41c-3.874-2.3-10.265-2.512-13.978-1.385-.595.181-1.222-.162-1.403-.757-.181-.595.162-1.222.757-1.403 4.269-1.296 11.332-1.05 15.793 1.597.534.317.708 1.01.391 1.544-.317.535-1.009.709-1.544.391z"/>
          </svg>
          <h2>Spotify API & Music Engine Settings</h2>
        </div>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <!-- Status Banner -->
        <div class="status-card" :class="statusClass">
          <div class="status-indicator"></div>
          <div>
            <strong>{{ statusTitle }}</strong>
            <p>{{ statusSubtitle }}</p>
          </div>
        </div>

        <!-- Token Input Section -->
        <div class="form-group">
          <label class="form-label">Spotify Bearer Token (Authorization: Bearer ...)</label>
          <textarea 
            v-model="tokenInput" 
            class="token-textarea" 
            rows="3"
            placeholder="Paste your Spotify Bearer token here..."
          ></textarea>
        </div>

        <div class="btn-row">
          <button class="btn btn-secondary" @click="testToken" :disabled="isTesting">
            {{ isTesting ? 'Testing...' : 'Test Connection' }}
          </button>
          <button class="btn btn-primary" @click="saveToken">Save Token</button>
          <button class="btn btn-ghost" @click="resetToDefault">Reset Default Token</button>
        </div>

        <div class="divider"></div>

        <!-- Search Engine Preference -->
        <div class="form-group">
          <label class="form-label">Preferred Search Engine</label>
          <div class="engine-options">
            <label class="engine-option" :class="{ selected: searchSource === 'spotify' }">
              <input type="radio" value="spotify" v-model="searchSource" />
              <div>
                <strong>Direct Spotify Web API</strong>
                <p>Uses your Bearer token. Returns official Spotify tracks, albums, artists and images.</p>
              </div>
            </label>

            <label class="engine-option" :class="{ selected: searchSource === 'itunes' }">
              <input type="radio" value="itunes" v-model="searchSource" />
              <div>
                <strong>Public Music Engine (Instant Audio Previews)</strong>
                <p>Open access, no token required, never expires. 100% playable 30-second audio streams.</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Curl Command Reference -->
        <div class="form-group">
          <label class="form-label">cURL Search Command Reference</label>
          <pre class="curl-snippet">curl -X GET "https://api.spotify.com/v1/search?q=daft+punk&type=track&limit=1" \
  -H "Authorization: Bearer {{ truncatedToken }}"</pre>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-primary" @click="closeModal">Done</button>
      </div>
    </div>
  </div>
</template>

<script>
import { playerStore } from '../../store/playerStore.js';
import { spotifyService } from '../../services/spotifyService.js';

export default {
  name: 'TokenModal',
  data() {
    return {
      tokenInput: spotifyService.getToken(),
      isTesting: false,
      testResult: null
    };
  },
  computed: {
    spotifyStatus() {
      return playerStore.state.spotifyStatus;
    },
    searchSource: {
      get() {
        return playerStore.state.searchSource;
      },
      set(val) {
        playerStore.state.searchSource = val;
      }
    },
    statusClass() {
      if (this.spotifyStatus === 'active') return 'status-active';
      if (this.spotifyStatus === 'checking') return 'status-checking';
      return 'status-invalid';
    },
    statusTitle() {
      if (this.spotifyStatus === 'active') return 'Spotify API Connected & Active';
      if (this.spotifyStatus === 'checking') return 'Checking Spotify Connection...';
      return 'Spotify Token Expired or Invalid';
    },
    statusSubtitle() {
      if (this.spotifyStatus === 'active') {
        return 'Ready to query tracks, artists, and albums directly from Spotify.';
      }
      return 'Spotify Bearer tokens expire every 60 minutes. You can renew it or keep Public Music Engine active.';
    },
    truncatedToken() {
      const t = this.tokenInput || '';
      return t.length > 20 ? t.substring(0, 15) + '...' + t.substring(t.length - 8) : t;
    }
  },
  methods: {
    closeModal() {
      playerStore.state.showTokenModal = false;
    },
    async testToken() {
      this.isTesting = true;
      const res = await spotifyService.validateToken(this.tokenInput);
      this.isTesting = false;
      this.testResult = res;

      if (res.valid) {
        playerStore.state.spotifyStatus = 'active';
        playerStore.showToast('Spotify Token connection verified successfully!', 'success');
      } else {
        playerStore.state.spotifyStatus = 'invalid';
        playerStore.showToast(`Verification failed: ${res.error || 'Token expired'}`, 'error');
      }
    },
    saveToken() {
      playerStore.setSpotifyToken(this.tokenInput);
      this.closeModal();
    },
    resetToDefault() {
      const def = spotifyService.resetToken();
      this.tokenInput = def;
      playerStore.setSpotifyToken(def);
      playerStore.showToast('Reset to original Spotify Bearer token', 'info');
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
  max-width: 580px;
  background-color: #242424;
  border-radius: 8px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: zoomIn 0.2s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spotify-green-icon {
  color: var(--spotify-green);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.close-btn {
  color: var(--text-subdued);
  font-size: 18px;
  padding: 4px;
}

.close-btn:hover {
  color: #ffffff;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: 70vh;
  overflow-y: auto;
}

.status-card {
  padding: 12px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-active {
  background-color: rgba(30, 215, 96, 0.15);
  border: 1px solid rgba(30, 215, 96, 0.3);
  color: #ffffff;
}
.status-active .status-indicator { background-color: var(--spotify-green); }

.status-invalid {
  background-color: rgba(233, 20, 41, 0.15);
  border: 1px solid rgba(233, 20, 41, 0.3);
  color: #ffffff;
}
.status-invalid .status-indicator { background-color: var(--spotify-red); }

.status-checking {
  background-color: rgba(234, 179, 8, 0.15);
  border: 1px solid rgba(234, 179, 8, 0.3);
  color: #ffffff;
}
.status-checking .status-indicator { background-color: #eab308; }

.status-card p {
  color: var(--text-subdued);
  font-size: 12px;
  margin-top: 2px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-base);
}

.token-textarea {
  background-color: #121212;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #ffffff;
  padding: 10px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  outline: none;
}

.token-textarea:focus {
  border-color: var(--spotify-green);
}

.btn-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  transition: transform 0.1s ease;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background-color: var(--spotify-green);
  color: #000000;
}
.btn-primary:hover { background-color: var(--spotify-green-hover); }

.btn-secondary {
  background-color: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.btn-secondary:hover { border-color: #ffffff; }

.btn-ghost {
  color: var(--text-subdued);
}
.btn-ghost:hover { color: #ffffff; }

.divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 6px 0;
}

.engine-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.engine-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background-color: #1a1a1a;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.engine-option.selected {
  border-color: var(--spotify-green);
  background-color: rgba(30, 215, 96, 0.05);
}

.engine-option input {
  margin-top: 4px;
}

.engine-option strong {
  font-size: 14px;
  color: #ffffff;
}

.engine-option p {
  font-size: 12px;
  color: var(--text-subdued);
  margin-top: 2px;
}

.curl-snippet {
  background-color: #121212;
  padding: 10px;
  border-radius: 4px;
  font-size: 11px;
  color: #a7a7a7;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
}
</style>

