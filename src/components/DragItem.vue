<script setup lang="ts">
import { defineProps, ref } from "vue";
import { useDragQueen } from "@/composables/useDragQueen";

interface Item {
  id: number;
  children: Item[];
}

defineProps({
  item: {
    type: Object as () => any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const isDraggable = ref(false);

const {
  dragHandler,
  dragStartHandler,
  dragEndHandler,
  dragEnterHandler,
  dragLeaveHandler,
  dropHandler,
  pointerDownHandler,
  setDebug,
} = useDragQueen();

setDebug();

const onPointerDown = (evt: PointerEvent, item: Item) => {
  evt.stopPropagation();
  isDraggable.value = true;
  pointerDownHandler(evt, item);
};

const onPointerUp = (evt: PointerEvent) => {
  isDraggable.value = false;
};
</script>
<template>
  <div
    class="drag-item"
    :draggable="isDraggable"
    @dragstart="(evt: DragEvent) => dragStartHandler(evt, item, index)"
    @dragenter="(evt: DragEvent) => dragEnterHandler(evt, item, index)"
    @dragover.stop
    @dragleave="(evt: DragEvent) => dragLeaveHandler(evt, item)"
    @dragend="dragEndHandler"
    @drop="(evt: DragEvent) => dropHandler(evt, item)"
    @pointerdown="(evt: PointerEvent) => onPointerDown(evt, item)"
    @pointerup="onPointerUp"
  >
    <slot />
    <template v-if="item && item.children && item.children.length > 0">
      <DragItem
        v-for="(i, j) in item.children"
        :key="i.id"
        :item="i"
        :index="j"
      >
        <p>item {{ i.id }}</p>
      </DragItem>
    </template>
  </div>
</template>

<style>
.drag-item .drag-item {
  margin-left: 0.5rem;
}
</style>
