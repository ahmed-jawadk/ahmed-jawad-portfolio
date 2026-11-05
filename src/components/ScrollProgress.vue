<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const bar = ref<HTMLElement | null>(null)
let frame = 0

function update() {
  frame = 0
  const max = document.documentElement.scrollHeight - window.innerHeight
  const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
  if (bar.value) bar.value.style.transform = `scaleX(${progress})`
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(update)
}

onMounted(() => {
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  update()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div class="progress" aria-hidden="true"><span ref="bar" /></div>
</template>

<style scoped>
.progress {
  position: fixed;
  inset: 0 0 auto 0;
  height: 2px;
  z-index: 60;
  pointer-events: none;
}
.progress span {
  display: block;
  height: 100%;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: 0 50%;
}
</style>
