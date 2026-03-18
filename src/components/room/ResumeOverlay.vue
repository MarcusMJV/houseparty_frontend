<script setup lang="ts">
defineProps<{ visible: boolean }>()
defineEmits<{ resume: [] }>()
</script>

<template>
  <transition name="backdrop">
    <div v-if="visible" class="resume-overlay">
      <div class="resume-card">
        <p class="resume-title">Music is playing</p>
        <p class="resume-sub">Tap to resume playback in this tab</p>
        <button class="btn-resume" @click="$emit('resume')">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Resume
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.resume-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
}
.resume-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 2rem;
  border-radius: 2rem;
  background: #13131a;
  border: 1px solid rgba(29, 185, 84, 0.25);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.7);
  text-align: center;
}
.resume-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e5e7eb;
}
.resume-sub {
  font-size: 0.85rem;
  color: #6b7280;
}
.btn-resume {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 999px;
  background: #1DB954;
  color: #000;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.btn-resume svg { width: 1rem; height: 1rem; }
.btn-resume:hover { transform: scale(1.04); box-shadow: 0 6px 24px rgba(29, 185, 84, 0.4); }
.btn-resume:active { transform: scale(0.97); }

.backdrop-enter-active,
.backdrop-leave-active { transition: opacity 0.3s ease; }
.backdrop-enter-from,
.backdrop-leave-to { opacity: 0; }
</style>
