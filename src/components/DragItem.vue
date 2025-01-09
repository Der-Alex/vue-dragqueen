<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, onMounted } from "vue";
import GhostItem from "./GhostItem.vue";

defineProps({});
defineEmits([]);
const dragItem = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const classList = ref<string[]>([]);
const pointerX = ref<number>(0);
const pointerY = ref<number>(0);
const clickPosX = ref<number>(0);
const clickPosY = ref<number>(0);
const itemSize = ref<{ width: number; height: number }>({
  width: 0,
  height: 0,
});

const body = ref<HTMLElement | null>(null);

const itemData = computed(() => {
  if (!dragItem.value) {
    return "";
  }

  return `t: ${pointerX.value}px | l: ${pointerY.value}px`;
});

const onPointerDown = (evt: PointerEvent) => {
  if (!body.value) {
    return false;
  }

  isDragging.value = true;
  const target = evt.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  itemSize.value = { width: rect.width, height: rect.height };
  clickPosX.value = evt.clientX - rect.left;
  clickPosY.value = evt.clientY - rect.top;

  const bodyRect = body.value.getBoundingClientRect();
  const scrollTopPos = body.value.scrollTop;

  pointerX.value = evt.clientX;
  pointerY.value = evt.clientY - bodyRect.top + scrollTopPos;

  if (!classList.value.includes("absolute")) {
    classList.value.push("absolute");
  }
};

const onPointerUp = (evt: PointerEvent) => {
  isDragging.value = false;
  const index = classList.value.indexOf("absolute");
  classList.value.splice(index, 1);

  if (!dragItem.value) {
    return false;
  }
};

const onPointerMove = (evt: PointerEvent) => {
  if (!isDragging.value) {
    return false;
  }

  if (!body.value) {
    return false;
  }

  const bodyRect = body.value.getBoundingClientRect();
  const scrollTopPos = body.value.scrollTop;

  pointerX.value = evt.clientX;
  pointerY.value = evt.clientY - bodyRect.top + scrollTopPos;
};

const moveStyles = () => {
  if (!isDragging.value) {
    return "";
  }
  if (!dragItem.value) {
    return "";
  }
  let x = pointerX.value - clickPosX.value;
  let y = pointerY.value - clickPosY.value;
  if (x < 0) {
    x = 0;
  }
  if (y < 0) {
    y = 0;
  }
  return `top: ${y}px; left: ${x}px;`;
};

onMounted(() => {
  body.value = document.body;
  //body.addEventListener('scroll', onScroll);
  body.value.addEventListener("pointermove", onPointerMove);
  body.value.addEventListener("pointerup", onPointerUp);
});
</script>
<template>
  <div
    class="dq-drag-item p-2 border border-dashed bg-green-300 border-green-400 rounded-lg w-max cursor-grab min-w-32 flex justify-center"
    :class="[...classList, { 'cursor-grabbing': isDragging }]"
    :style="moveStyles()"
    @pointerdown.prevent="onPointerDown"
    @pointerup.prevent="onPointerUp"
    ref="dragItem"
  >
    <div class="pointer-events-none">
      <slot />
    </div>
  </div>
  <GhostItem v-if="isDragging" :size="itemSize" />
</template>
