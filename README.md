# 🎧 Spotify Clone – Web Player (Vue.js Options API)

A full-featured, dark-themed **Spotify Web Player Clone** built with **Vue.js 3** using strictly the **Options API** (`data`, `computed`, `methods`, `watch`, `mounted`).

Features real music streaming, live synchronized karaoke lyrics, queue management, custom playlists, liked songs, mini-player, fullscreen mode, and dual-engine search supporting both the **Spotify Web API** (using your Bearer Token) and an open **Public Music API Engine** with zero auth expiration!

---

## ✨ Key Features

### 1. 🎵 Full Web Player Controls
* **Real HTML5 Audio Playback**: Instant audio streaming with play, pause, resume, seek, and buffer detection.
* **Smart Audio Resolver**: If a Spotify search track doesn't include an audio stream (due to Spotify's recent preview deprecation), the player automatically resolves and streams the matching 30-second high-quality audio clip seamlessly!
* **Scrubber Bar**: Interactive Spotify-styled progress scrubber with hover thumb and elapsed / remaining time display.
* **Volume Controls**: Custom volume slider with hover green fill, mute/unmute toggle, and dynamic volume icons.
* **Shuffle & Repeat**:
  * Shuffle: Randomizes queue with visual green indicator dot.
  * Repeat: Supports 3-state cycling (`Off` → `Repeat All` → `Repeat One 🔂`).
* **Now Playing Info**: High-res album artwork, track title with hover links, artist name, and animated like button.

### 2. ⚡ Vue.js Framework Options API
* Built 100% with the standard **Vue.js Options API**:
  * `export default { name: '...', data() { return { ... } }, computed: { ... }, methods: { ... }, mounted() { ... } }`
  * No Composition API `<script setup>` in components.

### 3. 🌐 Dual-Engine Music & API Support
* **Spotify Web API**:
  * Pre-configured with the provided Bearer token:
    ```bash
    curl -X GET "https://api.spotify.com/v1/search?q=daft+punk&type=track&limit=1" -H "Authorization: Bearer BQAkjCPYxtRRGibJ1M1nJzCrvrkBg4_x0_447u-VtpOuRwY4a4ed0pFVo5NL-nwdBypK9gQcNOAP2ldXVkISQzfZdTA5W3oXfzrG3zafKVmGkZU_WaTb5EHYPTH_0X0Y43ats9OftwJi"
    ```
  * Active / Expired token detection banner.
  * In-app **Spotify API Token Modal** allowing you to test, update, and renew your Bearer token at any time.
* **Public Music API (Open Access Engine)**:
  * Powered by iTunes Search API with CORS support.
  * Zero auth required, never expires, instant 30-second AAC/M4A streaming for millions of songs.

### 4. 🤖 Daft Punk Spotlight & Curated Catalog
* Dedicated **"Daft Punk Essentials"** spotlight featuring:
  * *Instant Crush (feat. Julian Casablancas)*
  * *Get Lucky (feat. Pharrell Williams & Nile Rodgers)*
  * *One More Time*
  * *Harder, Better, Faster, Stronger*
  * *Around the World*
  * *Veridis Quo*
  * *Starboy (feat. Daft Punk)*
  * *Lose Yourself to Dance*
* Curated playlists: *Today's Top Hits*, *Synthwave & Electronic Chill*, and *Electronic Classics*.

### 5. 🎤 Synchronized Karaoke Lyrics View
* Spotify-style ambient backdrop.
* Line-by-line lyrics highlighted in real-time as the audio plays.
* **Interactive Seeking**: Click any lyric line to jump directly to that point in the song!

### 6. 📑 Queue Drawer & Up Next
* Real-time play queue showing:
  * Currently playing track with animated jumping equalizer bars.
  * Next upcoming tracks.
  * Quick removal of tracks from queue or one-click "Clear queue".

### 7. 💜 Liked Songs & Custom Playlists
* **Liked Songs**: Spotify's iconic purple-gradient banner, instant heart toggling, persisted in `localStorage`.
* **Custom Playlists**: Create custom playlists with title and description, add/remove songs via right-click or track options menu (`...`).

### 8. 🖼️ Mini-Player & Fullscreen Immersive Mode
* **Mini-Player**: Compact picture-in-picture floating player widget at the bottom right.
* **Fullscreen Mode**: Cinema-style fullscreen player with giant album cover, large controls, and Escape key support.

### 9. ⌨️ Global Keyboard Shortcuts
| Shortcut | Action |
| :--- | :--- |
| **`Space`** | Play / Pause |
| **`ArrowRight`** | Seek forward 5s |
| **`ArrowLeft`** | Seek back 5s |
| **`Shift + ArrowRight`** | Next track |
| **`Shift + ArrowLeft`** | Previous track |
| **`M`** | Mute / Unmute |
| **`L`** | Like / Unlike current track |
| **`Esc`** | Exit Fullscreen mode |

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.
