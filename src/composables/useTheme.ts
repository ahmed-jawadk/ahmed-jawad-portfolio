import { ref } from 'vue'
import { prefersReducedMotion } from './useReducedMotion'

export type Theme = 'dark' | 'light'

const root = document.documentElement
const theme = ref<Theme>(root.dataset.theme === 'light' ? 'light' : 'dark')

function apply(next: Theme) {
  theme.value = next
  root.dataset.theme = next
  try {
    localStorage.setItem('theme', next)
  } catch {
    /* private mode — theme still applies for this visit */
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0b0b0a' : '#efede6')
}

/**
 * Theme switching with a View Transitions circular reveal that grows
 * from the point that triggered it (usually the toggle button).
 */
export function useTheme() {
  async function toggle(origin?: { x: number; y: number }) {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'

    if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
      apply(next)
      return
    }

    const x = origin?.x ?? window.innerWidth - 40
    const y = origin?.y ?? 36
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    const transition = document.startViewTransition(() => apply(next))
    try {
      await transition.ready
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    } catch {
      /* transition skipped — theme is already applied */
    }
  }

  return { theme, toggle, set: apply }
}
