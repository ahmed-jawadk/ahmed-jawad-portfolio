import { onBeforeUnmount, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { prefersReducedMotion } from './useReducedMotion'

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

/**
 * Rolls a number from 0 up to `target` the first time `active` becomes true.
 * Later target changes (a live counter ticking, data arriving) move from the
 * current value — small steps jump, large ones re-animate briefly.
 */
export function useCountUp(target: MaybeRefOrGetter<number>, active: Ref<boolean>, duration = 1600) {
  const value = ref(0)
  let frame = 0
  let started = false
  let lastTarget = 0

  function animate(from: number, to: number, ms: number) {
    cancelAnimationFrame(frame)
    if (ms <= 0 || prefersReducedMotion()) {
      value.value = to
      return
    }
    const startTime = performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / ms)
      value.value = Math.round(from + (to - from) * easeOutQuart(progress))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  }

  watch(
    [active, () => toValue(target)],
    ([isActive, to]) => {
      if (!isActive) return
      if (!started) {
        started = true
        animate(0, to, duration)
      } else if (to !== lastTarget) {
        animate(value.value, to, Math.abs(to - value.value) > 25 ? 700 : 0)
      }
      lastTarget = to
    },
    { immediate: true },
  )

  onBeforeUnmount(() => cancelAnimationFrame(frame))

  return value
}
