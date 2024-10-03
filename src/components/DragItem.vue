<script setup lang="ts">
import { defineProps, ref, defineEmits } from "vue";
import { useDragQueen } from "@/composables/useDragQueen";

interface Item {
  id: number;
  children: Item[];
}

const myitem = ref(null);

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

const emits = defineEmits(["isDragging"]);

const isDraggable = ref(false);

const {
  dragStartHandler,
  dragEndHandler,
  dragEnterHandler,
  dragLeaveHandler,
  dropHandler,
  pointerDownHandler,
  setDebug,
  dragOverHandler,
} = useDragQueen();

setDebug();

const onPointerDown = (evt: PointerEvent, item: Item) => {
  evt.stopPropagation();
  isDraggable.value = true;
  emits("isDragging", true);
  pointerDownHandler(evt, item);
};

const onPointerUp = () => {
  isDraggable.value = false;
  emits("isDragging", false);
};
</script>
<template>
  <div
    class="drag-item"
    :draggable="isDraggable"
    @dragstart="(evt: DragEvent) => dragStartHandler(evt, item)"
    @dragenter="(evt: DragEvent) => dragEnterHandler(evt, item, index)"
    @dragover="(evt:DragEvent) => dragOverHandler(evt, item, index)"
    @dragleave="(evt: DragEvent) => dragLeaveHandler(evt, item)"
    @dragend="dragEndHandler"
    @drop="(evt: DragEvent) => dropHandler(evt, item)"
    @pointerdown="(evt: PointerEvent) => onPointerDown(evt, item)"
    @pointerup="onPointerUp"
    ref="myitem"
  >
    <slot />
    <template v-if="item && item.children && item.children.length > 0">
      <DragItem
        v-for="(i, j) in item.children"
        :key="i.id"
        :item="i"
        :index="j"
      >
        <p class="pointer-events-none">item {{ i.id }}</p>
      </DragItem>
    </template>
  </div>
</template>

<style>
.drag-item {
  padding: 1rem;
  border: 1px solid black;
  > p {
    margin-bottom: 1rem;
  }
}
.drag-item .drag-item {
  margin-left: 0.5rem;
}
</style>
