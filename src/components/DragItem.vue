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

const { pointerDownHandler, setDebug, draggingItem } = useDragQueen();

setDebug(false);

const onPointerDown = (evt: PointerEvent, item: Item) => {
  evt.stopPropagation();
  if (evt.button !== 0) {
    return;
  }
  pointerDownHandler(evt, item);
};
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
    @pointerdown="(evt: PointerEvent) => onPointerDown(evt, item)"
  >
    <div
      class="dq-element pointer-events-none w-full bg-green-200 p-2 rounded-lg border border-dashed border-green-400"
      :data-id="item.id"
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
      >
        <template v-slot="{ item: i, index: j }">
          <slot :item="i" :index="j" />
        </template>
      </DragItem>
      <GhostItem v-if="i.ghost" ref="ghost"></GhostItem>
    </template>
  </div>
</template>
