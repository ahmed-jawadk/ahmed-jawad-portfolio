<script setup lang="ts">
import { profile, type Project } from '@/data/profile'
import { vReveal } from '@/directives/reveal'
import IconArrow from '@/components/IconArrow.vue'
import type { OpenProjectPayload } from '@/types'

const emit = defineEmits<{ open: [payload: OpenProjectPayload] }>()

function open(project: Project, el: HTMLElement | null) {
  emit('open', { slug: project.slug, origin: el?.getBoundingClientRect() ?? null, opener: el })
}

// The whole card is a click target for pointer users; links and the button keep their own behaviour.
function onCardClick(project: Project, e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('a, button')) return
  open(project, e.currentTarget as HTMLElement)
}
</script>

<template>
  <section id="work" class="section-y work" aria-labelledby="work-title">
    <div class="shell">
      <header class="work-head">
        <p v-reveal class="eyebrow">03 — Selected work</p>
        <h2 id="work-title" v-reveal="60" class="work-title">Things I’ve shipped.</h2>
        <p v-reveal="120" class="work-count tnum">
          {{ String(profile.projects.length).padStart(2, '0') }} projects · 2023 — now
        </p>
      </header>

      <ol class="cards">
        <li v-for="(p, i) in profile.projects" :key="p.slug" v-reveal="i * 70">
          <article class="card" @click="onCardClick(p, $event)">
            <div class="card-id">
              <p class="card-meta tnum">
                <span>{{ String(i + 1).padStart(2, '0') }}</span>
                <span>{{ p.kind }}</span>
                <span>{{ p.year }}</span>
              </p>
              <h3 class="card-title">{{ p.title }}</h3>
              <p class="card-role">{{ p.role }}</p>
            </div>

            <div class="card-body">
              <div class="card-lead">
                <span class="outcome">{{ p.outcome }}</span>
                <p>{{ p.summary }}</p>
              </div>

              <ul class="highlights">
                <li v-for="h in p.highlights" :key="h">{{ h }}</li>
              </ul>

              <ul class="tags" aria-label="Stack">
                <li v-for="s in p.stack" :key="s">{{ s }}</li>
              </ul>

              <div class="card-actions">
                <button type="button" class="case-btn press" @click="open(p, ($event.currentTarget as HTMLElement).closest('article'))">
                  Read the case <IconArrow direction="right" />
                </button>
                <a v-if="p.link" :href="p.link" target="_blank" rel="noopener noreferrer" class="card-link">
                  Visit site <IconArrow />
                </a>
                <span v-else-if="p.note" class="card-note">{{ p.note }}</span>
              </div>
            </div>
          </article>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.work-head {
  display: grid;
  gap: 16px;
  margin-bottom: clamp(32px, 4vw, 56px);
}
.work-title {
  font-size: clamp(2.75rem, 7vw, 6rem);
  line-height: 0.9;
  letter-spacing: -0.05em;
}
.work-count {
  color: var(--ink-3);
  font-size: 15px;
}

/* ---------- cards ---------- */
.cards {
  display: grid;
  gap: 12px;
}
.card {
  display: grid;
  gap: 24px;
  padding: clamp(20px, 3vw, 36px);
  border-radius: 24px;
  background: var(--ground-2);
  cursor: pointer;
  transition: background-color 250ms var(--ease-out);
}
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 13px;
  color: var(--ink-3);
}
.card-meta span:first-child {
  color: var(--accent-ink);
}
.card-title {
  margin-top: 14px;
  font-size: clamp(2.25rem, 4.5vw, 3.75rem);
  line-height: 0.95;
  letter-spacing: -0.045em;
}
.card-role {
  margin-top: 12px;
  font-size: 15px;
  color: var(--ink-2);
}

.card-body {
  display: grid;
  gap: 20px;
  align-content: start;
}
.card-lead {
  display: grid;
  gap: 12px;
  justify-items: start;
}
.card-lead p {
  max-width: 52ch;
  font-size: clamp(17px, 1.4vw, 19px);
  line-height: 1.4;
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
  gap: 8px;
  max-width: 62ch;
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

.card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  margin-top: 4px;
}
.case-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: var(--ground-4);
  font-weight: 500;
  font-size: 15px;
}
.card-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  color: var(--accent-ink);
  font-weight: 500;
  font-size: 15px;
}
.card-note {
  font-size: 14px;
  color: var(--ink-3);
}

@media (min-width: 900px) {
  .card {
    grid-template-columns: minmax(0, 4fr) minmax(0, 7fr);
    gap: clamp(32px, 5vw, 80px);
  }
}

@media (hover: hover) and (pointer: fine) {
  .card:hover {
    background: var(--ground-3);
  }
  .card:hover .tags li {
    background: var(--ground-4);
  }
  .case-btn:hover {
    background: var(--accent);
    color: var(--on-accent);
  }
}
</style>
