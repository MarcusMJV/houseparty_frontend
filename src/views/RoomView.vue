<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

interface Song {
  id: string
  name: string
  artists: string[]
  album: string
  duration_ms: number
  image: { url: string; width: number; height: number }
  external_url: string
  uri: string
  explicit: boolean
}

declare global {
  interface Window {
    Spotify: {
      Player: new (opts: {
        name: string
        getOAuthToken: (cb: (token: string) => void) => void
        volume?: number
        robustness?: string
      }) => SpotifyPlayerInstance
    }
    onSpotifyWebPlaybackSDKReady: () => void
  }
}

interface SpotifyPlayerInstance {
  connect(): Promise<boolean>
  disconnect(): void
  addListener(event: string, cb: (data: Record<string, unknown>) => void): void
}

const route = useRoute()
const roomCode = route.params.roomCode as string
const name = history.state?.name as string

const users = ref<string[]>([])
const searchOpen = ref(false)
const searchQuery = ref('')
const songs = ref<Song[]>([])
const toastMessage = ref('')
const toastVisible = ref(false)
const currentSong = ref<Song | null>(null)
const remainingMs = ref(0)
const playlist = ref<Song[]>([])

let toastTimer: ReturnType<typeof setTimeout> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null
let spotifyPlayer: SpotifyPlayerInstance | null = null
let deviceId = ''

function showToast(message: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toastMessage.value = message
  toastVisible.value = true
  toastTimer = setTimeout(() => { toastVisible.value = false }, 4000)
}

function sendEvent(type: string, payload: unknown) {
  console.log('Event sent:', type, payload)
  ws?.send(JSON.stringify({ type, payload }))
}

function submitSearch() {
  if (!searchQuery.value.trim()) return
  sendEvent('search-song', { search: searchQuery.value.trim() })
}

function selectSong(song: Song) {
  sendEvent('add-song', song)
  songs.value = []
  searchQuery.value = ''
  searchOpen.value = false
}

function closeSearch() {
  songs.value = []
  searchQuery.value = ''
  searchOpen.value = false
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function startCountdown(durationMs: number) {
  if (countdownInterval) clearInterval(countdownInterval)
  remainingMs.value = durationMs
  countdownInterval = setInterval(() => {
    remainingMs.value = Math.max(0, remainingMs.value - 1000)
    if (remainingMs.value <= 0) {
      clearInterval(countdownInterval!)
      countdownInterval = null
    }
  }, 1000)
}

function loadSpotifySDK(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Spotify) { resolve(); return }
    window.onSpotifyWebPlaybackSDKReady = resolve
    if (!document.querySelector('script[src*="spotify-player"]')) {
      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true
      document.head.appendChild(script)
    }
  })
}

async function playSong(song: Song, token: string) {
  currentSong.value = song
  startCountdown(song.duration_ms)

  await loadSpotifySDK()

  if (spotifyPlayer) {
    spotifyPlayer.disconnect()
    spotifyPlayer = null
    deviceId = ''
  }

  spotifyPlayer = new window.Spotify.Player({
    name: 'HouseParty',
    getOAuthToken: (cb) => cb(token),
    volume: 0.8,
    robustness: 'SW_SECURE_CRYPTO',
  })

  const deviceReady = new Promise<string>((resolve) => {
    spotifyPlayer!.addListener('ready', (data) => {
      deviceId = data.device_id as string
      resolve(deviceId)
    })
  })

  await spotifyPlayer.connect()
  const id = await deviceReady

  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [song.uri] }),
  })
}

function handleEvent(raw: string) {
  const event = JSON.parse(raw) as { type: string; payload: unknown }
  console.log('Event received:', event.type, event.payload)

  if (event.type === 'joined_room') {
    const payload = event.payload as { message: string; users: string[] }
    users.value = payload.users
    showToast(payload.message)
  }

  if (event.type === 'user_joined') {
    const payload = event.payload as { name: string }
    users.value.push(payload.name)
    showToast(`${payload.name} has joined`)
  }

  if (event.type === 'searched_song') {
    const payload = event.payload as { songs: Song[] }
    songs.value = payload.songs
  }

  if (event.type === 'set_song') {
    const payload = event.payload as { song: Song; token: string }
    playSong(payload.song, payload.token)
  }

  if (event.type === 'update_playlist') {
    const payload = event.payload as { song: Song }
    playlist.value.push(payload.song)
  }
}

let ws: WebSocket | null = null

onMounted(() => {
  ws = new WebSocket(`ws://localhost:8080/join/room/${roomCode}/${encodeURIComponent(name)}`)

  ws.onopen = () => {
    sendEvent('join-room', { name })
  }

  ws.onmessage = (event) => {
    handleEvent(event.data)
  }

  ws.onerror = (event) => {
    console.error('WebSocket error:', event)
  }

  ws.onclose = (event) => {
    console.log('WebSocket closed:', event.code, event.reason)
  }
})

onUnmounted(() => {
  ws?.close()
  spotifyPlayer?.disconnect()
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<template>
  <div class="page">
    <div class="glow" aria-hidden="true"></div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toastVisible" class="toast" role="alert">
        {{ toastMessage }}
      </div>
    </transition>

    <!-- GitHub link -->
    <a
      href="https://github.com/MarcusMJV/houseparty_backend"
      target="_blank"
      rel="noopener noreferrer"
      class="github-link fixed top-5 right-5"
      aria-label="GitHub repository"
    >
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577
                 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756
                 -1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304
                 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931
                 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322
                 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404
                 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84
                 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823
                 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 21.795
                 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    </a>

    <!-- Main card -->
    <div class="card slide-up">
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-3">
          <h1 class="text-5xl font-bold tracking-tight text-white">
            House<span class="accent">Party</span>
          </h1>
          <svg class="eq-icon" viewBox="0 0 27 24" fill="currentColor" aria-hidden="true">
            <rect class="bar bar-1" x="0"  y="9"  width="3" height="6"  rx="1.5"/>
            <rect class="bar bar-2" x="6"  y="5"  width="3" height="14" rx="1.5"/>
            <rect class="bar bar-3" x="12" y="2"  width="3" height="20" rx="1.5"/>
            <rect class="bar bar-4" x="18" y="6"  width="3" height="12" rx="1.5"/>
            <rect class="bar bar-5" x="24" y="9"  width="3" height="6"  rx="1.5"/>
          </svg>
        </div>
        <p class="tagline">Room <span class="accent">{{ roomCode }}</span> · {{ users.length }} connected</p>
      </div>

      <!-- Now playing -->
      <transition name="now-playing">
        <div v-if="currentSong" class="now-playing">
          <p class="now-playing-label">Now Playing</p>
          <div class="song-row now-playing-row">
            <img :src="currentSong.image.url" :alt="currentSong.name" class="song-img song-img--lg" />
            <div class="song-info">
              <span class="song-name">{{ currentSong.name }}</span>
              <span class="song-artist">{{ currentSong.artists.join(', ') }}</span>
            </div>
            <span class="song-duration countdown">{{ formatDuration(remainingMs) }}</span>
          </div>
        </div>
      </transition>

      <!-- Playlist -->
      <div v-if="playlist.length" class="playlist">
        <p class="now-playing-label">Up Next</p>
        <ul class="playlist-list">
          <li v-for="song in playlist" :key="song.id" class="song-row playlist-row">
            <img :src="song.image.url" :alt="song.name" class="song-img" />
            <div class="song-info">
              <span class="song-name">{{ song.name }}</span>
              <span class="song-artist">{{ song.artists.join(', ') }}</span>
            </div>
            <span class="song-duration">{{ formatDuration(song.duration_ms) }}</span>
          </li>
        </ul>
      </div>

      <!-- Search button -->
      <button class="btn-search" @click="searchOpen = true" aria-label="Search songs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>
    </div>

    <!-- Backdrop -->
    <transition name="backdrop">
      <div v-if="searchOpen" class="backdrop" @click="closeSearch" />
    </transition>

    <!-- Search card -->
    <transition name="search-card">
      <div v-if="searchOpen" class="search-card">
        <p class="search-title">Search for a song</p>

        <form class="search-form" @submit.prevent="submitSearch">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Artist, song, album…"
            class="input-field"
            autofocus
          />
          <button type="submit" class="btn-search-submit" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </form>

        <!-- Results -->
        <ul v-if="songs.length" class="results-list">
          <li
            v-for="song in songs"
            :key="song.id"
            class="song-row"
            @click="selectSong(song)"
          >
            <img :src="song.image.url" :alt="song.name" class="song-img" />
            <div class="song-info">
              <span class="song-name">{{ song.name }}</span>
              <span class="song-artist">{{ song.artists.join(', ') }}</span>
            </div>
            <span class="song-duration">{{ formatDuration(song.duration_ms) }}</span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: radial-gradient(ellipse 80% 60% at 50% 50%, #181820 0%, #0d0d0d 100%);
  position: relative;
  overflow: hidden;
}

.glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(124, 58, 237, 0.12) 0%,
    rgba(59, 130, 246, 0.06) 45%,
    transparent 70%
  );
  filter: blur(40px);
  pointer-events: none;
}

.card {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.75rem;
  width: 100%;
  max-width: 30rem;
  padding: 3.25rem 2.75rem;
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 2px 0 rgba(255, 255, 255, 0.04) inset,
    0 24px 64px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(0, 0, 0, 0.4);
}

.accent { color: #1DB954; }

.eq-icon {
  width: 2.25rem;
  height: 2.25rem;
  color: #1DB954;
}

.tagline {
  font-size: 0.875rem;
  color: #6b7280;
  letter-spacing: 0.025em;
  margin-top: 0.25rem;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.slide-up {
  opacity: 0;
  animation: slide-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes eq {
  0%, 100% { transform: scaleY(0.3); }
  50%       { transform: scaleY(1); }
}
.bar { transform-origin: center; animation: eq 0.9s ease-in-out infinite; }
.bar-1 { animation-delay: 0.00s; }
.bar-2 { animation-delay: 0.18s; }
.bar-3 { animation-delay: 0.36s; }
.bar-4 { animation-delay: 0.18s; }
.bar-5 { animation-delay: 0.00s; }

.github-link {
  color: #444;
  transition: color 0.2s ease;
}
.github-link:hover { color: #fff; }

.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  background: #111613;
  border: 1px solid rgba(29, 185, 84, 0.4);
  color: #86efac;
  font-size: 0.875rem;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
.toast-enter-active, .toast-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }

/* ── Now playing ──────────────────────────────────── */
.now-playing {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.now-playing-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1DB954;
}

.now-playing-row {
  background: rgba(29, 185, 84, 0.06);
  border: 1px solid rgba(29, 185, 84, 0.15);
  cursor: default;
}
.now-playing-row:hover { background: rgba(29, 185, 84, 0.09); }

.song-img--lg {
  width: 3.25rem;
  height: 3.25rem;
}

.countdown {
  color: #1DB954;
  font-variant-numeric: tabular-nums;
}

.now-playing-enter-active { transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.now-playing-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.now-playing-enter-from, .now-playing-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── Playlist ─────────────────────────────────────── */
.playlist {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.playlist-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 12rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(29, 185, 84, 0.3) transparent;
}
.playlist-list::-webkit-scrollbar { width: 4px; }
.playlist-list::-webkit-scrollbar-track { background: transparent; }
.playlist-list::-webkit-scrollbar-thumb { background: rgba(29, 185, 84, 0.3); border-radius: 2px; }

.playlist-row { cursor: default; }

/* ── Search button ────────────────────────────────── */
.btn-search {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid rgba(29, 185, 84, 0.35);
  background: #111613;
  color: #1DB954;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}
.btn-search svg { width: 1.25rem; height: 1.25rem; }
.btn-search:hover {
  transform: translateY(-1px);
  border-color: rgba(29, 185, 84, 0.85);
  box-shadow: 0 6px 28px rgba(29, 185, 84, 0.28);
}

/* ── Backdrop ─────────────────────────────────────── */
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
}
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.3s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

/* ── Search card ──────────────────────────────────── */
.search-card {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  width: 90%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 2rem 1.5rem;
  border-radius: 2rem;
  background: #13131a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.7);
  max-height: 80vh;
  overflow: hidden;
}

.search-title {
  font-size: 1rem;
  font-weight: 600;
  color: #e5e7eb;
  text-align: center;
}

.search-form {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
}

.input-field {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 0.875rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #e5e7eb;
  font-size: 0.975rem;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.input-field::placeholder { color: #6b7280; }
.input-field:focus {
  border-color: #1DB954;
  background: rgba(255, 255, 255, 0.09);
}

.btn-search-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.875rem;
  background: #111613;
  color: #1DB954;
  border: 2px solid rgba(29, 185, 84, 0.35);
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}
.btn-search-submit svg { width: 1.1rem; height: 1.1rem; }
.btn-search-submit:hover {
  transform: translateY(-1px);
  border-color: rgba(29, 185, 84, 0.85);
  box-shadow: 0 4px 16px rgba(29, 185, 84, 0.28);
}
.btn-search-submit:active { transform: scale(0.95); }

/* ── Results ──────────────────────────────────────── */
.results-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  max-height: 18rem;
  margin: 0;
  padding: 0;
}

.song-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.6rem 0.5rem;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: background 0.15s ease;
}
.song-row:hover { background: rgba(255, 255, 255, 0.06); }

.song-img {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.5rem;
  object-fit: cover;
  flex-shrink: 0;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e5e7eb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.8rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  font-size: 0.8rem;
  color: #6b7280;
  flex-shrink: 0;
}

/* ── Search card slide-up transition ─────────────── */
.search-card-enter-active { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease; }
.search-card-leave-active { transition: transform 0.25s ease, opacity 0.2s ease; }
.search-card-enter-from, .search-card-leave-to { transform: translateX(-50%) translateY(2rem); opacity: 0; }
</style>
