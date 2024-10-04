<script setup lang="ts">
import { defineProps, ref } from "vue";
import { useDragQueen, type Item } from "@/composables/useDragQueen";

defineProps({
  item: {
    type: Object as () => Item,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

defineSlots<{
  default(props: { item: Item; index: number }): any;
}>();

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
  backgroundColor,
} = useDragQueen();

setDebug();

const onPointerDown = (evt: PointerEvent, item: Item) => {
  evt.stopPropagation();
  isDraggable.value = true;
  pointerDownHandler(evt, item);
};

const onPointerUp = () => {
  isDraggable.value = false;
};
</script>
<template>
  <div
    class="dq-drag-item"
    :class="{ 'h-8 overflow-hidden': isDraggable }"
    :draggable="isDraggable"
    @dragstart="(evt: DragEvent) => dragStartHandler(evt, item)"
    @dragenter="(evt: DragEvent) => dragEnterHandler(evt, item, index)"
    @dragover="(evt:DragEvent) => dragOverHandler(evt, item, index)"
    @dragleave="(evt: DragEvent) => dragLeaveHandler(evt, item)"
    @dragend="dragEndHandler"
    @drop="(evt: DragEvent) => dropHandler(evt, item)"
    @pointerdown="(evt: PointerEvent) => onPointerDown(evt, item)"
    @pointerup="onPointerUp"
    :style="{
      backgroundColor,
    }"
  >
    <div class="pointer-events-none">
      <slot :item="item" :index="index" />
    </div>
    <template v-if="item && item.children && item.children.length > 0">
      <TransitionGroup name="none" mode="in-out">
        <DragItem
          v-for="(i, j) in item.children"
          :key="i.id"
          :item="i"
          :index="j"
        >
          <template v-slot="{ item: i, index: j }">
            <slot :item="i" :index="j" />
          </template>
        </DragItem>
      </TransitionGroup>
    </template>
  </div>
</template>

<style>
.dq-drag-item {
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}
.dq-drag-item .dq-drag-item {
  margin-left: 1rem;
}
p {
  padding: 0.5rem;
}
</style>
