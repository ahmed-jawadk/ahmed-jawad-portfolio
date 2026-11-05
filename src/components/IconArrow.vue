<script setup lang="ts">
withDefaults(defineProps<{ direction?: 'up-right' | 'right' | 'down' | 'left' | 'up' }>(), {
  direction: 'up-right',
})
</script>

<template>
  <svg
    class="icon-arrow"
    :data-dir="direction"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M3.5 8h9M8.5 4l4 4-4 4" />
  </svg>
</template>

<style scoped>
.icon-arrow {
  flex: none;
}
.icon-arrow[data-dir='up-right'] {
  transform: rotate(-45deg);
}
.icon-arrow[data-dir='down'] {
  transform: rotate(90deg);
}
.icon-arrow[data-dir='left'] {
  transform: rotate(180deg);
}
.icon-arrow[data-dir='up'] {
  transform: rotate(-90deg);
}
</style>
