<script setup lang="ts">
import DragItem from "./components/DragItem.vue";
import { useDragQueen, type Item } from "./composables/useDragQueen";
import GhostItem from "./components/GhostItem.vue";

const { items, draggingItem, enteredItem, setDebug, ghost } = useDragQueen();
setDebug(false);

const nestedList: Item[] = [
  {
    id: 1,
    children: [],
  },
  {
    id: 2,
    children: [],
  },
  {
    id: 3,
    children: [],
  },
  {
    id: 4,
    children: [],
  },
  {
    id: 5,
    children: [],
  },
];

const nestedList2: Item[] = [
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

items.value = [...nestedList2];
</script>

<template>
  <div class="grid grid-cols-2 gap-4 p-4 w-full h-svh">
    <div>
      <div class="mb-12">
        <p>Dragging Item: {{ draggingItem?.id ?? "-" }}</p>
        <p>Entered Item: {{ enteredItem?.id ?? "-" }}</p>
      </div>
      <template v-for="(item, index) in items" :key="item.id">
        <DragItem
          v-if="!item.ghost"
          :item="item"
          :index="index"
          :transition-group-name="'list'"
          class=""
        >
          <template v-slot="{ item: item, index: index }">
            <p>Item {{ item.id }}</p>
          </template>
        </DragItem>
        <GhostItem v-if="item.ghost" :item="item" ref="ghost"></GhostItem>
      </template>
    </div>

    <div class="self-center">
      <pre class="text-xs">
        {{ items }}
      </pre>
    </div>
  </div>
</template>
