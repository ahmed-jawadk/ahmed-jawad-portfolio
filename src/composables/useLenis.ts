import { shallowRef } from 'vue'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const lenis = shallowRef<Lenis | null>(null)
let tick: ((time: number) => void) | null = null

/**
 * One Lenis instance for the whole page, driven by GSAP's ticker so
 * ScrollTrigger scenes and smooth scrolling share a single frame loop.
 * Disabled entirely under prefers-reduced-motion.
 */
export function useLenis() {
  function start() {
    if (lenis.value || prefersReducedMotion()) return
    const instance = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
    })
    instance.on('scroll', ScrollTrigger.update)
    tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    lenis.value = instance
  }

  function destroy() {
    if (tick) gsap.ticker.remove(tick)
    tick = null
    lenis.value?.destroy()
    lenis.value = null
  }

  function scrollTo(target: string | HTMLElement | number, options: { offset?: number; immediate?: boolean } = {}) {
    if (lenis.value) {
      lenis.value.scrollTo(target, { offset: options.offset ?? 0, immediate: options.immediate, duration: 1.2 })
      return
    }
    const behavior: ScrollBehavior = options.immediate || prefersReducedMotion() ? 'auto' : 'smooth'
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior })
      return
    }
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY + (options.offset ?? 0)
    window.scrollTo({ top, behavior })
  }

  function stop() {
    lenis.value?.stop()
  }

  function resume() {
    lenis.value?.start()
  }

  return { lenis, start, destroy, scrollTo, stop, resume }
}

/** Lock page scroll (menus, dialogs). Works with and without Lenis. */
export function lockScroll(locked: boolean) {
  const { stop, resume } = useLenis()
  document.documentElement.classList.toggle('is-locked', locked)
  if (locked) stop()
  else resume()
}
