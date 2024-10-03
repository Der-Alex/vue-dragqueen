<script setup lang="ts">
import DragItem from "@/components/DragItem.vue";
import DropContainer from "@/components/DropContainer.vue";
import { useDragQueen } from "./composables/useDragQueen";
import { computed, onMounted, ref } from "vue";

const {
  items,
  draggingItem,
  enteredItem,
  tempItems,
  pointerUpHandler,
  setDebug,
} = useDragQueen();
setDebug();

const isDragging = ref(false);

const nestedList = [
  {
    id: 1,
    children: [
      {
        id: 11,
        children: [],
      },
      {
        id: 12,
        children: [
          {
            id: 121,
            children: [],
          },
          {
            id: 122,
            children: [],
          },
        ],
      },
      {
        id: 13,
        children: [],
      },
    ],
  },
  {
    id: 2,
    children: [
      {
        id: 21,
        children: [],
      },
      {
        id: 22,
        children: [],
      },
    ],
  },
];

items.value = [...nestedList];

onMounted(() => (tempItems.value = items.value));

const treeToRender = computed(() => {
  //return isDragging.value ? tempItems.value : items.value;
  return tempItems.value;
});

const isDraggingHandler = (dragging: boolean) => {
  console.log("DRAGGING", dragging);
  isDragging.value = dragging;
};

window.addEventListener("pointerup", pointerUpHandler);
</script>

<template>
  <div class="grid grid-cols-2 w-full h-svh">
    <div>
      <div class="mb-12">
        <p>Dragging Item: {{ draggingItem?.id ?? "-" }}</p>
        <p>Entered Item: {{ enteredItem?.id ?? "-" }}</p>
      </div>
      <DropContainer>
        <DragItem
          v-for="(item, index) in treeToRender"
          :key="item.id"
          :item="item"
          :index="index"
          @is-dragging="isDraggingHandler"
        >
          <p class="pointer-events-none">Item {{ item.id }}</p>
        </DragItem>
      </DropContainer>
    </div>

    <div>
      <pre>
        {{ tempItems }}
      </pre>
    </div>
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
