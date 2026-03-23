<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="page">
    <div class="glow" aria-hidden="true"></div>

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

      <!-- Header -->
      <div class="flex flex-col items-center gap-2 text-center">
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
        <p class="tagline">Queue music together with friends</p>
      </div>

      <div class="divider"></div>

      <!-- Two-column body -->
      <div class="body-grid">

        <!-- LEFT: disclaimer + engineering notes -->
        <div class="left-col">
          <!-- Disclaimer -->
          <section class="disclaimer-card">
            <div class="disclaimer-header">
              <svg class="disclaimer-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
              </svg>
              <h2 class="disclaimer-title">Demo Disclaimer</h2>
            </div>
            <div class="disclaimer-prose">
              <p>
                This is a proof of concept. It uses a single shared Spotify developer account for playback and is not intended for production use.
              </p>
              <p>
                To ensure a consistent demo experience, access is password-protected and limited to one active session at a time. If multiple users attempt to use playback simultaneously, Spotify restrictions may prevent it from functioning as expected.
              </p>
              <p>
                The demo password is included on the <a href="https://github.com/MarcusMJV/houseparty_backend" target="_blank" rel="noopener noreferrer" class="disclaimer-link">backend repo</a>. If you don't have access or if the demo password is no longer valid, feel free to contact me. I'm happy to provide it or spin up a dedicated instance for you to explore.
              </p>
              <p>
                In a production environment, this would be resolved through per-user authentication and proper token management.
              </p>

            </div>
          </section>

        </div>

        <!-- RIGHT: video + button -->
        <div class="right-col">
          <div class="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/_yslNwsrj3Y"
              title="HouseParty Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <button class="btn-primary" @click="router.push('/')">
            Try the Live Demo →
          </button>
        </div>

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
  padding: 3rem 1rem;
  background: radial-gradient(ellipse 80% 60% at 50% 50%, #181820 0%, #0d0d0d 100%);
  position: relative;
  overflow: hidden;
}

.glow {
  position: absolute;
  width: 700px;
  height: 700px;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(29, 185, 84, 0.07) 0%,
    rgba(29, 185, 84, 0.03) 45%,
    transparent 70%
  );
  filter: blur(60px);
  pointer-events: none;
}

.card {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  width: 100%;
  max-width: 72rem;
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

.divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
}

/* Two-column grid */
.body-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  width: 100%;
  align-items: start;
}

@media (max-width: 768px) {
  .body-grid {
    grid-template-columns: 1fr;
  }
}

/* Left column */
.left-col {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Right column */
.right-col {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Video */
.video-wrapper {
  width: 100%;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  aspect-ratio: 16 / 9;
}
.video-wrapper iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* Content */
.content-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #1DB954;
}

.prose {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.prose p {
  font-size: 0.925rem;
  line-height: 1.75;
  color: #9ca3af;
}

/* Engineering card */
.engineering-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  background: rgba(29, 185, 84, 0.04);
  border: 1px solid rgba(29, 185, 84, 0.15);
}
.engineering-card p {
  font-size: 0.925rem;
  line-height: 1.75;
  color: #9ca3af;
}

/* Button */
.btn-primary {
  width: 100%;
  text-align: center;
  padding: 0.9rem 2rem;
  border-radius: 0.875rem;
  font-size: 0.975rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  background-color: #111613;
  color: #1DB954;
  border: 2px solid rgba(29, 185, 84, 0.35);
  box-shadow: 0 4px 20px rgba(29, 185, 84, 0.12);
  transition: transform 0.18s ease, box-shadow 0.22s ease, background-color 0.22s ease, border-color 0.22s ease;
}
.btn-primary:hover {
  transform: translateY(-1px);
  background-color: #161d17;
  border-color: rgba(29, 185, 84, 0.85);
  box-shadow: 0 6px 28px rgba(29, 185, 84, 0.28);
}
.btn-primary:active { transform: scale(0.97); }

/* Equalizer */
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

/* GitHub */
.github-link {
  color: #444;
  transition: color 0.2s ease;
}
.github-link:hover { color: #fff; }

/* Disclaimer */
.disclaimer-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  background: rgba(29, 185, 84, 0.05);
  border: 1px solid rgba(29, 185, 84, 0.25);
}

.disclaimer-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.disclaimer-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: #1DB954;
  flex-shrink: 0;
}

.disclaimer-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #1DB954;
}

.disclaimer-prose {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.disclaimer-prose p {
  font-size: 0.9rem;
  line-height: 1.75;
  color: #9ca3af;
}

.disclaimer-link {
  color: #1DB954;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.15s ease;
}
.disclaimer-link:hover { opacity: 0.75; }

/* Slide-up */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.slide-up {
  opacity: 0;
  animation: slide-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
</style>
