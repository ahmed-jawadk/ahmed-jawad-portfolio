<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useIntersectionObserver, useNow } from '@vueuse/core'
import { formatMonth, profile } from '@/data/profile'
import AnimatedCounter from '@/components/AnimatedCounter.vue'

const root = ref<HTMLElement | null>(null)
const active = ref(false)
const now = useNow({ interval: 1000 })

// Start of day in Baghdad (GMT+3, no DST) on the first working day.
const start = Date.parse(`${profile.startDate}T00:00:00+03:00`)
const DAY = 86_400_000

const elapsed = computed(() => Math.max(0, now.value.getTime() - start))
const days = computed(() => Math.floor(elapsed.value / DAY))
const clock = computed(() => {
  const rem = Math.floor((elapsed.value % DAY) / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(rem / 3600))}:${pad(Math.floor((rem % 3600) / 60))}:${pad(rem % 60)}`
})

// Under a year, months are the honest unit; it switches to years by itself.
const months = computed(() => {
  const s = new Date(start)
  const n = now.value
  return Math.max(0, (n.getFullYear() - s.getFullYear()) * 12 + (n.getMonth() - s.getMonth()))
})
const tenure = computed(() =>
  months.value >= 12
    ? { value: Math.floor(months.value / 12), label: 'Years of experience' }
    : { value: months.value, label: 'Months in production' },
)

const startLabel = formatMonth(profile.startDate.slice(0, 7))

const { stop } = useIntersectionObserver(
  root,
  (entries) => {
    if (!entries.some((e) => e.isIntersecting)) return
    active.value = true
    stop()
  },
  { threshold: 0.4 },
)

onMounted(() => {
  if (!('IntersectionObserver' in window)) active.value = true
})
</script>

<template>
  <section id="numbers" ref="root" class="numbers" aria-labelledby="numbers-title">
    <div class="shell">
      <h2 id="numbers-title" class="eyebrow numbers-title">
        <span class="live" aria-hidden="true" /> In numbers — live
      </h2>

      <dl class="stats">
        <div class="stat stat--lead">
          <dt>Days as a programmer</dt>
          <dd class="stat-value"><AnimatedCounter :value="days" :active="active" :duration="1800" /></dd>
          <dd class="stat-note tnum">+{{ clock }} today · since {{ startLabel }}</dd>
        </div>
        <div class="stat">
          <dt>Projects shipped</dt>
          <dd class="stat-value"><AnimatedCounter :value="profile.projects.length" :active="active" /></dd>
          <dd class="stat-note">ERP · web · hackathon</dd>
        </div>
        <div class="stat">
          <dt>{{ tenure.label }}</dt>
          <dd class="stat-value"><AnimatedCounter :value="tenure.value" :active="active" /></dd>
          <dd class="stat-note">Shipping Vue 3 + TypeScript</dd>
        </div>
        <div class="stat">
          <dt>Technologies in the toolkit</dt>
          <dd class="stat-value"><AnimatedCounter :value="profile.skills.length" :active="active" /></dd>
          <dd class="stat-note">Front-end · tooling · data</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.numbers {
  padding-block: clamp(56px, 8vw, 104px);
  background: var(--ground-2);
}
.numbers-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: clamp(32px, 4vw, 56px);
  font-family: var(--font-sans);
  letter-spacing: 0.04em;
  line-height: 1.2;
}
.live {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
  animation: live 2.4s var(--ease-in-out) infinite;
}
@keyframes live {
  50% {
    opacity: 0.35;
  }
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px 20px;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.stat dt {
  order: 2;
  font-size: 15px;
  color: var(--ink);
}
.stat-value {
  order: 1;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(3.25rem, 7vw, 6.5rem);
  line-height: 0.9;
  letter-spacing: -0.045em;
  font-variant-numeric: tabular-nums;
}
.stat-note {
  order: 3;
  font-size: 14px;
  color: var(--ink-3);
}
.stat--lead {
  grid-column: 1 / -1;
}
.stat--lead .stat-value {
  color: var(--accent-ink);
  font-size: clamp(4.5rem, 14vw, 10rem);
}

@media (min-width: 900px) {
  .stats {
    grid-template-columns: 1.7fr repeat(3, 1fr);
    gap: 0;
  }
  .stat {
    padding-inline: clamp(16px, 2vw, 32px);
    justify-content: flex-end;
  }
  .stat:first-child {
    padding-left: 0;
  }
  .stat + .stat {
    box-shadow: inset 1px 0 0 var(--line);
  }
  .stat--lead {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .live {
    animation: none;
  }
}
</style>
