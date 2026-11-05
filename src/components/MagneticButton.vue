<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { motion, useSpring } from 'motion-v'
import { hasFinePointer, prefersReducedMotion } from '@/composables/useReducedMotion'
import IconArrow from './IconArrow.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    href?: string
    variant?: 'primary' | 'ghost'
    download?: boolean
    external?: boolean
    /** 0–1: how far the button leans toward the cursor */
    strength?: number
    icon?: 'up-right' | 'right' | 'down'
  }>(),
  { variant: 'primary', download: false, external: false, strength: 0.28, icon: 'up-right' },
)

// bounce ≈ 0.2 → settles quickly with a hint of life
const spring = { stiffness: 260, damping: 20, mass: 0.6 }
const x = useSpring(0, spring)
const y = useSpring(0, spring)
const enabled = ref(false)

onMounted(() => {
  enabled.value = hasFinePointer() && !prefersReducedMotion()
})

function onMove(e: PointerEvent) {
  if (!enabled.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  x.set((e.clientX - (rect.left + rect.width / 2)) * props.strength)
  y.set((e.clientY - (rect.top + rect.height / 2)) * props.strength)
}

function reset() {
  x.set(0)
  y.set(0)
}
</script>

<template>
  <motion.span class="magnet" :style="{ x, y }">
    <component
      :is="href ? 'a' : 'button'"
      v-bind="$attrs"
      :href="href"
      :type="href ? undefined : 'button'"
      :download="download || undefined"
      :target="external ? '_blank' : undefined"
      :rel="external ? 'noopener noreferrer' : undefined"
      class="btn press"
      :class="`btn--${variant}`"
      @pointermove="onMove"
      @pointerleave="reset"
    >
      <span class="btn-label"><slot /></span>
      <span class="btn-icon"><IconArrow :direction="icon" /></span>
    </component>
  </motion.span>
</template>

<style scoped>
.magnet {
  display: inline-flex;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  height: 56px;
  padding: 0 8px 0 24px;
  border-radius: 999px;
  font-weight: 500;
  font-size: 16px;
  white-space: nowrap;
  transition: transform 160ms var(--ease-out);
}
.btn--primary {
  background: var(--accent);
  color: var(--on-accent);
}
.btn--ghost {
  background: var(--ground-3);
  color: var(--ink);
}
/* concentric: 56px pill − 8px padding → 40px inner circle */
.btn-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  overflow: hidden;
}
.btn--primary .btn-icon {
  background: var(--on-accent);
  color: var(--accent);
}
.btn--ghost .btn-icon {
  background: var(--ground-4);
  color: var(--ink);
}
.btn-icon :deep(svg) {
  transition: transform 250ms var(--ease-out);
}
@media (hover: hover) and (pointer: fine) {
  .btn--ghost:hover {
    background: var(--ground-4);
  }
  .btn:hover .btn-icon :deep(svg[data-dir='up-right']) {
    transform: rotate(0deg);
  }
  .btn:hover .btn-icon :deep(svg[data-dir='down']) {
    transform: rotate(90deg) translateX(2px);
  }
  .btn:hover .btn-icon :deep(svg[data-dir='right']) {
    transform: translateX(2px);
  }
}
</style>
