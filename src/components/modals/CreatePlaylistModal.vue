<template>
  <div class="modal-backdrop" @click="closeModal">
    <div class="modal-dialog" @click.stop>
      <div class="modal-header">
        <h2>Create Playlist</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Playlist Name</label>
          <input 
            type="text" 
            v-model="title" 
            class="form-input" 
            placeholder="My Awesome Playlist"
            ref="nameInput"
            @keyup.enter="create"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description (optional)</label>
          <textarea 
            v-model="description" 
            class="form-textarea" 
            rows="3" 
            placeholder="Give your playlist a catchy description"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Cancel</button>
        <button class="btn btn-primary" :disabled="!title.trim()" @click="create">Create</button>
      </div>
    </div>
  </div>
</template>

<script>
import { playerStore } from '../../store/playerStore.js';

export default {
  name: 'CreatePlaylistModal',
  data() {
    return {
      title: '',
      description: ''
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.nameInput) {
        this.$refs.nameInput.focus();
      }
    });
  },
  methods: {
    closeModal() {
      playerStore.state.showCreatePlaylistModal = false;
    },
    create() {
      if (!this.title.trim()) return;
      playerStore.createPlaylist(this.title, this.description);
      this.closeModal();
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
  max-width: 440px;
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
  padding: 20px 24px;
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
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.form-input, .form-textarea {
  background-color: #3e3e3e;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #ffffff;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
}

.form-input:focus, .form-textarea:focus {
  border-color: #ffffff;
  background-color: #333333;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
}

.btn-primary {
  background-color: var(--spotify-green);
  color: #000000;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--spotify-green-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  color: var(--text-subdued);
}

.btn-secondary:hover {
  color: #ffffff;
}
</style>

