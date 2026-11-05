<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { fullName, profile, sections } from '@/data/profile'
import { lockScroll, useLenis } from '@/composables/useLenis'
import ThemeToggle from './ThemeToggle.vue'

defineProps<{ active: string }>()
const emit = defineEmits<{ openPalette: [] }>()

const { scrollTo } = useLenis()
const links = sections.filter((s) => s.nav)
const menuLinks = sections.filter((s) => s.id !== 'top' && s.id !== 'numbers')

const hidden = ref(false)
const scrolled = ref(false)
const menuOpen = ref(false)
const isMac = ref(true)
const menuButton = ref<HTMLButtonElement | null>(null)
const menuClose = ref<HTMLButtonElement | null>(null)

let lastY = 0
let frame = 0

function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    const y = window.scrollY
    scrolled.value = y > 24
    if (y < 160) {
      hidden.value = false
    } else if (Math.abs(y - lastY) > 8) {
      hidden.value = y > lastY && !menuOpen.value
    }
    lastY = y
  })
}

function go(id: string) {
  if (menuOpen.value) {
    menuOpen.value = false
    lockScroll(false)
  }
  scrollTo(id === 'top' ? 0 : `#${id}`)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && menuOpen.value) menuOpen.value = false
}

watch(menuOpen, async (open) => {
  lockScroll(open)
  await nextTick()
  if (open) menuClose.value?.focus()
  else menuButton.value?.focus({ preventScroll: true })
})

onMounted(() => {
  isMac.value = /Mac|iPhone|iPad/.test(navigator.userAgent)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  cancelAnimationFrame(frame)
})

const ease = [0.23, 1, 0.32, 1] as const
const easeInOut = [0.77, 0, 0.175, 1] as const
</script>

<template>
  <header class="nav" :class="{ 'is-hidden': hidden, 'is-scrolled': scrolled }">
    <div class="shell nav-inner">
      <a href="#top" class="wordmark press" @click.prevent="go('top')">
        <span class="wordmark-mark" aria-hidden="true">AJ</span>
        <span class="wordmark-name">{{ fullName }}</span>
      </a>

      <nav aria-label="Primary" class="nav-links">
        <a
          v-for="link in links"
          :key="link.id"
          :href="`#${link.id}`"
          class="nav-link"
          :class="{ 'is-active': active === link.id }"
          :aria-current="active === link.id ? 'location' : undefined"
          @click.prevent="go(link.id)"
        >
          <!-- layout-id needs a presence context: motion-v calls onMotionExitComplete unguarded when the pill unmounts -->
          <AnimatePresence>
            <motion.span
              v-if="active === link.id"
              key="nav-pill"
              layout-id="nav-active-pill"
              class="nav-pill"
              :transition="{ type: 'spring', bounce: 0.2, duration: 0.45 }"
            />
          </AnimatePresence>
          <span class="nav-link-label">{{ link.label }}</span>
        </a>
      </nav>

      <div class="nav-actions">
        <button type="button" class="palette-btn press" aria-label="Open command palette" @click="emit('openPalette')">
          <span>Jump to</span>
          <kbd>{{ isMac ? '⌘' : 'Ctrl' }} K</kbd>
        </button>
        <ThemeToggle />
        <a href="#contact" class="contact-btn press" @click.prevent="go('contact')">Contact</a>
        <button
          ref="menuButton"
          type="button"
          class="menu-btn press"
          aria-controls="mobile-menu"
          :aria-expanded="menuOpen"
          @click="menuOpen = true"
        >
          Menu
        </button>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="menuOpen"
        id="mobile-menu"
        key="mobile-menu"
        class="menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        :initial="{ clipPath: 'inset(0% 0% 100% 0%)' }"
        :animate="{ clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.6, ease: easeInOut } }"
        :exit="{ opacity: 0, transition: { duration: 0.18, ease } }"
      >
        <div class="shell menu-top">
          <span class="wordmark-name">{{ fullName }}</span>
          <button ref="menuClose" type="button" class="menu-btn is-close press" @click="menuOpen = false">Close</button>
        </div>
        <nav aria-label="Mobile" class="shell menu-nav">
          <ol>
            <li v-for="(link, i) in menuLinks" :key="link.id">
              <motion.a
                :href="`#${link.id}`"
                class="menu-link"
                :initial="{ y: 32, opacity: 0 }"
                :animate="{ y: 0, opacity: 1, transition: { delay: 0.2 + i * 0.06, duration: 0.7, ease } }"
                @click.prevent="go(link.id)"
              >
                <span class="menu-index tnum">0{{ i + 1 }}</span>{{ link.label }}
              </motion.a>
            </li>
          </ol>
        </nav>
        <div class="shell menu-foot">
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          <a :href="profile.links.github" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>
.nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  height: var(--nav-h);
  transition: transform 320ms var(--ease-out);
}
.nav::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ground);
  opacity: 0;
  transition: opacity 250ms var(--ease-out);
}
.nav.is-scrolled::before {
  opacity: 0.94;
}
.nav.is-hidden {
  transform: translate3d(0, -100%, 0);
}
.nav-inner {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.wordmark {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  font-weight: 500;
}
.wordmark-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--accent);
  color: var(--on-accent);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: -0.02em;
}
.wordmark-name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.nav-links {
  display: none;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px;
  border-radius: 999px;
  background: var(--ground-2);
}
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 15px;
  color: var(--ink-2);
}
.nav-link.is-active {
  color: var(--ink);
}
.nav-pill {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--ground-4);
}
.nav-link-label {
  position: relative;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.palette-btn {
  display: none;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 6px 0 14px;
  border-radius: 999px;
  background: var(--ground-3);
  color: var(--ink-2);
  font-size: 14px;
}
.palette-btn kbd {
  font-family: var(--font-sans);
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--ground-4);
  color: var(--ink);
}
.contact-btn {
  display: none;
  align-items: center;
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--on-accent);
  font-weight: 500;
  font-size: 15px;
}
.menu-btn {
  height: 40px;
  min-width: 64px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--ground-3);
  color: var(--ink);
  font-weight: 500;
  font-size: 15px;
}

@media (min-width: 900px) {
  .nav-links {
    display: flex;
  }
  .contact-btn {
    display: inline-flex;
  }
  .menu-btn:not(.is-close) {
    display: none;
  }
}
@media (min-width: 1100px) {
  .palette-btn {
    display: inline-flex;
  }
}
@media (max-width: 420px) {
  .wordmark-name {
    display: none;
  }
}
@media (hover: hover) and (pointer: fine) {
  .nav-link:hover {
    color: var(--ink);
  }
  .palette-btn:hover,
  .menu-btn:hover {
    background: var(--ground-4);
  }
}

/* ---- mobile menu ---- */
.menu {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  flex-direction: column;
  background: var(--ground-2);
  color: var(--ink);
}
.menu-top {
  height: var(--nav-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.menu-nav {
  flex: 1;
  display: flex;
  align-items: center;
}
.menu-nav ol {
  width: 100%;
}
.menu-link {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding-block: 4px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2.75rem, 13vw, 6rem);
  line-height: 1;
  letter-spacing: -0.04em;
}
.menu-index {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--accent-ink);
}
.menu-foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding-block: 24px 32px;
  color: var(--ink-2);
  font-size: 15px;
}
.menu-foot a {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
}
</style>
