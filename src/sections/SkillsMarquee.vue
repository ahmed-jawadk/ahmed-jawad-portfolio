<script setup lang="ts">
import { computed } from 'vue'
import { profile, type SkillGroup } from '@/data/profile'
import { vReveal } from '@/directives/reveal'

const rowA = computed(() => profile.skills.filter((s) => s.core && s.group === 'Front-end').map((s) => s.name))
const rowB = computed(() =>
  profile.skills.filter((s) => (s.core && s.group !== 'Front-end') || s.group === 'Languages').map((s) => s.name),
)

const groups = computed(() => {
  const order: SkillGroup[] = ['Front-end', 'Tooling', 'Languages', 'Data']
  return order.map((group) => ({ group, items: profile.skills.filter((s) => s.group === group).map((s) => s.name) }))
})
</script>

<template>
  <section id="toolkit" class="section-y toolkit" aria-labelledby="toolkit-title">
    <div class="shell toolkit-head">
      <p v-reveal class="eyebrow">04 — Toolkit</p>
      <h2 id="toolkit-title" v-reveal="60" class="toolkit-title">What I build with.</h2>
    </div>

    <!-- Decorative: the full, readable list follows below. -->
    <div class="marquees" aria-hidden="true">
      <div class="marquee">
        <div class="track">
          <template v-for="copy in 2" :key="copy">
            <span v-for="(name, i) in rowA" :key="`${copy}-${name}`" class="word" :class="{ 'is-dim': i % 2 === 1 }">
              {{ name }}<i class="sep" />
            </span>
          </template>
        </div>
      </div>
      <div class="marquee marquee--reverse">
        <div class="track">
          <template v-for="copy in 2" :key="copy">
            <span v-for="(name, i) in rowB" :key="`${copy}-${name}`" class="word" :class="{ 'is-dim': i % 2 === 0 }">
              {{ name }}<i class="sep" />
            </span>
          </template>
        </div>
      </div>
    </div>

    <div class="shell">
      <div class="groups">
        <div v-for="(g, gi) in groups" :key="g.group" v-reveal="gi * 70" class="group">
          <h3 class="group-title">{{ g.group }}</h3>
          <ul>
            <li v-for="item in g.items" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div v-reveal="groups.length * 70" class="group">
          <h3 class="group-title">Spoken</h3>
          <ul>
            <li v-for="l in profile.spokenLanguages" :key="l.name">
              {{ l.name }} <span class="level">{{ l.level }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.toolkit {
  overflow: clip;
}
.toolkit-title {
  margin-top: 20px;
  font-size: clamp(3rem, 7vw, 6.5rem);
}
.marquees {
  margin-block: clamp(48px, 6vw, 96px);
  display: grid;
  gap: 4px;
}
.marquee {
  overflow: clip;
  user-select: none;
}
.track {
  display: flex;
  width: max-content;
  animation: marquee 48s linear infinite;
}
.marquee--reverse .track {
  animation-direction: reverse;
  animation-duration: 56s;
}
@keyframes marquee {
  to {
    transform: translate3d(-50%, 0, 0);
  }
}
.word {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(3rem, 9vw, 8.5rem);
  line-height: 1.05;
  letter-spacing: -0.045em;
}
.word.is-dim {
  color: var(--ink-3);
}
.sep {
  display: inline-block;
  width: 0.16em;
  height: 0.16em;
  margin-inline: 0.42em;
  background: var(--accent);
  border-radius: 2px;
  transform: rotate(45deg);
}
@media (hover: hover) and (pointer: fine) {
  .marquee:hover .track {
    animation-play-state: paused;
  }
}

.groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px 24px;
}
.group-title {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-3);
  line-height: 1.2;
  margin-bottom: 16px;
}
.group ul {
  display: grid;
  gap: 6px;
  font-size: 17px;
}
.level {
  color: var(--ink-3);
  font-size: 14px;
  margin-left: 4px;
}
@media (min-width: 900px) {
  .groups {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .track {
    animation: none;
    flex-wrap: wrap;
    width: auto;
    padding-inline: var(--gutter);
  }
  .marquee--reverse {
    display: none;
  }
  .word {
    font-size: clamp(2rem, 5vw, 4rem);
  }
}
</style>
