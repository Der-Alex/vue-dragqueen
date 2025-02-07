<script setup lang="ts">
import { useDragQueen } from '@/composables/useDragQueen';

const { itemSize } = useDragQueen();
</script>
<template>
  <div
    class="dq-ghost-item dq-drag-item"
    :style="`width: ${itemSize.width}px; height: ${itemSize.height}px`"></div>
</template>
