<script setup lang="ts">
import { defineProps, ref } from "vue";
import { useDragQueen, type Item } from "@/composables/useDragQueen";

defineProps({
  classes: {
    type: String,
    default: "",
  },
  item: {
    type: Object as () => Item,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  transitionGroupName: {
    type: String,
    default: "none",
  },
  style: {
    type: Object,
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
    :class="{ 'dq-is-dragging': isDraggable, classes: true }"
    :style="style"
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
    <div class="pointer-events-none">
      <slot :item="item" :index="index" />
    </div>
    <template v-if="item && item.children && item.children.length > 0">
      <TransitionGroup :name="transitionGroupName">
        <DragItem
          v-for="(i, j) in item.children"
          :key="i.id"
          :item="i"
          :index="j"
          :classes="classes"
          :style="style"
          :transition-group-name="transitionGroupName"
        >
          <template v-slot="{ item: i, index: j }">
            <slot :item="i" :index="j" />
          </template>
        </DragItem>
      </TransitionGroup>
    </template>
  </div>
</template>
