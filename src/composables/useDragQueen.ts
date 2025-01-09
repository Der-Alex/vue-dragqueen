/**
 * A composable function for managing drag-and-drop functionality in a Vue.js application.
 * It allows for tracking drag state, identifying items, and handling drag-related events
 * such as drag start, drag end, and item insertion into a tree-like structure.
 *
 * @module useDragQueen
 */

import { ref, computed } from "vue";

export const useDragQueen = () => {
  const isDragging = ref(false);
  const dragItem = ref(null);
  const classList = ref<string[]>([]);
  const pointerX = ref<number>(0);
  const pointerY = ref<number>(0);

  const itemData = computed(() => {
    if (!dragItem.value) {
      return "";
    }

    const rect = (dragItem.value as HTMLElement).getBoundingClientRect();
    return `t: ${rect.top}px | l: ${rect.left}px`;
  });

  const onPointerDown = (evt: PointerEvent) => {
    isDragging.value = true;
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
    if (!classList.value.includes("absolute")) {
      classList.value.push("absolute");
    }
    console.log(evt.clientX, evt.clientY);
    pointerX.value = evt.clientX;
    pointerY.value = evt.clientY;
  };

  const moveStyles = () => {
    if (!isDragging.value) {
      return "";
    }
    if (!dragItem.value) {
      return "";
    }
    let x = pointerX.value - 10;
    let y = pointerY.value - 10;
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    return `top: ${y}px; left: ${x}px;`;
  };
  return {
    classList,
    dragItem,
    isDragging,
    itemData,
    moveStyles,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    pointerX,
    pointerY,
  };
};
