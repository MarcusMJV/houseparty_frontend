<script setup lang="ts">
defineProps<{ message: string; visible: boolean }>()
</script>

<template>
  <transition name="toast">
    <div v-if="visible" class="toast" role="alert">
      {{ message }}
    </div>
  </transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  background: #111613;
  border: 1px solid rgba(29, 185, 84, 0.4);
  color: #86efac;
  font-size: 0.875rem;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
.toast-enter-active,
.toast-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>
