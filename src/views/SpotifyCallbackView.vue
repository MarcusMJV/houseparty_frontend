<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_BASE } from '@/utils/api'

const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (!code) {
    loading.value = false
    error.value = 'No authorization code found in URL.'
    return
  }

  try {
    const res = await fetch(`${API_BASE}/spotify/${code}`)
    if (res.ok) {
      success.value = true
    } else {
      const data = await res.json().catch(() => ({}))
      error.value = data?.error ?? data?.message ?? `Server returned ${res.status}`
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not reach the server.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <div class="glow" aria-hidden="true"></div>
    <div class="card slide-up">
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

      <div v-if="loading" class="flex flex-col items-center gap-4">
        <svg class="spinner" viewBox="0 0 50 50" aria-label="Loading">
          <circle cx="25" cy="25" r="20" fill="none" stroke-width="4"/>
        </svg>
        <p class="status-text">Connecting Spotify…</p>
      </div>

      <div v-else-if="success" class="flex flex-col items-center gap-3">
        <svg class="w-12 h-12 text-[#1DB954]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="status-text accent">Spotify connected successfully!</p>
        <p class="sub-text">You can close this tab and return to the app.</p>
      </div>

      <div v-else class="flex flex-col items-center gap-3">
        <svg class="w-12 h-12 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="status-text text-red-400">Something went wrong</p>
        <p class="sub-text">{{ error }}</p>
      </div>
    </div>
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinner {
  width: 3rem;
  height: 3rem;
  animation: spin 0.8s linear infinite;
}
.spinner circle {
  stroke: #1DB954;
  stroke-linecap: round;
  stroke-dasharray: 80, 200;
  stroke-dashoffset: 0;
}

.status-text {
  font-size: 1rem;
  font-weight: 600;
  color: #e5e7eb;
  text-align: center;
}

.sub-text {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}
</style>
