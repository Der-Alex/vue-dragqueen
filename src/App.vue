<script setup lang="ts">
import DragItem from "@/components/DragItem.vue";
import DropContainer from "@/components/DropContainer.vue";
import { ref } from "vue";

const items = ref<number[]>([]);
const dropItems = ref<number[]>([]);
const draggingItem = ref(-1);
const isDragging = ref(false);
const enteredItem = ref(-1);
const originalIndex = ref(-1);
const lastDraggedItem = ref(-1);
const isTouching = ref(-1);

const dragStartHandler = (evt: DragEvent, item: number, index: number) => {
  console.log("Event DRAGSTART", evt, item);
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
  console.log("Event DRAGLEAVE", evt, item);
};
const dragEndHandler = (evt: DragEvent) => {
  console.log("Event DRAGEND", evt);
  isDragging.value = false;
  lastDraggedItem.value = draggingItem.value;
  draggingItem.value = -1;
};
const dropHandler = (evt: DragEvent, item: number) => {
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
const addHandler = () => {
  let originalOrder = [...items.value];
  // Sortiere das items.valueay, um die größte vorhandene Zahl leicht zu finden
  items.value.sort((a, b) => a - b);

  // Starte bei 1 und suche die nächste fehlende positive Zahl
  let nextPositive = 1;

  for (let num of items.value) {
    if (num < nextPositive) {
      // Überspringe Zahlen, die kleiner als die gesuchte sind
      continue;
    } else if (num === nextPositive) {
      // Wenn die Zahl im items.valueay der gesuchten entspricht, erhöhe nextPositive
      nextPositive++;
    } else {
      // Wenn wir eine Lücke finden, können wir abbrechen, da nextPositive die gesuchte Zahl ist
      break;
    }
  }

  // Füge die nächste positive Zahl hinzu
  originalOrder.push(nextPositive);
  items.value = [...originalOrder];
};
const removeHandler = () => {
  if (items.value.length === 1) {
    items.value = [];
  } else {
    items.value.pop();
  }
};

const dropHandlerDropContainer = (evt: DragEvent) => {
  evt.preventDefault();
  dropItems.value.push(lastDraggedItem.value);
};
const pointerDownHandler = (evt: PointerEvent, item: number) => {
  console.log("Event POINTERDOWN", evt.type, isTouching.value);
  draggingItem.value = item;
  isTouching.value = item;
  console.log("touchy", isTouching.value);
};
const pointerUpHandler = (evt: PointerEvent) => {
  console.log("Event POINTERUP", evt.type, isTouching.value);
  isTouching.value = -1;
  console.log("touchy", isTouching.value);
};

window.addEventListener("pointerup", pointerUpHandler);
</script>

<template>
  <div class="grid grid-cols-2 w-full h-svh">
    <DropContainer
      class="drag-items w-full h-full bg-gray-400 flex flex-col gap-2 p-4">
      <div class="buttons">
        <button
          class="w-24 border border-gray-500 bg-gray-300"
          @click="addHandler">
          Add Item</button
        ><button
          class="w-32 border border-gray-500 bg-gray-300"
          @click="removeHandler">
          Remove Item
        </button>
      </div>
      <p>Dragging Item: {{ draggingItem }}</p>
      <p>Entered Item: {{ enteredItem }}</p>
      <TransitionGroup name="fade">
        <DragItem
          @dragstart="(evt: DragEvent) => dragStartHandler(evt, item, index)"
          @dragenter="(evt: DragEvent) => dragEnterHandler(evt, item, index)"
          @dragover.stop
          @dragleave="(evt: DragEvent) => dragLeaveHandler(evt, item)"
          @dragend="dragEndHandler"
          @drop="(evt: DragEvent) => dropHandler(evt, item)"
          @pointerdown="(evt: PointerEvent) => pointerDownHandler(evt, item)"
          v-for="(item, index) in items"
          :key="item"
          class="rounded-md border border-gray-500/50 p-4 cursor-grab"
          :class="{
            'bg-red-300': item === draggingItem,
            'bg-gray-100 shadow-sm': item !== draggingItem,
            'rotate-[1deg] shadow-lg cursor-grabbing':
              item === isTouching && draggingItem > -1,
          }">
          <p class="pointer-events-none">Item {{ item }}</p>
        </DragItem>
      </TransitionGroup>
    </DropContainer>

    <DropContainer
      class="w-full h-full bg-gray-500"
      @drop="(evt: DragEvent) => dropHandlerDropContainer(evt)">
      <p class="text-center text-gray-600">Drop here</p>
      <DragItem
        v-for="item of dropItems"
        :key="item">
        <p>{{ item }}</p></DragItem
      >
    </DropContainer>
  </div>
</template>
<style scoped>
/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: transform 0.2s cubic-bezier(0.55, 0, 0.1, 1),
    box-shadow 0.2s cubic-bezier(0.55, 0, 0.1, 1);
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
