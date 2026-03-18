<script setup lang="ts">
defineProps<{
  users: Record<string, string>
  hostId: string
  clientId: string
}>()

defineEmits<{ 'select-host': [id: string] }>()
</script>

<template>
  <div class="search-card">
    <p class="search-title">Connected Users</p>
    <ul class="results-list">
      <li
        v-for="(id, name) in users"
        :key="id"
        class="user-row"
        :class="{ 'user-row--selectable': clientId === hostId && id !== hostId }"
        @click="clientId === hostId && id !== hostId && $emit('select-host', id as string)"
      >
        <div class="user-avatar">{{ String(name).charAt(0).toUpperCase() }}</div>
        <div class="song-info">
          <span class="song-name">{{ name }}</span>
          <span v-if="id === hostId" class="host-label">host</span>
        </div>
        <svg v-if="id === hostId" class="eq-icon" viewBox="0 0 27 24" fill="currentColor" aria-hidden="true">
          <rect class="bar bar-1" x="0"  y="9"  width="3" height="6"  rx="1.5"/>
          <rect class="bar bar-2" x="6"  y="5"  width="3" height="14" rx="1.5"/>
          <rect class="bar bar-3" x="12" y="2"  width="3" height="20" rx="1.5"/>
          <rect class="bar bar-4" x="18" y="6"  width="3" height="12" rx="1.5"/>
          <rect class="bar bar-5" x="24" y="9"  width="3" height="6"  rx="1.5"/>
        </svg>
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

.user-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.6rem 0.5rem;
  border-radius: 0.875rem;
}
.user-row--selectable { cursor: pointer; }
.user-row--selectable:hover { background: rgba(255, 255, 255, 0.06); }

.user-avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: rgba(29, 185, 84, 0.15);
  border: 1px solid rgba(29, 185, 84, 0.25);
  color: #1DB954;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
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
.host-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #1DB954;
}
.eq-icon {
  width: 1rem;
  height: 1rem;
  color: #1DB954;
  margin-left: auto;
  flex-shrink: 0;
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
</style>
