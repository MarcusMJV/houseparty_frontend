<script setup lang="ts"></script>

<template>
  <div class="page">
    <!-- Soft glow behind card -->
    <div class="glow" aria-hidden="true"></div>

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

    <!-- Card -->
    <div class="card slide-up" style="animation-delay: 0ms;">

      <!-- Logo + tagline -->
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-3">
          <h1 class="text-5xl font-bold tracking-tight text-white">
            House<span class="accent">Party</span>
          </h1>
          <!-- Equalizer icon -->
          <svg class="eq-icon" viewBox="0 0 27 24" fill="currentColor" aria-hidden="true">
            <rect class="bar bar-1" x="0"  y="9"  width="3" height="6"  rx="1.5"/>
            <rect class="bar bar-2" x="6"  y="5"  width="3" height="14" rx="1.5"/>
            <rect class="bar bar-3" x="12" y="2"  width="3" height="20" rx="1.5"/>
            <rect class="bar bar-4" x="18" y="6"  width="3" height="12" rx="1.5"/>
            <rect class="bar bar-5" x="24" y="9"  width="3" height="6"  rx="1.5"/>
          </svg>
        </div>
        <p class="tagline">Queue music together with friends</p>
      </div>

      <!-- Buttons -->
      <div class="flex flex-col gap-3 w-full">
        <router-link to="/create" class="btn-primary slide-up" style="animation-delay: 140ms;">
          Create Room
        </router-link>
        <router-link to="/join" class="btn-secondary slide-up" style="animation-delay: 260ms;">
          Join Room
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Page ─────────────────────────────────────────── */
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background:
    radial-gradient(ellipse 80% 60% at 50% 50%, #181820 0%, #0d0d0d 100%);
  position: relative;
  overflow: hidden;
}

/* ── Glow orb ─────────────────────────────────────── */
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

/* ── Card ─────────────────────────────────────────── */
.card {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.75rem;
  width: 100%;
  max-width: 22rem;
  padding: 3.25rem 2.75rem;
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 2px 0 rgba(255, 255, 255, 0.04) inset,
    0 24px 64px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(0, 0, 0, 0.4);
}

/* ── Logo ─────────────────────────────────────────── */
.accent { color: #1DB954; }

.eq-icon {
  width: 2.25rem;
  height: 2.25rem;
  color: #1DB954;
}

/* ── Tagline ──────────────────────────────────────── */
.tagline {
  font-size: 0.875rem;
  color: #6b7280;
  letter-spacing: 0.025em;
  margin-top: 0.25rem;
}

/* ── Slide-up ─────────────────────────────────────── */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.slide-up {
  opacity: 0;
  animation: slide-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* ── Equalizer animation ──────────────────────────── */
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

/* ── Buttons ──────────────────────────────────────── */
.btn-primary,
.btn-secondary {
  display: block;
  width: 100%;
  text-align: center;
  padding: 0.9rem 2rem;
  border-radius: 0.875rem;
  font-size: 0.975rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition:
    transform 0.18s ease,
    box-shadow 0.22s ease,
    background-color 0.22s ease,
    border-color 0.22s ease;
}
.btn-primary:hover  { transform: translateY(-1px); }
.btn-secondary:hover { transform: translateY(-1px); }
.btn-primary:active,
.btn-secondary:active { transform: scale(0.97); }

.btn-primary {
  background-color: #1DB954;
  color: #fff;
  box-shadow: 0 4px 20px rgba(29, 185, 84, 0.3);
}
.btn-primary:hover {
  background-color: #1ed760;
  box-shadow: 0 6px 32px rgba(29, 185, 84, 0.55);
}

.btn-secondary {
  background-color: transparent;
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.35);
}

/* ── GitHub ───────────────────────────────────────── */
.github-link {
  color: #444;
  transition: color 0.2s ease;
}
.github-link:hover { color: #fff; }
</style>
