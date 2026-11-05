<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { profile, sections } from '@/data/profile'
import { lockScroll } from '@/composables/useLenis'
import { useTheme } from '@/composables/useTheme'

/**
 * ⌘K / Ctrl+K palette. Keyboard-triggered, so it appears and disappears
 * instantly — no open/close animation by design.
 */
const emit = defineEmits<{ close: []; navigate: [id: string] }>()

interface Item {
  id: string
  label: string
  group: 'Jump to' | 'Actions'
  hint: string
  run: () => void
}

const { toggle } = useTheme()
const query = ref('')
const activeIndex = ref(0)
const input = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email)
  } catch {
    /* clipboard blocked — the hint still shows the address */
  }
}

const items: Item[] = [
  ...sections.map((s) => ({
    id: `go-${s.id}`,
    label: s.label,
    group: 'Jump to' as const,
    hint: 'Section',
    run: () => emit('navigate', s.id),
  })),
  {
    id: 'copy-email',
    label: 'Copy email address',
    group: 'Actions',
    hint: profile.email,
    run: () => {
      void copyEmail()
      emit('close')
    },
  },
  {
    id: 'theme',
    label: 'Toggle theme',
    group: 'Actions',
    hint: 'Dark / light',
    run: () => {
      emit('close')
      void toggle()
    },
  },
  {
    id: 'cv',
    label: 'Download CV',
    group: 'Actions',
    hint: 'PDF',
    run: () => {
      window.open(profile.links.cv, '_blank', 'noopener')
      emit('close')
    },
  },
  {
    id: 'github',
    label: 'Open GitHub',
    group: 'Actions',
    hint: `@${profile.githubUsername}`,
    run: () => {
      window.open(profile.links.github, '_blank', 'noopener')
      emit('close')
    },
  },
]

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => `${item.label} ${item.group} ${item.hint}`.toLowerCase().includes(q))
})

const activeId = computed(() => filtered.value[activeIndex.value]?.id)

watch(query, () => {
  activeIndex.value = 0
})

watch(activeIndex, async () => {
  await nextTick()
  list.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
})

function run(item: Item | undefined) {
  item?.run()
}

function onKeydown(e: KeyboardEvent) {
  const count = filtered.value.length
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (count) activeIndex.value = (activeIndex.value + 1) % count
      break
    case 'ArrowUp':
      e.preventDefault()
      if (count) activeIndex.value = (activeIndex.value - 1 + count) % count
      break
    case 'Home':
      e.preventDefault()
      activeIndex.value = 0
      break
    case 'End':
      e.preventDefault()
      activeIndex.value = Math.max(0, count - 1)
      break
    case 'Enter':
      e.preventDefault()
      run(filtered.value[activeIndex.value])
      break
    case 'Escape':
      e.preventDefault()
      emit('close')
      break
    case 'Tab':
      // single focus stop: keep focus in the field
      e.preventDefault()
      break
  }
}

onMounted(() => {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  lockScroll(true)
  input.value?.focus()
})

onBeforeUnmount(() => {
  lockScroll(false)
  previousFocus?.focus({ preventScroll: true })
})
</script>

<template>
  <Teleport to="body">
    <div class="palette-backdrop" @pointerdown.self="emit('close')">
      <div class="palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="palette-field">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="9" cy="9" r="5.5" />
            <path d="m13.2 13.2 3.3 3.3" stroke-linecap="round" />
          </svg>
          <input
            ref="input"
            v-model="query"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="palette-list"
            :aria-activedescendant="activeId ? `palette-${activeId}` : undefined"
            placeholder="Jump to a section or run an action…"
            autocomplete="off"
            spellcheck="false"
            @keydown="onKeydown"
          />
          <kbd>esc</kbd>
        </div>

        <ul id="palette-list" ref="list" role="listbox" aria-label="Results" class="palette-list" data-lenis-prevent>
          <template v-for="(item, i) in filtered" :key="item.id">
            <li v-if="i === 0 || filtered[i - 1]?.group !== item.group" role="presentation" class="palette-group">
              {{ item.group }}
            </li>
            <li
              :id="`palette-${item.id}`"
              role="option"
              :aria-selected="i === activeIndex"
              class="palette-item"
              @pointermove="activeIndex = i"
              @click="run(item)"
            >
              <span>{{ item.label }}</span>
              <span class="palette-hint">{{ item.hint }}</span>
            </li>
          </template>
          <li v-if="!filtered.length" role="presentation" class="palette-empty">Nothing matches “{{ query }}”.</li>
        </ul>

        <p class="palette-help" aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> select</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16vh 16px 16px;
  background: rgb(0 0 0 / 0.45);
}
/* outer radius 20 = inner radius 12 + padding 8 */
.palette {
  width: min(600px, 100%);
  padding: 8px;
  border-radius: 20px;
  background: var(--ground-2);
  box-shadow: var(--shadow-lg);
  color: var(--ink);
}
.palette-field {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 12px 0 16px;
  border-radius: 12px;
  background: var(--ground-3);
  color: var(--ink-3);
}
.palette-field input {
  flex: 1;
  min-width: 0;
  height: 100%;
  background: transparent;
  color: var(--ink);
  font-size: 17px;
  outline: none;
}
.palette-field input::placeholder {
  color: var(--ink-3);
}
kbd {
  font-family: var(--font-sans);
  font-size: 12px;
  padding: 3px 7px;
  border-radius: 6px;
  background: var(--ground-4);
  color: var(--ink-2);
}
.palette-list {
  max-height: min(52vh, 420px);
  overflow-y: auto;
  padding-top: 8px;
}
.palette-group {
  padding: 12px 12px 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.palette-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 12px;
  cursor: pointer;
}
.palette-item[aria-selected='true'] {
  background: var(--ground-4);
}
.palette-item[aria-selected='true'] > span:first-child {
  color: var(--accent-ink);
}
.palette-hint {
  color: var(--ink-3);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.palette-empty {
  padding: 20px 12px;
  color: var(--ink-3);
}
.palette-help {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 10px 12px 4px;
  font-size: 13px;
  color: var(--ink-3);
}
.palette-help kbd + kbd {
  margin-left: -2px;
}
.palette-help kbd:nth-of-type(3) {
  margin-left: 8px;
}
@media (pointer: coarse) {
  .palette-help {
    display: none;
  }
}
</style>
