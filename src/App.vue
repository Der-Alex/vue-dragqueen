<script setup lang="ts">
import DragItem from "@/components/DragItem.vue";
import DropContainer from "@/components/DropContainer.vue";
import { ref } from "vue";

const items = ref([1, 2, 3, 4, 5, 6]);
const draggingItem = ref(-1);
const isDragging = ref(false);
const enteredItem = ref(-1);
const originalIndex = ref(-1);
const dragStartHandler = (evt: DragEvent, item: number, index: number) => {
  console.log("Event DRAGSTART", evt, item);
  draggingItem.value = item;
  isDragging.value = true;
  originalIndex.value = index;
};
const dragEnterHandler = (evt: DragEvent, item: number, index: number) => {
  evt.preventDefault();
  console.log("Event DRAGENTER", evt, item);
  enteredItem.value = item;

  if (draggingItem.value === enteredItem.value) {
    return;
  }
  if (draggingItem.value === item) {
    return;
  }
  if (originalIndex.value === index) {
    return;
  }

  swap(originalIndex.value, index);
  originalIndex.value = index;
};
const dragLeaveHandler = (evt: DragEvent, item: number) => {
  evt.preventDefault();
  console.log("Event DRAGLEAVE", evt, item);
};
const dragEndHandler = (evt: DragEvent) => {
  evt.preventDefault();
  isDragging.value = false;
  draggingItem.value = -1;
};
const dropHandler = (evt: DragEvent, item: number) => {
  evt.preventDefault();
  console.log("Event DROP", evt, item);
  reorder();
  draggingItem.value = -1;
  enteredItem.value = -1;
};

const reorder = () => {
  if (draggingItem.value === enteredItem.value) {
    return;
  }
  const indexToMove = items.value.indexOf(draggingItem.value);
  let indexToPlace = items.value.indexOf(enteredItem.value);
  items.value.splice(indexToMove, 1);
  if (indexToPlace > items.value.length) {
    indexToPlace--;
  }
  items.value.splice(indexToPlace, 0, draggingItem.value);
};
const swap = (index1: number, index2: number) => {
  const temp = items.value[index1];
  items.value[index1] = items.value[index2];
  items.value[index2] = temp;
};
</script>

<template>
  <div class="grid grid-cols-2 w-full h-svh">
    <DropContainer
      class="drag-items w-full h-full bg-gray-400 flex flex-col gap-2 p-4">
      <p>Dragging Item: {{ draggingItem }}</p>
      <p>Entered Item: {{ enteredItem }}</p>
      <TransitionGroup name="fade">
        <DragItem
          :class="{
            'bg-red-300': item === draggingItem,
          }"
          @dragstart="(evt: DragEvent) => dragStartHandler(evt, item, index)"
          @dragenter="(evt: DragEvent) => dragEnterHandler(evt, item, index)"
          @dragover.stop
          @dragleave="(evt: DragEvent) => dragLeaveHandler(evt, item)"
          @dragend="dragEndHandler"
          @drop="(evt: DragEvent) => dropHandler(evt, item)"
          v-for="(item, index) in items"
          :key="item"
          class="border border-gray-500/50 p-4">
          <p class="pointer-events-none">Item {{ item }}</p>
        </DragItem>
      </TransitionGroup>
    </DropContainer>

    <DropContainer class="w-full h-full bg-gray-500">
      <p class="text-center text-gray-600">Drop here</p>
    </DropContainer>
  </div>
</template>
<style scoped>
/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: transform 0.2s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  position: absolute;
}
</style>
