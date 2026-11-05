<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { useNow, useResizeObserver } from '@vueuse/core'
import { fullName, profile } from '@/data/profile'
import { useLenis } from '@/composables/useLenis'
import { vReveal } from '@/directives/reveal'
import MagneticButton from '@/components/MagneticButton.vue'
import IconArrow from '@/components/IconArrow.vue'

const { scrollTo } = useLenis()

// ---------- copy email with a morphing confirmation ----------
const copied = ref(false)
let resetTimer = 0
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email)
  } catch {
    window.location.href = `mailto:${profile.email}`
    return
  }
  copied.value = true
  clearTimeout(resetTimer)
  resetTimer = window.setTimeout(() => (copied.value = false), 1800)
}

// ---------- live Baghdad clock ----------
const now = useNow({ interval: 1000 })
const timeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: profile.location.timeZone,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})
const localTime = computed(() => timeFmt.format(now.value))

const links = computed(() =>
  [
    { label: 'GitHub', href: profile.links.github },
    { label: 'LinkedIn', href: profile.links.linkedin },
    { label: 'Advanced Achievement', href: profile.links.companyLinkedin },
    { label: 'Email', href: `mailto:${profile.email}` },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href)),
)

// ---------- name fitted to the full width ----------
const nameWrap = ref<HTMLElement | null>(null)
const nameEl = ref<HTMLElement | null>(null)
const nameSize = ref<string | undefined>(undefined)

function fitName() {
  const wrap = nameWrap.value
  const el = nameEl.value
  if (!wrap || !el) return
  el.style.fontSize = '100px'
  const natural = el.scrollWidth
  el.style.fontSize = ''
  const style = getComputedStyle(wrap)
  const available = wrap.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
  if (natural > 0) nameSize.value = `${Math.floor((available / natural) * 100 * 0.995)}px`
}

useResizeObserver(nameWrap, fitName)
onMounted(() => {
  void document.fonts?.ready.then(fitName)
})
onBeforeUnmount(() => clearTimeout(resetTimer))

const year = new Date().getFullYear()
const ease = [0.23, 1, 0.32, 1] as const
</script>

<template>
  <footer id="contact" class="contact" aria-labelledby="contact-title">
    <div class="shell">
      <p v-reveal class="eyebrow">05 — Contact</p>
      <h2 id="contact-title" v-reveal="60" class="contact-title">
        Got an interface that should feel <em>effortless?</em> Let’s build it.
      </h2>

      <div v-reveal="120" class="contact-actions">
        <button type="button" class="copy press" :aria-label="`Copy email address ${profile.email}`" @click="copyEmail">
          <span class="copy-email">{{ profile.email }}</span>
          <span class="copy-chip" :class="{ 'is-done': copied }">
            <AnimatePresence mode="wait" :initial="false">
              <motion.span
                :key="copied ? 'done' : 'idle'"
                class="copy-chip-label"
                :initial="{ opacity: 0, y: 10, filter: 'blur(4px)' }"
                :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.25, ease } }"
                :exit="{ opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.12, ease } }"
              >
                <template v-if="copied">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="m3.5 8.5 3 3 6-7" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  Copied
                </template>
                <template v-else>Copy</template>
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
        <span class="sr-only" role="status">{{ copied ? 'Email address copied' : '' }}</span>
        <MagneticButton :href="profile.links.cv" variant="ghost" icon="down" download>Download CV</MagneticButton>
      </div>

      <dl class="contact-meta">
        <div v-reveal="0">
          <dt>Local time</dt>
          <dd class="tnum">{{ localTime }} <span class="muted">GMT+3</span></dd>
        </div>
        <div v-reveal="70">
          <dt>Based in</dt>
          <dd>{{ profile.location.city }}, {{ profile.location.country }}</dd>
        </div>
        <div v-reveal="140">
          <dt>Currently</dt>
          <dd>{{ profile.role }}, {{ profile.company }}</dd>
        </div>
        <div v-reveal="210">
          <dt>Elsewhere</dt>
          <dd>
            <ul class="links">
              <li v-for="l in links" :key="l.label">
                <a :href="l.href" :target="l.href.startsWith('http') ? '_blank' : undefined" rel="noopener noreferrer">
                  {{ l.label }} <IconArrow />
                </a>
              </li>
            </ul>
          </dd>
        </div>
      </dl>
    </div>

    <div ref="nameWrap" class="shell name-wrap" aria-hidden="true">
      <span ref="nameEl" v-reveal class="name" :style="{ fontSize: nameSize }">{{ fullName }}</span>
    </div>

    <div class="shell legal">
      <p>© {{ year }} {{ fullName }}. Built with Vue 3, TypeScript &amp; Tailwind CSS.</p>
      <button type="button" class="top-btn press" @click="scrollTo(0)">
        Back to top <IconArrow direction="up" />
      </button>
    </div>
  </footer>
</template>

<style scoped>
.contact {
  padding-top: clamp(96px, 13vw, 192px);
  background: var(--ground-2);
  overflow: clip;
}
.contact-title {
  margin-top: 20px;
  max-width: 16ch;
  font-size: clamp(3rem, 8.5vw, 8.5rem);
  line-height: 0.92;
  letter-spacing: -0.05em;
}
.contact-title em {
  font-style: normal;
  color: var(--accent-ink);
}

.contact-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: clamp(40px, 5vw, 64px);
}
/* concentric: 64px pill − 8px padding → 48px chip */
.copy {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  max-width: 100%;
  height: 64px;
  padding: 0 8px 0 24px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: clamp(15px, 1.6vw, 19px);
  font-weight: 500;
  transition: transform 160ms var(--ease-out);
}
.copy-email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.copy-chip {
  display: grid;
  place-items: center;
  flex: none;
  min-width: 104px;
  height: 48px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--on-accent);
  color: var(--accent);
  font-size: 15px;
}
.copy-chip-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.contact-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px 24px;
  margin-top: clamp(64px, 8vw, 120px);
}
.contact-meta dt {
  font-size: 13px;
  color: var(--ink-3);
  margin-bottom: 8px;
}
.contact-meta dd {
  font-size: 17px;
}
.muted {
  color: var(--ink-3);
  font-size: 14px;
}
.links {
  display: grid;
  gap: 2px;
}
.links a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
}

.name-wrap {
  margin-top: clamp(80px, 10vw, 160px);
  overflow: clip;
}
.name {
  display: block;
  width: max-content;
  font-family: var(--font-display);
  font-weight: 650;
  font-size: 17vw;
  line-height: 0.8;
  letter-spacing: -0.055em;
  white-space: nowrap;
  padding-bottom: 0.04em;
}

.legal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-block: 28px 36px;
  font-size: 14px;
  color: var(--ink-3);
}
.top-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--ground-3);
  color: var(--ink);
  font-weight: 500;
}

@media (min-width: 900px) {
  .contact-meta {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (hover: hover) and (pointer: fine) {
  .links a:hover {
    color: var(--accent-ink);
  }
  .top-btn:hover {
    background: var(--ground-4);
  }
}
</style>
