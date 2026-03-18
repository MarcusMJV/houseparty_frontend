<script setup lang="ts">
defineProps<{ hasSong: boolean; skipCount: number; totalUsers: number }>()
defineEmits<{
  'open-users': []
  'open-search': []
  'vote-skip': []
}>()
</script>

<template>
  <div class="controls-wrap">
    <div class="controls-row">
      <button class="btn-control" @click="$emit('open-users')" aria-label="View users">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </button>

      <button class="btn-search" @click="$emit('open-search')" aria-label="Search songs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>

      <button class="btn-control" @click="$emit('vote-skip')" aria-label="Skip song">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 4 15 12 5 20 5 4"/>
          <line x1="19" y1="5" x2="19" y2="19"/>
        </svg>
      </button>
    </div>

    <span v-if="hasSong" class="skip-count">
      {{ skipCount }}/{{ totalUsers }} Skips
    </span>
  </div>
</template>

<style scoped>
.controls-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}
.btn-control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.22s ease, color 0.22s ease;
}
.btn-control svg { width: 1rem; height: 1rem; }
.btn-control:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.35);
  color: #e5e7eb;
}
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
.skip-count {
  font-size: 0.65rem;
  color: #6b7280;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
</style>
