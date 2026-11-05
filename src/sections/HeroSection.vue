<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { motion, useSpring } from 'motion-v'
import { gsap } from 'gsap'
import { profile } from '@/data/profile'
import { introDone } from '@/composables/useAppState'
import { useLenis } from '@/composables/useLenis'
import { hasFinePointer, prefersReducedMotion } from '@/composables/useReducedMotion'
import SplitText from '@/components/SplitText.vue'
import MagneticButton from '@/components/MagneticButton.vue'

const { scrollTo } = useLenis()

const root = ref<HTMLElement | null>(null)
const nameEl = ref<HTMLElement | null>(null)

// Cursor-reactive: a lime "signal" that trails the pointer, and the name
// leaning away from it. Both spring-smoothed (bounce ≈ 0.15–0.2).
const dotX = useSpring(0, { stiffness: 160, damping: 18, mass: 0.7 })
const dotY = useSpring(0, { stiffness: 160, damping: 18, mass: 0.7 })
const leanX = useSpring(0, { stiffness: 90, damping: 16 })
const leanY = useSpring(0, { stiffness: 90, damping: 16 })
const pointerActive = ref(false)
const interactive = ref(false)

function onPointerMove(e: PointerEvent) {
  if (!interactive.value || !root.value) return
  const rect = root.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  dotX.set(x)
  dotY.set(y)
  leanX.set(((x / rect.width) - 0.5) * -18)
  leanY.set(((y / rect.height) - 0.5) * -10)
  pointerActive.value = true
}

function onPointerLeave() {
  pointerActive.value = false
  leanX.set(0)
  leanY.set(0)
}

let ctx: gsap.Context | null = null

onMounted(() => {
  interactive.value = hasFinePointer() && !prefersReducedMotion()
  if (prefersReducedMotion() || !root.value) return
  // The name drifts up a little slower than the page as you scroll away.
  ctx = gsap.context(() => {
    gsap.to(nameEl.value, {
      yPercent: -14,
      ease: 'none',
      scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true },
    })
  }, root.value)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section
    ref="root"
    class="hero"
    :class="{ 'is-ready': introDone }"
    aria-labelledby="hero-title"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <motion.span
      v-if="interactive"
      class="signal"
      :class="{ 'is-on': pointerActive }"
      :style="{ x: dotX, y: dotY }"
      aria-hidden="true"
    />
    <div class="shell hero-inner">
      <div class="hero-meta">
        <p class="eyebrow hero-fade" style="--d: 0ms">{{ profile.role }}</p>
        <p class="eyebrow hero-fade hero-meta-mid" style="--d: 60ms">
          {{ profile.location.city }}, {{ profile.location.country }}
        </p>
        <p class="eyebrow hero-fade hero-meta-end" style="--d: 120ms">
          Now <span class="live" aria-hidden="true" /> {{ profile.projects[0]?.title }} at {{ profile.company }}
        </p>
      </div>

      <div ref="nameEl" class="hero-stage">
        <motion.div :style="{ x: leanX, y: leanY }">
          <h1 id="hero-title" class="hero-name">
            <span class="hero-line"><SplitText :text="profile.firstName" by="chars" :play="introDone" :stagger="42" /></span>
            <span class="hero-line hero-line--2"
              ><SplitText :text="profile.lastName" by="chars" :play="introDone" :delay="140" :stagger="42"
            /></span>
          </h1>
        </motion.div>
        <p class="hero-aside hero-fade" style="--d: 380ms">
          Portfolio ’26<br />
          Vue 3 · TypeScript · Tailwind
        </p>
      </div>

      <div class="hero-foot">
        <p class="hero-lede hero-fade" style="--d: 460ms">{{ profile.headline }}</p>
        <div class="hero-ctas hero-fade" style="--d: 540ms">
          <MagneticButton href="#work" icon="down" @click.prevent="scrollTo('#work')">View work</MagneticButton>
          <MagneticButton :href="profile.links.cv" variant="ghost" download>Download CV</MagneticButton>
        </div>
      </div>
    </div>

  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  overflow: clip;
  padding-top: var(--nav-h);
}
.hero-inner {
  position: relative;
  z-index: 1;
  min-height: calc(100svh - var(--nav-h));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
  padding-block: 24px 40px;
}

.hero-meta {
  display: grid;
  gap: 8px;
}
.hero-meta span {
  color: var(--ink-2);
  margin-left: 8px;
}
.hero-meta-mid {
  display: none;
}
.live {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin: 0 4px 1px 2px !important;
  border-radius: 999px;
  background: var(--accent);
  animation: live 2.4s var(--ease-in-out) infinite;
}
@keyframes live {
  50% {
    opacity: 0.35;
  }
}

.hero-stage {
  position: relative;
}
.hero-name {
  font-size: clamp(5.25rem, 23vw, 17rem);
  line-height: 0.82;
  letter-spacing: -0.055em;
  font-weight: 650;
  margin-left: -0.04em;
}
.hero-line {
  display: block;
}
.hero-aside {
  margin-top: 20px;
  font-size: 15px;
  line-height: 1.4;
  color: var(--ink-2);
}

.hero-foot {
  display: grid;
  gap: 28px;
}
.hero-lede {
  font-size: clamp(20px, 2.2vw, 28px);
  line-height: 1.3;
  letter-spacing: -0.01em;
  max-width: 24ch;
  text-wrap: balance;
}
.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (min-width: 900px) {
  .hero-meta {
    grid-template-columns: repeat(3, 1fr);
  }
  .hero-meta-mid {
    display: block;
    text-align: center;
  }
  .hero-meta-end {
    text-align: right;
  }
  .hero-name {
    font-size: clamp(6rem, 15.5vw, 17rem);
  }
  /* second line steps right; the aside sits in the space it leaves */
  .hero-line--2 {
    padding-left: 24%;
  }
  .hero-aside {
    position: absolute;
    left: 0;
    bottom: 1.2vw;
    margin: 0;
    max-width: 22%;
  }
  .hero-foot {
    grid-template-columns: 1fr auto;
    align-items: end;
  }
}

/* Fades only exist with JS; reduced motion shows them at once. */
:global(.js .hero:not(.is-ready) .hero-fade) {
  opacity: 0;
  transform: translate3d(0, 20px, 0);
}
.hero.is-ready .hero-fade {
  transition:
    opacity 800ms var(--ease-out) var(--d, 0ms),
    transform 1000ms var(--ease-out) var(--d, 0ms);
}

.signal {
  position: absolute;
  top: -14px;
  left: -14px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: var(--accent);
  pointer-events: none;
  opacity: 0;
  scale: 0.6;
  transition:
    opacity 200ms var(--ease-out),
    scale 250ms var(--ease-out);
  z-index: 0;
}
.signal.is-on {
  opacity: 1;
  scale: 1;
}

@media (prefers-reduced-motion: reduce) {
  .hero .hero-fade {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .live {
    animation: none;
  }
}
</style>
