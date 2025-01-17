<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
const items = [
  { id: "1" },
  { id: "2" },
  { id: "3" },
  { id: "4" },
  { id: "5" },
  { id: "6" },
];
const currentItem = ref<any>(null);
const ghostItem = ref<HTMLElement | null>(null);

const initialData = {
  mouseX: 0,
  mouseY: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  posX: 0,
  posY: 0,
};

const currentItemData = reactive({ ...initialData });

let animationFrameId: number | null = null;

const onMouseDown = (evt: MouseEvent, item: any) => {
  if (evt.button !== 0) {
    return;
  }
  currentItem.value = item;
  currentItemData.mouseX = evt.clientX;
  currentItemData.mouseY = evt.clientY;
  const rect = (evt.target as HTMLElement).getBoundingClientRect();
  currentItemData.top = rect.top;
  currentItemData.right = rect.right;
  currentItemData.bottom = rect.bottom;
  currentItemData.left = rect.left;
  currentItemData.height = rect.height;
  currentItemData.width = rect.width;

  nextTick(() => {
    if (!ghostItem.value) {
      return;
    }
    ghostItem.value.style.position = "fixed";
    ghostItem.value.style.top = `${currentItemData.top}px`;
    ghostItem.value.style.right = `${currentItemData.right}px`;
    ghostItem.value.style.bottom = `${currentItemData.bottom}px`;
    ghostItem.value.style.left = `${currentItemData.left}px`;
    ghostItem.value.style.width = `${currentItemData.width}px`;
    ghostItem.value.style.height = `${currentItemData.height}px`;
    ghostItem.value.style.translate = `0px 0px`;
  });
};

const onMouseMove = (evt: MouseEvent) => {
  if (animationFrameId) {
    return;
  }

  if (!ghostItem.value) {
    return;
  }

  let posX = Math.abs(evt.clientX - currentItemData.mouseX);
  let posY = Math.abs(evt.clientY - currentItemData.mouseY);

  if (evt.clientX < currentItemData.mouseX) {
    posX *= -1;
  }

  if (evt.clientY < currentItemData.mouseY) {
    posY *= -1;
  }

  const items = document.querySelectorAll(
    ".item:not(.item--ghost)"
  ) as NodeListOf<HTMLElement>;
  const currentGhost = document.querySelector(
    ".item--ghost"
  ) as HTMLElement | null;

  animationFrameId = requestAnimationFrame(() => {
    if (!ghostItem.value) {
      animationFrameId = null;
      return;
    }

    if (!currentGhost) {
      animationFrameId = null;
      return;
    }

    ghostItem.value.style.translate = `${posX}px ${posY}px`;

    for (const item of items) {
      const rect = item.getBoundingClientRect();
      const ghostRect = ghostItem.value.getBoundingClientRect();

      // move rect down
      if (
        rect.top < ghostRect.top &&
        rect.bottom - rect.height / 2 > ghostRect.top
      ) {
        item.style.translate = `0px ${ghostRect.height}px`;
        currentItemData.posY -= rect.height;
        currentGhost.style.translate = `0px ${currentItemData.posY}px`;
      }

      // move rect up
      if (
        rect.bottom > ghostRect.bottom &&
        rect.top + rect.height / 2 < ghostRect.bottom
      ) {
        item.style.translate = `0px 0`;
        currentItemData.posY += rect.height;
        currentGhost.style.translate = `0px ${currentItemData.posY}px`;
      }
    }

    animationFrameId = null;
  });
};
const onMouseUp = (evt: MouseEvent) => {
  const item = document.querySelector(".item--ghost") as HTMLElement | null;

  currentItemData.mouseX = 0;
  currentItemData.mouseY = 0;
  currentItemData.top = 0;
  currentItemData.right = 0;
  currentItemData.bottom = 0;
  currentItemData.left = 0;
  currentItemData.height = 0;
  currentItemData.width = 0;
  currentItemData.posX = 0;
  currentItemData.posY = 0;

  if (!item) {
    ghostItem.value = null;
    return;
  }

  if (!ghostItem.value) {
    return;
  }
  item.style.translate = ghostItem.value.style.translate;
  currentItem.value = null;

  setTimeout(() => {
    item.style.transition = `translate 150ms ease-out`;
    item.style.translate = "0px 0px";
    ghostItem.value = null;
  }, 1);

  setTimeout(() => {
    item.style.transition = ``;
    item.style.translate = "";
  }, 151);
};

onMounted(() => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
});
</script>

<template>
  <div class="grid grid-cols-2 gap-4 p-4 w-full h-svh">
    <div class="bg-green-100">
      <template v-for="item of items" :key="item.id">
        <div
          class="item border border-dashed border-green-400 rounded-lg p-2"
          :class="
            currentItem && currentItem.id === item.id
              ? 'item--ghost'
              : 'bg-green-300'
          "
          @mousedown.prevent="(evt) => onMouseDown(evt, item)"
        >
          {{ item.id }}
        </div>
      </template>
    </div>
  </div>
  <div
    class="item bg-blue-300 border border-dashed border-blue-400 rounded-lg p-2"
    ref="ghostItem"
    v-if="currentItem !== null"
  >
    {{ currentItem.id }}
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
