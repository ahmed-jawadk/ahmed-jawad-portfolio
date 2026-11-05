import type { Directive } from 'vue'

/**
 * v-reveal — RevealOnScroll as a directive.
 *   v-reveal            rise 24px + fade
 *   v-reveal="120"      same, 120ms delay (use for 60–90ms staggers)
 *   v-reveal="{ clip: true, delay: 0 }"   clip-path inset reveal (images)
 *
 * Hidden styles live in main.css under `.js` (never applied without JS),
 * are disabled for reduced motion, and without IntersectionObserver the
 * element is shown immediately.
 */
type RevealValue = number | { delay?: number; clip?: boolean } | undefined

let observer: IntersectionObserver | null = null

function getObserver(): IntersectionObserver {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        obs.unobserve(entry.target)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )
  return observer
}

export const vReveal: Directive<HTMLElement, RevealValue> = {
  mounted(el, binding) {
    const value = binding.value
    const delay = typeof value === 'number' ? value : (value?.delay ?? 0)
    const clip = typeof value === 'object' && value.clip === true

    el.dataset.reveal = clip ? 'clip' : ''
    el.style.setProperty('--reveal-delay', `${delay}ms`)

    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
