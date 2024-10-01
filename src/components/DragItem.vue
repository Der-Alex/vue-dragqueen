<script setup lang="ts">
import { defineProps } from "vue";
import { useDragQueen } from "@/composables/useDragQueen";

defineProps({
  item: {
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const {
  dragStartHandler,
  dragEndHandler,
  dragEnterHandler,
  dragLeaveHandler,
  dropHandler,
  pointerDownHandler,
} = useDragQueen();
</script>
<template>
  <div
    class="drag-item"
    draggable="true"
    @dragstart="(evt: DragEvent) => dragStartHandler(evt, item, index)"
    @dragenter="(evt: DragEvent) => dragEnterHandler(evt, item, index)"
    @dragover.stop
    @dragleave="(evt: DragEvent) => dragLeaveHandler(evt, item)"
    @dragend="dragEndHandler"
    @drop="(evt: DragEvent) => dropHandler(evt, item)"
    @pointerdown="(evt: PointerEvent) => pointerDownHandler(evt, item)"
  >
    <slot />
  </div>
</template>
