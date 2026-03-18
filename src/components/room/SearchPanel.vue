<script setup lang="ts">
import { ref } from 'vue'
import type { Song } from '@/types/song'
import { formatDuration } from '@/utils/formatDuration'

defineProps<{ results: Song[] }>()

const emit = defineEmits<{
  'submit-search': [query: string]
  'select-song': [song: Song]
}>()

const query = ref('')

function submitSearch() {
  if (!query.value.trim()) return
  emit('submit-search', query.value.trim())
}

function selectSong(song: Song) {
  emit('select-song', song)
  query.value = ''
}
</script>

<template>
  <div class="search-card">
    <p class="search-title">Search for a song</p>

    <form class="search-form" @submit.prevent="submitSearch">
      <input
        v-model="query"
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

    <ul v-if="results.length" class="results-list">
      <li
        v-for="song in results"
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
</template>

<style scoped>
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

.results-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  max-height: 18rem;
  margin: 0;
  padding: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(29, 185, 84, 0.3) transparent;
}
.results-list::-webkit-scrollbar { width: 4px; }
.results-list::-webkit-scrollbar-track { background: transparent; }
.results-list::-webkit-scrollbar-thumb { background: rgba(29, 185, 84, 0.3); border-radius: 2px; }

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
