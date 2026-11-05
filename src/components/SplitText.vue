<script setup lang="ts">
import { computed } from 'vue'

/**
 * Splits text into masked words or characters that rise into place when
 * `play` turns true. Screen readers get the plain string once; the split
 * copy is aria-hidden. Hidden state only applies under `.js`, and reduced
 * motion shows everything immediately.
 */
const props = withDefaults(
  defineProps<{
    text: string
    by?: 'words' | 'chars'
    play?: boolean
    /** ms before the first unit moves */
    delay?: number
    /** ms between units (30–90 recommended) */
    stagger?: number
  }>(),
  { by: 'words', play: true, delay: 0, stagger: 40 },
)

const words = computed(() => {
  let i = 0
  return props.text.split(' ').map((word) => ({
    word,
    units: props.by === 'chars' ? [...word].map((c) => ({ c, i: i++ })) : [{ c: word, i: i++ }],
  }))
})
</script>

<template>
  <span
    class="split"
    :class="{ 'is-playing': play }"
    :style="{ '--split-delay': `${delay}ms`, '--split-stagger': `${stagger}ms` }"
  >
    <span class="sr-only">{{ text }}</span>
    <span aria-hidden="true"
      ><template v-for="(w, wi) in words" :key="wi"
        ><span class="split-mask"
          ><span v-for="u in w.units" :key="u.i" class="split-unit" :style="{ '--i': u.i }">{{ u.c }}</span></span
        ><template v-if="wi < words.length - 1">{{ ' ' }}</template></template
      ></span
    >
  </span>
</template>

<style scoped>
.split-mask {
  display: inline-block;
  overflow: clip;
  vertical-align: top;
  /* room for descenders and the rotated start position */
  padding-block: 0.04em 0.14em;
  margin-block: -0.04em -0.14em;
}
.split-unit {
  display: inline-block;
  transform-origin: 0% 100%;
}
:global(.js .split:not(.is-playing) .split-unit) {
  transform: translate3d(0, 112%, 0) rotate(5deg);
}
.split.is-playing .split-unit {
  transition: transform 1100ms var(--ease-out);
  transition-delay: calc(var(--split-delay) + var(--i) * var(--split-stagger));
}
@media (prefers-reduced-motion: reduce) {
  .split .split-unit {
    transform: none !important;
    transition: none !important;
  }
}
</style>
