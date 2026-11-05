<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { vReveal } from '@/directives/reveal'

const TerminalWindow = defineAsyncComponent(() => import('@/components/TerminalWindow.vue'))
const emit = defineEmits<{ openProject: [slug: string] }>()
const isMac = ref(true)
onMounted(() => {
  isMac.value = /Mac|iPhone|iPad/.test(navigator.userAgent)
})
</script>

<template>
  <section id="shell" class="section-y" aria-labelledby="shell-title">
    <div class="shell shell-grid">
      <div class="shell-copy">
        <p v-reveal class="eyebrow">01 — Shell</p>
        <h2 id="shell-title" v-reveal="60" class="shell-title">Ask the shell.</h2>
        <p v-reveal="120" class="shell-lede">
          Prefer a keyboard? This terminal knows my CV. Watch it introduce me, then type <code>help</code> — or tap a
          command under the window.
        </p>
        <ul v-reveal="180" class="shell-keys" aria-label="Keyboard shortcuts">
          <li><kbd>↑</kbd><kbd>↓</kbd> history</li>
          <li><kbd>Tab</kbd> completes</li>
          <li><kbd>{{ isMac ? '⌘' : 'Ctrl' }} K</kbd> jump anywhere</li>
        </ul>
      </div>
      <div v-reveal="{ delay: 80 }" class="shell-term">
        <TerminalWindow @open-project="emit('openProject', $event)" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.shell-grid {
  display: grid;
  gap: 48px;
}
.shell-title {
  margin-top: 20px;
  font-size: clamp(3rem, 7vw, 6.5rem);
}
.shell-lede {
  margin-top: 24px;
  max-width: 34ch;
  color: var(--ink-2);
}
.shell-lede code {
  font-family: var(--font-mono);
  font-size: 0.92em;
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--ground-3);
  color: var(--ink);
}
.shell-keys {
  display: none;
  margin-top: 32px;
  gap: 10px;
  font-size: 14px;
  color: var(--ink-3);
}
.shell-keys li {
  display: flex;
  align-items: center;
  gap: 6px;
}
kbd {
  font-family: var(--font-sans);
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--ground-3);
  color: var(--ink-2);
}
@media (min-width: 1000px) {
  .shell-grid {
    grid-template-columns: 4fr 8fr;
    gap: clamp(40px, 5vw, 96px);
    align-items: start;
  }
  .shell-copy {
    position: sticky;
    top: calc(var(--nav-h) + 40px);
  }
  .shell-keys {
    display: grid;
  }
}
</style>
