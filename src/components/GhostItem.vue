<script setup lang="ts">
import { defineProps } from "vue";
defineProps({
  size: {
    type: Object as () => { width: number; height: number },
    default: () => ({ width: 16, height: 128 }),
  },
});
</script>
<template>
  <div
    class="dq-ghost-item rounded-lg border border-dashed border-green-400"
    :style="`width: ${size.width}px; height: ${size.height}px`"
  ></div>
</template>
