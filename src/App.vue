<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { MotionConfig } from 'motion-v'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { profile, sections } from '@/data/profile'
import type { OpenProjectPayload } from '@/types'
import { introDone } from '@/composables/useAppState'
import { lockScroll, useLenis } from '@/composables/useLenis'
import { prefersReducedMotion, useReducedMotion } from '@/composables/useReducedMotion'
import { useActiveSection } from '@/composables/useActiveSection'

import AppPreloader from '@/components/AppPreloader.vue'
import SiteNav from '@/components/SiteNav.vue'
import ScrollProgress from '@/components/ScrollProgress.vue'
import HeroSection from '@/sections/HeroSection.vue'
import StatsStrip from '@/sections/StatsStrip.vue'
import TerminalSection from '@/sections/TerminalSection.vue'
import ExperienceTimeline from '@/sections/ExperienceTimeline.vue'
import ProjectShowcase from '@/sections/ProjectShowcase.vue'
import SkillsMarquee from '@/sections/SkillsMarquee.vue'
import ContactSection from '@/sections/ContactSection.vue'

// Rarely-needed overlays are code-split.
const CommandPalette = defineAsyncComponent(() => import('@/components/CommandPalette.vue'))
const ProjectDetail = defineAsyncComponent(() => import('@/components/ProjectDetail.vue'))

const { start, destroy, scrollTo } = useLenis()
const reduced = useReducedMotion()
const active = useActiveSection(sections.map((s) => s.id))

// ---------- preloader ----------
const showPreloader = ref(!prefersReducedMotion())
if (!showPreloader.value) introDone.value = true

function onIntroReveal() {
  introDone.value = true
  lockScroll(false)
}

// ---------- command palette ----------
const paletteOpen = ref(false)

async function navigate(id: string) {
  paletteOpen.value = false
  await nextTick() // palette unmounts and releases the scroll lock first
  scrollTo(id === 'top' ? 0 : `#${id}`)
}

function onGlobalKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (!detail.value) paletteOpen.value = !paletteOpen.value
  }
}

// ---------- project detail ----------
const detail = ref<OpenProjectPayload | null>(null)
const detailIndex = computed(() => profile.projects.findIndex((p) => p.slug === detail.value?.slug))
const detailProject = computed(() => profile.projects[detailIndex.value])
const nextProject = computed(() => profile.projects[(detailIndex.value + 1) % profile.projects.length])

function openProject(payload: OpenProjectPayload) {
  paletteOpen.value = false
  detail.value = payload
}

function openProjectBySlug(slug: string) {
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  openProject({ slug, origin: null, opener })
}

function showNext() {
  if (!detail.value || !nextProject.value) return
  detail.value = { ...detail.value, slug: nextProject.value.slug, origin: null }
}

async function closeDetail() {
  const opener = detail.value?.opener
  detail.value = null
  await nextTick()
  opener?.focus({ preventScroll: true })
}

// ---------- lifecycle ----------
onMounted(() => {
  start()
  if (showPreloader.value) lockScroll(true)
  window.addEventListener('keydown', onGlobalKey)
  // Layout settles once web fonts arrive — re-measure scroll scenes.
  void document.fonts?.ready.then(() => ScrollTrigger.refresh())
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKey)
  destroy()
})

watch(reduced, (isReduced) => {
  if (isReduced) destroy()
  else start()
})
</script>

<template>
  <MotionConfig reduced-motion="user">
    <a href="#main" class="skip-link">Skip to content</a>

    <AppPreloader v-if="showPreloader" @reveal="onIntroReveal" @finished="showPreloader = false" />
    <ScrollProgress />
    <SiteNav :active="active" @open-palette="paletteOpen = true" />

    <main id="main" tabindex="-1">
      <HeroSection id="top" />
      <StatsStrip />
      <TerminalSection @open-project="openProjectBySlug" />
      <ExperienceTimeline />
      <ProjectShowcase @open="openProject" />
      <SkillsMarquee />
    </main>
    <ContactSection />

    <CommandPalette v-if="paletteOpen" @close="paletteOpen = false" @navigate="navigate" />
    <ProjectDetail
      v-if="detail && detailProject"
      :project="detailProject"
      :index="detailIndex"
      :total="profile.projects.length"
      :next-title="nextProject?.title ?? ''"
      :origin="detail.origin"
      @close="closeDetail"
      @next="showNext"
    />
  </MotionConfig>
</template>

<style>
main:focus {
  outline: none;
}
</style>
