<script setup lang="ts">
import DragItem from "@/components/DragItem.vue";
import DropContainer from "@/components/DropContainer.vue";
import { useDragQueen, type Item } from "./composables/useDragQueen";

const { items, draggingItem, enteredItem, setDebug } = useDragQueen();
setDebug();

const nestedList: Item[] = [
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
</script>

<template>
  <div class="grid grid-cols-2 gap-4 p-4 w-full h-svh">
    <div>
      <div class="mb-12">
        <p>Dragging Item: {{ draggingItem?.id ?? "-" }}</p>
        <p>Entered Item: {{ enteredItem?.id ?? "-" }}</p>
      </div>
      <DropContainer>
        <TransitionGroup name="list" mode="in-out">
          <DragItem
            v-for="(item, index) in items"
            :key="item.id"
            :item="item"
            :index="index"
          >
            <template v-slot="{ item, index }">
              <p>Item {{ item.id }}</p>
            </template>
          </DragItem>
        </TransitionGroup>
      </DropContainer>
    </div>

    <div class="self-center">
      <pre class="text-xs">
        {{ items }}
      </pre>
    </div>
  </div>
</template>

<style>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: opacity 0.25s ease-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}
</style>
