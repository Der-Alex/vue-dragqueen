<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { useDragQueen } from "@/composables/useDragQueen";

defineProps({});
defineEmits([]);

const dq = useDragQueen();
</script>
<template>
  <div
    class="dq-drag-item p-2 border border-dashed border-green-400 rounded-lg w-max cursor-grab"
    :class="[...dq.classList.value, { 'cursor-grabbing': dq.isDragging }]"
    :style="dq.moveStyles()"
    @pointerdown.prevent="dq.onPointerDown"
    @pointerup.prevent="dq.onPointerUp"
    ref="dragItem"
  >
    {{ dq.itemData }}
  </div>
</template>
