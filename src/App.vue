<script setup lang="ts">
import DragItem from "@/components/DragItem.vue";
import DropContainer from "@/components/DropContainer.vue";
import { useDragQueen } from "./composables/useDragQueen";

const { items, pointerUpHandler, draggingItem, enteredItem, setDebug } =
  useDragQueen();
setDebug();
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
      // Wenn die Zahl im items.value der gesuchten entspricht, erhöhe nextPositive
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

window.addEventListener("pointerup", pointerUpHandler);
</script>

<template>
  <div class="grid grid-cols-2 w-full h-svh">
    <div class="buttons">
      <button
        class="w-24 border border-gray-500 bg-gray-300"
        @click="addHandler"
      >
        Add Item</button
      ><button
        class="w-32 border border-gray-500 bg-gray-300"
        @click="removeHandler"
      >
        Remove Item
      </button>
    </div>
    <div>
      <p>Dragging Item: {{ draggingItem }}</p>
      <p>Entered Item: {{ enteredItem }}</p>
    </div>
    <DropContainer>
      <DragItem
        v-for="(item, index) in items"
        :key="item"
        :item="item"
        :index="index"
      >
        <p class="pointer-events-none">Item {{ item }}</p>
      </DragItem>
    </DropContainer>

    <!--
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
  --></div>
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
