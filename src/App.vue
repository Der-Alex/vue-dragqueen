<script setup lang="ts">
import DragItem from "@/components/DragItem.vue";
import DropContainer from "@/components/DropContainer.vue";
import { useDragQueen } from "./composables/useDragQueen";

const dq = useDragQueen();

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
</script>

<template>
  <div class="w-full h-svh" @pointermove="dq.onPointerMove">
    <DropContainer>
      <DragItem />
    </DropContainer>
  </div>
</template>

<style>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease-out;
}

.list-enter-from,
.list-leave-to {
  transform: translatex(0);
}
.dq-drag-item .dq-drag-item {
  margin-left: 1.5rem;
}
</style>
