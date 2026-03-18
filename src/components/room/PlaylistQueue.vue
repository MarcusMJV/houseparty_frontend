<script setup lang="ts">
import type { Song } from '@/types/song'
import { formatDuration } from '@/utils/formatDuration'

defineProps<{ playlist: Song[] }>()
</script>

<template>
  <div v-if="playlist.length" class="playlist">
    <p class="section-label">Up Next</p>
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
</template>

<style scoped>
.playlist {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.section-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1DB954;
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
