<template>
  <span class="tier" :class="`tier-${tier.key}`">
    {{ tier.emoji }} {{ tier.label }}
  </span>
</template>

<script setup lang="ts">
import { getTier } from '~/utils/elo'

const props = defineProps<{ rating: number }>()
const tier = computed(() => getTier(props.rating))
</script>
