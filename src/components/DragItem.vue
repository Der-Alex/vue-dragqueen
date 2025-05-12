<script setup lang="ts">
import { defineProps } from "vue";
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
        'dq-drag-item--drag': draggingItem?.id === item.id,
      },
    ]"
    @pointerdown="(evt: PointerEvent) => onPointerDown(evt, item)"
  >
    <div class="dq-element" v-bind="$attrs" :data-id="item.id">
      <slot :item="item" :index="index">
        <p>Item {{ item.id }}</p>
      </slot>
    </div>
    <template
      v-for="(i, j) in item.children"
      v-if="item && item.children && item.children.length > 0"
      :key="i.id"
    >
      <DragItem
        v-if="!i.ghost"
        v-bind="$attrs"
        :item="i"
        :index="j"
        :classes="classes"
        :transition-group-name="transitionGroupName"
      >
        <template v-slot="{ item: i, index: j }">
          <slot :item="i" :index="j" />
        </template>
      </DragItem>
      <GhostItem v-if="i.ghost" :item="i" ref="ghost"></GhostItem>
    </template>
  </div>
</template>
