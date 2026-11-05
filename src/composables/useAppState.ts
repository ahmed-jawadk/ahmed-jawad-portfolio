import { ref } from 'vue'

/**
 * Global UI state shared across sections.
 * `introDone` flips when the preloader starts wiping away — the hero's
 * split-text entrance keys off it. Starts true when there is no preloader.
 */
export const introDone = ref(false)
