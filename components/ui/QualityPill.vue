<template>
  <span class="quality" :class="`quality-${ql.key}`">
    {{ ql.label }}
  </span>
</template>

<script setup lang="ts">
import { qualityLabel } from '~/utils/elo'
const props = defineProps<{ quality: number }>()
const ql = computed(() => qualityLabel(props.quality))
</script>
