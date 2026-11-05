<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { fullName } from '@/data/profile'

/**
 * 0 → 100 in 850ms, then the panel wipes upward (clip-path, 620ms).
 * Total under 1.5s. `reveal` fires as the wipe starts so the hero's
 * entrance overlaps it; `finished` fires when it's gone.
 */
const emit = defineEmits<{ reveal: []; finished: [] }>()

const COUNT_MS = 850
const count = ref(0)
const leaving = ref(false)
let frame = 0
let failsafe = 0
let done = false

const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)

function leave() {
  if (leaving.value) return
  leaving.value = true
  emit('reveal')
}

function finish() {
  if (done) return
  done = true
  emit('finished')
}

function onTransitionEnd(e: TransitionEvent) {
  if (e.propertyName === 'clip-path' && leaving.value) finish()
}

onMounted(() => {
  const start = performance.now()
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / COUNT_MS)
    count.value = Math.round(easeInOutCubic(p) * 100)
    if (p < 1) frame = requestAnimationFrame(step)
    else leave()
  }
  frame = requestAnimationFrame(step)
  // Never trap the visitor behind the loader, whatever happens.
  failsafe = window.setTimeout(() => {
    leave()
    finish()
  }, 2400)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  clearTimeout(failsafe)
})
</script>

<template>
  <div class="preloader" :class="{ 'is-leaving': leaving }" aria-hidden="true" @transitionend.self="onTransitionEnd">
    <div class="shell preloader-inner">
      <p class="preloader-top eyebrow">
        <span>{{ fullName }}</span>
        <span>Front-end · Baghdad</span>
      </p>
      <div>
        <p class="preloader-count tnum">{{ count }}<span class="preloader-pct">%</span></p>
        <div class="preloader-bar"><span :style="{ transform: `scaleX(${count / 100})` }" /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 150;
  background: var(--ground-2);
  color: var(--ink);
  clip-path: inset(0 0 0 0);
  transition: clip-path 620ms var(--ease-in-out);
}
.preloader.is-leaving {
  clip-path: inset(0 0 100% 0);
}
.preloader-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-block: 24px 32px;
  transition: transform 620ms var(--ease-in-out);
}
.is-leaving .preloader-inner {
  transform: translate3d(0, -6vh, 0);
}
.preloader-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.preloader-count {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(6rem, 24vw, 22rem);
  line-height: 0.8;
  letter-spacing: -0.05em;
  margin-bottom: 24px;
}
.preloader-pct {
  font-size: 0.3em;
  color: var(--accent-ink);
  margin-left: 0.06em;
  vertical-align: top;
}
.preloader-bar {
  height: 2px;
  background: var(--ground-4);
  overflow: hidden;
}
.preloader-bar span {
  display: block;
  height: 100%;
  background: var(--accent);
  transform-origin: 0 50%;
}
</style>
