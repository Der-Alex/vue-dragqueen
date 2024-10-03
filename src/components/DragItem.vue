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
    :draggable="isDraggable"
    @dragstart="(evt: DragEvent) => dragStartHandler(evt, item)"
    @dragenter="(evt: DragEvent) => dragEnterHandler(evt, item, index)"
    @dragover="(evt:DragEvent) => dragOverHandler(evt, item, index)"
    @dragleave="(evt: DragEvent) => dragLeaveHandler(evt, item)"
    @dragend="dragEndHandler"
    @drop="(evt: DragEvent) => dropHandler(evt, item)"
    @pointerdown="(evt: PointerEvent) => onPointerDown(evt, item)"
    @pointerup="onPointerUp"
  >
    <slot :item="item" :index="index" />
    <template v-if="item && item.children && item.children.length > 0">
      <TransitionGroup name="list" mode="in-out">
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
  padding: 1rem;
  border: 1px solid black;
  > p {
    margin-bottom: 1rem;
  }
}
.dq-drag-item .dq-drag-item {
  margin-left: 0.5rem;
}
</style>
