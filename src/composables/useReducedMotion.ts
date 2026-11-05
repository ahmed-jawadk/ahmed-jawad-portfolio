import { computed } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'

/** true when the visitor asked the OS for reduced motion. Reactive. */
export function useReducedMotion() {
  const preference = usePreferredReducedMotion()
  return computed(() => preference.value === 'reduce')
}

/** Non-reactive one-off check for imperative code. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** True on devices with a precise, hover-capable pointer (mouse / trackpad). */
export function hasFinePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
}
