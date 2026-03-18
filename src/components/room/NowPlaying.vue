<script setup lang="ts">
import type { Song } from '@/types/song'
import { formatDuration } from '@/utils/formatDuration'

defineProps<{ song: Song | null; remainingMs: number }>()
</script>

<template>
  <transition name="now-playing" mode="out-in">
    <div v-if="!song" key="empty" class="no-song">
      <p class="no-song-text">No song playing</p>
      <p class="no-song-sub">Search and choose a song to get the party started</p>
    </div>
    <div v-else key="playing" class="now-playing">
      <p class="now-playing-label">Now Playing</p>
      <div class="song-row now-playing-row">
        <img :src="song.image.url" :alt="song.name" class="song-img song-img--lg" />
        <div class="song-info">
          <span class="song-name">{{ song.name }}</span>
          <span class="song-artist">{{ song.artists.join(', ') }}</span>
        </div>
        <span class="song-duration countdown">{{ formatDuration(remainingMs) }}</span>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.no-song {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1.25rem 0;
}
.no-song-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
}
.no-song-sub {
  font-size: 0.78rem;
  color: #374151;
  text-align: center;
  line-height: 1.4;
}

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
.now-playing-enter-from,
.now-playing-leave-to { opacity: 0; transform: translateY(-8px); }

/* song-row shared block */
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
</style>
