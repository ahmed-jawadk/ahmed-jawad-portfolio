<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme, toggle } = useTheme()
const label = computed(() => (theme.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'))

function onClick(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
}
</script>

<template>
  <button type="button" class="toggle press" :aria-label="label" :title="label" @click="onClick">
    <svg :class="{ 'is-light': theme === 'light' }" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" stroke-width="1.5" />
      <path d="M12 3.75a8.25 8.25 0 0 1 0 16.5z" fill="currentColor" />
    </svg>
  </button>
</template>

<style scoped>
.toggle {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: var(--ground-3);
  color: var(--ink);
}
svg {
  transition: transform 500ms var(--ease-in-out);
}
svg.is-light {
  transform: rotate(180deg);
}
@media (hover: hover) and (pointer: fine) {
  .toggle:hover {
    background: var(--ground-4);
  }
}
</style>
