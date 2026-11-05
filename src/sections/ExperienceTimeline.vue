<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { formatMonth, profile, type Experience } from '@/data/profile'
import { vReveal } from '@/directives/reveal'

gsap.registerPlugin(ScrollTrigger)

const list = ref<HTMLElement | null>(null)
const fill = ref<HTMLElement | null>(null)
let mm: gsap.MatchMedia | null = null

function range(e: Experience) {
  if (e.end === e.start) return formatMonth(e.start)
  return `${formatMonth(e.start)} — ${e.end ? formatMonth(e.end) : 'Now'}`
}

onMounted(() => {
  if (!list.value || !fill.value) return
  const listEl = list.value
  const fillEl = fill.value
  mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // The rail draws as you scroll through the list.
    gsap.fromTo(
      fillEl,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: listEl, start: 'top 62%', end: 'bottom 62%', scrub: 0.5 },
      },
    )
    // Each dot lights up as the line reaches it.
    listEl.querySelectorAll<HTMLElement>('.entry').forEach((entry) => {
      ScrollTrigger.create({
        trigger: entry,
        start: 'top 62%',
        onEnter: () => entry.classList.add('is-reached'),
        onLeaveBack: () => entry.classList.remove('is-reached'),
      })
    })
  })
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section id="experience" class="section-y" aria-labelledby="experience-title">
    <div class="shell exp-grid">
      <div class="exp-intro">
        <p v-reveal class="eyebrow">02 — Experience</p>
        <h2 id="experience-title" v-reveal="60" class="exp-title">Where the work happens.</h2>
        <p v-reveal="120" class="exp-lede">
          Building {{ profile.projects[0]?.title }} full-time at {{ profile.company }}, with freelance work on the side.
        </p>
        <p v-reveal="180" class="exp-aside">
          Also on the CV: order management at Toters, driver support at Baly, marketing &amp; events at Digital Zone —
          time spent hearing what people actually struggle with.
        </p>
      </div>

      <div ref="list" class="timeline-wrap">
        <span class="rail" aria-hidden="true"><span ref="fill" class="rail-fill" /></span>
        <ol class="timeline">
        <li v-for="item in profile.experience" :key="item.id" class="entry">
          <span class="dot" aria-hidden="true" />
          <div v-reveal class="entry-top">
            <span class="tnum">{{ range(item) }}</span>
            <span class="entry-type">{{ item.type }}</span>
          </div>
          <h3 v-reveal="70" class="entry-role">{{ item.role }}</h3>
          <div v-reveal="140">
            <p class="entry-org">
              <a v-if="item.orgUrl" :href="item.orgUrl" target="_blank" rel="noopener noreferrer" class="entry-org-link">{{ item.org }}</a
              ><template v-else>{{ item.org }}</template
              ><template v-if="item.project"> · {{ item.project }}</template>
              <span class="entry-loc"> — {{ item.location }}</span>
            </p>
            <ul class="entry-points">
              <li v-for="point in item.points" :key="point">{{ point }}</li>
            </ul>
          </div>
          <ul v-reveal="210" class="entry-tags" aria-label="Technologies">
            <li v-for="tag in item.tags" :key="tag">{{ tag }}</li>
          </ul>
        </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.exp-grid {
  display: grid;
  gap: 56px;
}
.exp-title {
  margin-top: 20px;
  font-size: clamp(3rem, 7vw, 6.5rem);
}
.exp-lede {
  margin-top: 24px;
  max-width: 34ch;
  font-size: clamp(18px, 1.5vw, 20px);
}
.exp-aside {
  margin-top: 20px;
  max-width: 38ch;
  font-size: 15px;
  color: var(--ink-3);
}

.timeline-wrap {
  position: relative;
  padding-left: 40px;
}
.timeline {
  display: grid;
  gap: clamp(56px, 7vw, 96px);
}
.rail {
  position: absolute;
  left: 5px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--ground-4);
  border-radius: 2px;
  overflow: hidden;
}
.rail-fill {
  display: block;
  height: 100%;
  background: var(--accent);
  transform-origin: 50% 0;
}
.entry {
  position: relative;
}
.dot {
  position: absolute;
  left: -40px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--ground);
  box-shadow: inset 0 0 0 2px var(--ground-4);
}
/* lit state: a lime disc fades and scales in over the ring */
.dot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--accent);
  opacity: 0;
  transform: scale(0.6);
  transition:
    opacity 300ms var(--ease-out),
    transform 400ms var(--ease-out);
}
.entry.is-reached .dot::after {
  opacity: 1;
  transform: none;
}
.entry-top {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  font-size: 14px;
  color: var(--ink-3);
}
.entry-type {
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--ground-3);
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 500;
}
.entry-role {
  margin-top: 14px;
  font-size: clamp(2rem, 4vw, 3.25rem);
  line-height: 1;
  letter-spacing: -0.035em;
}
.entry-org {
  margin-top: 10px;
  font-size: 17px;
  color: var(--accent-ink);
  font-weight: 500;
}
.entry-org-link {
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
  text-underline-offset: 4px;
}
@media (hover: hover) and (pointer: fine) {
  .entry-org-link:hover {
    text-decoration-color: currentColor;
  }
}
.entry-loc {
  color: var(--ink-3);
  font-weight: 400;
}
.entry-points {
  margin-top: 16px;
  display: grid;
  gap: 8px;
  max-width: 60ch;
  color: var(--ink-2);
}
.entry-points li {
  position: relative;
  padding-left: 20px;
}
.entry-points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 8px;
  height: 1.5px;
  background: var(--ink-3);
}
.entry-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 20px;
}
.entry-tags li {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--ground-2);
  font-size: 13px;
  color: var(--ink-2);
}

@media (min-width: 1000px) {
  .exp-grid {
    grid-template-columns: 4fr 8fr;
    gap: clamp(40px, 5vw, 96px);
    align-items: start;
  }
  .exp-intro {
    position: sticky;
    top: calc(var(--nav-h) + 40px);
  }
  .timeline-wrap {
    padding-left: 64px;
  }
  .dot {
    left: -64px;
  }
}

/* No scroll scene → show every dot as reached. */
@media (prefers-reduced-motion: reduce) {
  .dot::after {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
