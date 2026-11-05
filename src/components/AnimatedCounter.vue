<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useCountUp } from '@/composables/useCountUp'

const props = withDefaults(defineProps<{ value: number; active: boolean; duration?: number }>(), {
  duration: 1600,
})

const shown = useCountUp(() => props.value, toRef(props, 'active'), props.duration)
const format = new Intl.NumberFormat('en-US')
const text = computed(() => format.format(shown.value))
</script>

<template>
  <span class="tnum">{{ text }}</span>
</template>
