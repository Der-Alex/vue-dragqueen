<script setup lang="ts">
import { defineProps } from "vue";
import { useDragQueen, type Item } from "@/composables/useDragQueen";

const { itemSize } = useDragQueen();
defineProps<{
  item: Item;
}>();
</script>
<template>
  <div
    class="dq-ghost-item dq-drag-item"
    :class="{ 'dq-old-item': item.id === 'oldItem' }"
    :style="`width: ${itemSize.width}px; height: ${
      item.id === 'oldItem' ? itemSize.height : '4'
    }px`"
  ></div>
</template>
