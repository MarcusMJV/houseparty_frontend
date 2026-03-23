<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Song } from '@/types/song'
import { API_BASE, WS_BASE } from '@/utils/api'
import RoomToast from '@/components/room/RoomToast.vue'
import NowPlaying from '@/components/room/NowPlaying.vue'
import PlaylistQueue from '@/components/room/PlaylistQueue.vue'
import RoomControls from '@/components/room/RoomControls.vue'
import ResumeOverlay from '@/components/room/ResumeOverlay.vue'
import UsersPanel from '@/components/room/UsersPanel.vue'
import SearchPanel from '@/components/room/SearchPanel.vue'

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
  activateElement(): void
}

const route = useRoute()
const router = useRouter()
const roomCode = route.params.roomCode as string
const name = history.state?.name as string

const users = ref<Record<string, string>>({})
const skip_record = ref<string[]>([])
const hostId = ref('')
const clientId = ref('')
const searchOpen = ref(false)
const songs = ref<Song[]>([])
const toastMessage = ref('')
const toastVisible = ref(false)
const currentSong = ref<Song | null>(null)
const remainingMs = ref(0)
const playlist = ref<Song[]>([])
const usersOpen = ref(false)
const resumeVisible = ref(false)

let resumeSong: Song | null = null
let resumeStartTime = ''
let toastTimer: ReturnType<typeof setTimeout> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null
let spotifyPlayer: SpotifyPlayerInstance | null = null
let playerActivated = false
let deviceId = ''
let currentToken = ''

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

function onSearch(query: string) {
  sendEvent('search-song', { search: query })
}

function selectSong(song: Song) {
  sendEvent('add-song', song)
  songs.value = []
  searchOpen.value = false
}

function startCountdown(durationMs: number) {
  if (countdownInterval) clearInterval(countdownInterval)
  remainingMs.value = durationMs
  countdownInterval = setInterval(() => {
    remainingMs.value = Math.max(0, remainingMs.value - 1000)
    if (remainingMs.value <= 0) {
      clearInterval(countdownInterval!)
      countdownInterval = null
      if (clientId.value === hostId.value) sendEvent('song-ended', {})
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

function reloadSpotifySDK(): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="spotify-player"]')
    if (existing) existing.remove()
    ;(window as unknown as { Spotify: unknown }).Spotify = undefined
    window.onSpotifyWebPlaybackSDKReady = resolve
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.head.appendChild(script)
  })
}

function createPlayer() {
  if (spotifyPlayer || !window.Spotify) return
  spotifyPlayer = new window.Spotify.Player({
    name: 'HouseParty',
    getOAuthToken: (cb) => cb(currentToken),
    volume: 0.8,
  })
  spotifyPlayer.addListener('initialization_error', (data) => {
    console.error('Spotify init error:', data)
    window.location.reload()
  })
  spotifyPlayer.addListener('authentication_error', (data) => {
    console.error('Spotify auth error:', data)
    window.location.reload()
  })
  spotifyPlayer.addListener('account_error', (data) => {
    console.error('Spotify account error:', data)
    window.location.reload()
  })
  spotifyPlayer.addListener('playback_error', (data) => {
    console.error('Spotify playback error:', data)
    window.location.reload()
  })
  spotifyPlayer.addListener('ready', (data) => {
    deviceId = data.device_id as string
    console.log('Spotify player ready, device_id:', deviceId)
  })
  spotifyPlayer.addListener('not_ready', (data) => console.warn('Spotify player not ready:', data))
}

async function playSong(song: Song, positionMs = 0) {
  currentSong.value = song

  await loadSpotifySDK()
  createPlayer()

  if (!playerActivated) {
    resumeSong = song
    resumeStartTime = new Date(Date.now() - positionMs).toISOString()
    resumeVisible.value = true
    startCountdown(song.duration_ms - positionMs)
    return
  }

  if (!deviceId) {
    const deviceReady = new Promise<string>((resolve, reject) => {
      spotifyPlayer!.addListener('ready', (data) => {
        deviceId = data.device_id as string
        resolve(deviceId)
      })
      spotifyPlayer!.addListener('not_ready', () => reject(new Error('Spotify player not ready')))
    })

    const connected = await spotifyPlayer!.connect()
    if (!connected) {
      console.error('Spotify player failed to connect')
      spotifyPlayer = null
      playerActivated = false
      return
    }

    await deviceReady

    await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_ids: [deviceId], play: false }),
    })

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${currentToken}` },
  })

  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${currentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [song.uri], position_ms: positionMs }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('Spotify play API error:', res.status, body)
    if (res.status === 404) {
      spotifyPlayer?.disconnect()
      spotifyPlayer = null
      deviceId = ''
      playerActivated = false
      playSong(song, positionMs)
    }
    return
  }

  const actualStartTime = new Date(Date.now() - positionMs).toISOString()
  sendEvent('song-started', { start_time: actualStartTime })
  startCountdown(song.duration_ms - positionMs)
}

function selectNewHost(id: string) {
  sendEvent('selected-new-host', { id })
  spotifyPlayer?.disconnect()
  spotifyPlayer = null
  deviceId = ''
  playerActivated = false
}

function voteSkip() {
  if (skip_record.value.includes(name)) return
  sendEvent('song-skip-vote', { user: name })
}

function resumePlayback() {
  if (!resumeSong) return

  createPlayer()
  if (spotifyPlayer && !playerActivated) {
    spotifyPlayer.activateElement()
    playerActivated = true
  }

  const positionMs = Math.min(
    Math.max(0, Date.now() - new Date(resumeStartTime).getTime()),
    resumeSong.duration_ms,
  )
  resumeVisible.value = false
  playSong(resumeSong, positionMs)
}

function handleEvent(raw: string) {
  const event = JSON.parse(raw) as { type: string; payload: unknown }
  console.log('Event received:', event.type, event.payload)

  if (event.type === 'joined_room') {
    const payload = event.payload as {
      message: string
      users: Record<string, string>
      host: string
      client_id: string
      current_song: Song | null
      current_song_start_time: string
      playlist: Song[]
      skip_record: string[]
      token: string
    }
    users.value = payload.users
    hostId.value = payload.host
    clientId.value = payload.client_id
    playlist.value = payload.playlist ?? []
    skip_record.value = payload.skip_record ?? []
    currentToken = payload.token
    currentSong.value = payload.current_song
    if (payload.client_id === payload.host) {
      loadSpotifySDK().then(createPlayer)
    }
    if (payload.current_song) {
      const elapsed = Math.max(0, Date.now() - new Date(payload.current_song_start_time).getTime())
      const remaining = Math.max(0, payload.current_song.duration_ms - elapsed)
      startCountdown(remaining)
      if (payload.client_id === payload.host) {
        resumeSong = payload.current_song
        resumeStartTime = payload.current_song_start_time
        resumeVisible.value = true
      }
    }
    showToast(payload.message)
  }

  if (event.type === 'user_joined') {
    const payload = event.payload as { name: string; id: string }
    users.value[payload.name] = payload.id
    showToast(`${payload.name} has joined`)
  }

  if (event.type === 'searched_song') {
    const payload = event.payload as { songs: Song[] }
    songs.value = payload.songs
  }

  if (event.type === 'set_song') {
    const payload = event.payload as { song: Song; token: string }
    currentToken = payload.token
    if (clientId.value === hostId.value) {
      playSong(payload.song)
    } else {
      currentSong.value = payload.song
      startCountdown(payload.song.duration_ms)
    }
  }

  if (event.type === 'last_song_ended') {
    currentSong.value = null
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
    if (clientId.value === hostId.value) {
      fetch('https://api.spotify.com/v1/me/player/pause?device_id=' + deviceId, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${currentToken}` },
      })
    }
  }

  if (event.type === 'play_next') {
    const payload = event.payload as { token: string }
    currentToken = payload.token
    const next = playlist.value.shift()
    if (!next) return
    if (clientId.value === hostId.value) {
      playSong(next)
    } else {
      currentSong.value = next
      startCountdown(next.duration_ms)
    }
  }

  if (event.type === 'update_playlist') {
    const payload = event.payload as { song: Song }
    playlist.value.push(payload.song)
  }

  if (event.type === 'update_start_time') {
    const payload = event.payload as { start_time: string }
    if (currentSong.value) {
      const remaining = Math.max(0, currentSong.value.duration_ms - (Date.now() - new Date(payload.start_time).getTime()))
      startCountdown(remaining)
    }
  }

  if (event.type === 'song_skipped') {
    skip_record.value = []
    showToast('Song skipped')
  }

  if (event.type === 'song_skip_vote') {
    const payload = event.payload as { user: string }
    skip_record.value.push(payload.user)
    showToast(`${payload.user} voted to skip`)
  }

  if (event.type === 'set_host') {
    const payload = event.payload as { message: string; host: string; token: string; current_song_start_time: string }
    hostId.value = payload.host
    currentToken = payload.token
    showToast(payload.message)
    spotifyPlayer?.disconnect()
    spotifyPlayer = null
    deviceId = ''
    playerActivated = false
    reloadSpotifySDK().then(createPlayer)
    if (currentSong.value) {
      resumeSong = currentSong.value
      resumeStartTime = payload.current_song_start_time
      resumeVisible.value = true
    }
  }

  if (event.type === 'update_host') {
    const payload = event.payload as { message: string; host: string; token: string; current_song_start_time: string }
    hostId.value = payload.host
    showToast(payload.message)
    if (currentSong.value) {
      const remaining = Math.max(0, currentSong.value.duration_ms - (Date.now() - new Date(payload.current_song_start_time).getTime()))
      startCountdown(remaining)
    }
  }

  if (event.type === 'user_left') {
    const payload = event.payload as { name: string; id: string }
    delete users.value[payload.name]
    skip_record.value = skip_record.value.filter(n => n !== payload.name)
    showToast(`${payload.name} has left`)
  }
}

let ws: WebSocket | null = null

onMounted(async () => {
  if (!name) {
    router.replace({ path: '/', state: { roomCode } })
    return
  }

  const check = await fetch(`${API_BASE}/join/room/${roomCode}/${encodeURIComponent(name)}`)
  if (!check.ok) {
    const data = await check.json().catch(() => ({})) as { message?: string }
    if (data?.message === 'Room code is incorrect.') {
      router.replace({ path: '/', state: { error: data.message } })
      return
    }
  }

  ws = new WebSocket(`${WS_BASE}/join/room/${roomCode}/${encodeURIComponent(name)}`)

  ws.onopen = () => { sendEvent('join-room', { name }) }
  ws.onmessage = (event) => { handleEvent(event.data) }
  ws.onerror = (event) => { console.error('WebSocket error:', event) }
  ws.onclose = (event) => { console.log('WebSocket closed:', event.code, event.reason) }
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

    <RoomToast :message="toastMessage" :visible="toastVisible" />

    <a
      href="https://marcusmjv.github.io/portfolio/"
      target="_blank"
      rel="noopener noreferrer"
      class="github-link fixed top-5 right-14"
      aria-label="Portfolio"
    >
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    </a>

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
        <p class="tagline">Room <span class="accent">{{ roomCode }}</span> · {{ Object.keys(users).length }} connected</p>
      </div>

      <NowPlaying :song="currentSong" :remaining-ms="remainingMs" />

      <PlaylistQueue :playlist="playlist" />

      <RoomControls
        :has-song="!!currentSong"
        :skip-count="skip_record.length"
        :total-users="Object.keys(users).length"
        @open-users="usersOpen = true"
        @open-search="searchOpen = true"
        @vote-skip="voteSkip"
      />
    </div>

    <ResumeOverlay :visible="resumeVisible" @resume="resumePlayback" />

    <transition name="backdrop">
      <div v-if="searchOpen || usersOpen" class="backdrop" @click="searchOpen = false; usersOpen = false" />
    </transition>

    <transition name="search-card">
      <UsersPanel
        v-if="usersOpen"
        :users="users"
        :host-id="hostId"
        :client-id="clientId"
        @select-host="selectNewHost"
      />
    </transition>

    <transition name="search-card">
      <SearchPanel
        v-if="searchOpen"
        :results="songs"
        @submit-search="onSearch"
        @select-song="selectSong"
      />
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

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
}
.backdrop-enter-active,
.backdrop-leave-active { transition: opacity 0.3s ease; }
.backdrop-enter-from,
.backdrop-leave-to { opacity: 0; }

.search-card-enter-active { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease; }
.search-card-leave-active { transition: transform 0.25s ease, opacity 0.2s ease; }
.search-card-enter-from,
.search-card-leave-to { transform: translateX(-50%) translateY(2rem); opacity: 0; }
</style>
