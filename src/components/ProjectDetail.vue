<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Project } from '@/data/profile'
import { lockScroll } from '@/composables/useLenis'
import { prefersReducedMotion } from '@/composables/useReducedMotion'
import IconArrow from './IconArrow.vue'

/**
 * Full-screen project view. It grows out of the element that opened it:
 * the panel's clip-path starts as that element's on-screen rectangle and
 * expands to the viewport (shared-element feel), then the content rises in.
 * Closing reverses into the same rectangle, faster.
 */
const props = defineProps<{
  project: Project
  index: number
  total: number
  nextTitle: string
  origin: DOMRect | null
}>()
const emit = defineEmits<{ close: []; next: [] }>()

const panel = ref<HTMLElement | null>(null)
const scroller = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
const entered = ref(false)
let closing = false

const EASE = 'cubic-bezier(0.77, 0, 0.175, 1)'

function rectInset(rect: DOMRect | null): string {
  if (!rect) return 'inset(42% 30% 42% 30% round 28px)'
  const px = (n: number) => `${Math.max(0, Math.round(n))}px`
  return `inset(${px(rect.top)} ${px(window.innerWidth - rect.right)} ${px(window.innerHeight - rect.bottom)} ${px(rect.left)} round 24px)`
}

async function close() {
  if (closing) return
  closing = true
  const el = panel.value
  if (el && !prefersReducedMotion()) {
    entered.value = false
    const frames: Keyframe[] = props.origin
      ? [{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: rectInset(props.origin) }]
      : [
          { opacity: 1, transform: 'none' },
          { opacity: 0, transform: 'translateY(24px)' },
        ]
    try {
      await el.animate(frames, { duration: props.origin ? 480 : 220, easing: EASE, fill: 'forwards' }).finished
    } catch {
      /* animation cancelled — close anyway */
    }
  }
  emit('close')
}

function focusables(): HTMLElement[] {
  return Array.from(
    panel.value?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [],
  )
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    void close()
    return
  }
  if (e.key !== 'Tab') return
  const items = focusables()
  const first = items[0]
  const last = items[items.length - 1]
  if (!first || !last) return
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

function enter() {
  requestAnimationFrame(() => {
    entered.value = true
  })
}

// "Next project" swaps content in place: reset scroll, replay the stagger.
watch(
  () => props.project.slug,
  async () => {
    entered.value = false
    await nextTick()
    scroller.value?.scrollTo({ top: 0 })
    enter()
  },
)

onMounted(() => {
  lockScroll(true)
  closeBtn.value?.focus({ preventScroll: true })
  if (panel.value && !prefersReducedMotion()) {
    panel.value.animate([{ clipPath: rectInset(props.origin) }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], {
      duration: 760,
      easing: EASE,
    })
  }
  enter()
})

onBeforeUnmount(() => lockScroll(false))
</script>

<template>
  <Teleport to="body">
    <div
      ref="panel"
      class="detail"
      :class="{ 'is-in': entered }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      @keydown="onKeydown"
    >
      <div ref="scroller" class="detail-scroll" data-lenis-prevent>
        <div class="shell">
          <div class="detail-bar">
            <button ref="closeBtn" type="button" class="back press" @click="close">
              <IconArrow direction="left" /> Back to work
            </button>
            <span class="tnum detail-count">{{ String(index + 1).padStart(2, '0') }} / {{ String(total).padStart(2, '0') }}</span>
          </div>

          <header class="detail-head">
            <p class="eyebrow d-item" style="--i: 0">{{ project.kind }} — {{ project.year }}</p>
            <h2 id="detail-title" class="detail-title d-item" style="--i: 1">{{ project.title }}</h2>
          </header>

          <dl class="detail-meta d-item" style="--i: 2">
            <div>
              <dt>Role</dt>
              <dd>{{ project.role }}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd class="tnum">{{ project.year }}</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>{{ project.stack.join(', ') }}</dd>
            </div>
            <div>
              <dt>{{ project.link ? 'Live' : 'Access' }}</dt>
              <dd>
                <a v-if="project.link" :href="project.link" target="_blank" rel="noopener noreferrer" class="detail-link">
                  Visit site <IconArrow />
                </a>
                <span v-else>{{ project.note ?? 'Link coming soon' }}</span>
              </dd>
            </div>
          </dl>

          <div v-if="project.image" class="detail-cover d-item" style="--i: 3">
            <img :src="project.image" :alt="project.imageAlt ?? `${project.title} — ${project.kind}`" decoding="async" />
          </div>

          <div class="detail-grid">
            <div class="detail-body">
              <p v-for="(para, i) in project.description" :key="i" class="d-item" :style="{ '--i': 3 + i }">{{ para }}</p>
            </div>

            <aside class="detail-side d-item" :style="{ '--i': 3 + project.description.length }">
              <span class="outcome">{{ project.outcome }}</span>
              <h3 class="eyebrow">What I did</h3>
              <ul class="highlights">
                <li v-for="h in project.highlights" :key="h">{{ h }}</li>
              </ul>
              <ul class="tags" aria-label="Stack">
                <li v-for="s in project.stack" :key="s">{{ s }}</li>
              </ul>
            </aside>
          </div>

          <button type="button" class="detail-next press" @click="emit('next')">
            <span class="eyebrow">Next project</span>
            <span class="detail-next-title">{{ nextTitle }} <IconArrow direction="right" /></span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.detail {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--ground);
  color: var(--ink);
}
.detail-scroll {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.detail-bar {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nav-h);
  background: var(--ground);
}
.back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--ground-3);
  font-weight: 500;
  font-size: 15px;
}
.detail-count {
  font-size: 14px;
  color: var(--ink-3);
}
.detail-head {
  padding-top: clamp(32px, 8vh, 96px);
}
.detail-title {
  margin-top: 16px;
  font-size: clamp(3.5rem, 12vw, 11rem);
  line-height: 0.88;
  letter-spacing: -0.05em;
}
.detail-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 32px;
  margin-top: clamp(40px, 6vw, 72px);
}
.detail-meta dt {
  font-size: 13px;
  color: var(--ink-3);
  margin-bottom: 6px;
}
.detail-meta dd {
  font-size: 16px;
}
.detail-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent-ink);
}
/* outer radius matches the 24px the panel grew out of */
.detail-cover {
  margin-top: clamp(40px, 6vw, 72px);
  aspect-ratio: 16 / 9;
  border-radius: 24px;
  overflow: hidden;
}
.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail-grid {
  display: grid;
  gap: 40px;
  margin-top: clamp(40px, 6vw, 80px);
}
.detail-body {
  max-width: 62ch;
  display: grid;
  gap: 20px;
  align-content: start;
  font-size: clamp(17px, 1.4vw, 20px);
  color: var(--ink-2);
}
.detail-side {
  display: grid;
  gap: 16px;
  align-content: start;
  justify-items: start;
  padding: clamp(20px, 3vw, 32px);
  border-radius: 24px;
  background: var(--ground-2);
}
.outcome {
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 13px;
  font-weight: 500;
}
.highlights {
  display: grid;
  gap: 10px;
  font-size: 15px;
  color: var(--ink-2);
}
.highlights li {
  position: relative;
  padding-left: 22px;
}
.highlights li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.62em;
  width: 10px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent-ink);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tags li {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--ground-3);
  font-size: 13px;
  color: var(--ink-2);
}
.detail-next {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  margin-block: clamp(80px, 12vw, 160px) 64px;
  padding: 32px;
  border-radius: 24px;
  background: var(--ground-2);
  text-align: left;
  transition: transform 160ms var(--ease-out);
}
.detail-next-title {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2rem, 6vw, 4.5rem);
  letter-spacing: -0.04em;
  line-height: 1;
}
@media (min-width: 900px) {
  .detail-meta {
    grid-template-columns: 2fr 1fr 2fr 1.4fr;
  }
  .detail-grid {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: clamp(32px, 5vw, 80px);
  }
}
@media (hover: hover) and (pointer: fine) {
  .back:hover {
    background: var(--ground-4);
  }
  .detail-next:hover {
    background: var(--ground-3);
  }
}

/* Content rises in once the panel has started opening */
.d-item {
  opacity: 0;
  transform: translate3d(0, 24px, 0);
  transition:
    opacity 600ms var(--ease-out),
    transform 800ms var(--ease-out);
  transition-delay: 0ms;
}
.is-in .d-item {
  opacity: 1;
  transform: none;
  transition-delay: calc(220ms + var(--i, 0) * 70ms);
}
@media (prefers-reduced-motion: reduce) {
  .d-item {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
