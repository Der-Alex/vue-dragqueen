<script setup lang="ts">
import { defineProps, onBeforeMount } from "vue";
import { useDragQueen, type Item } from "@/composables/useDragQueen";
import GhostItem from "./GhostItem.vue";

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
});

defineSlots<{
  default(props: { item: Item; index: number }): any;
}>();

const { pointerDownHandler, setDebug, dragItems, draggingItem } =
  useDragQueen();

setDebug(false);

const onPointerDown = (evt: MouseEvent, item: Item) => {
  evt.stopPropagation();
  if (evt.button !== 0) {
    return;
  }
  pointerDownHandler(evt, item);
};

onBeforeMount(() => {
  dragItems.value.length = 0;
});
</script>
<template>
  <div
    :id="`dq-item-${item.id}`"
    class="dq-drag-item"
    :class="[
      classes,
      {
        absolute: draggingItem?.id === item.id,
      },
    ]"
    @mousedown="(evt: MouseEvent) => onPointerDown(evt, item)"
  >
    <div
      class="dq-element pointer-events-none w-full bg-green-200 p-2 rounded-lg border border-dashed border-green-400"
    >
      <slot :item="item" :index="index" />
    </div>
    <template
      v-for="(i, j) in item.children"
      v-if="item && item.children && item.children.length > 0"
      :key="i.id"
    >
      <DragItem
        v-if="!i.ghost"
        :item="i"
        :index="j"
        :classes="classes"
        :transition-group-name="transitionGroupName"
        :ref="(el) => dragItems.push(el)"
      >
        <template v-slot="{ item: i, index: j }">
          <slot :item="i" :index="j" />
        </template>
      </DragItem>
      <GhostItem v-if="i.ghost" ref="ghost"></GhostItem>
    </template>
  </div>
</template>
