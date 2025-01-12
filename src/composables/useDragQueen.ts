/**
 * A composable function for managing drag-and-drop functionality in a Vue.js application.
 * It allows for tracking drag state, identifying items, and handling drag-related events
 * such as drag start, drag end, and item insertion into a tree-like structure.
 *
 * @module useDragQueen
 */

import { ref } from "vue";

/**
 * Represents the type of an item's ID. It is either a string or a number.
 */
export type ID = string | number;

/**
 * Represents an item in the tree structure.
 *
 * @typedef {Object} Item
 * @property {ID} id - The unique identifier of the item.
 * @property {Item[]} children - The child items of this item.
 * @property {any} [key] - Additional properties of the item.
 */
export type Item = {
  id: ID;
  children: Item[];
  [key: string]: any;
  ghost?: boolean;
};

/**
 * @typedef {"DRAGENTER" | "DRAGLEAVE"} EventType - Represents the type of drag event.
 *
 */
type EventType = "DRAGENTER" | "DRAGLEAVE";

/**
 * @typedef {"ABOVE" | "BELOW" | "INTO"} DropPosition - Represents the position where the item will be dropped.
 *
 */
type DropPosition = "ABOVE" | "BELOW" | "INTO";

let animationFrameId: number | null = null;
const items = ref<Item[]>([]);
const backupItems = ref<Item[]>([]);
const isDragging = ref(false);
const dragItems = ref<HTMLElement[]>([]);
const draggingItem = ref<Item | null>(null);
const enteredItem = ref<Item | null>(null);
const lastDraggedItem = ref<Item | null>(null);
const debug = ref(false);
const pointerX = ref<number>(0);
const pointerY = ref<number>(0);
const clickPosX = ref<number>(0);
const clickPosY = ref<number>(0);
const currentTarget = ref<any>(null);
const ghost = ref<any>(null);
const isInserted = ref(false);

const itemSize = ref<{ width: number; height: number }>({
  width: 0,
  height: 0,
});

const ghostItem: Item = {
  id: "ghost",
  children: [],
  ghost: true,
};

const removeAllGhostItems = (list: Item[]) => {
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];

    if (item.ghost && item.id === ghostItem.id) {
      list.splice(i, 1);
      continue;
    }

    if (item.children && item.children.length) {
      removeAllGhostItems(item.children);
    }
  }
};

const recursiveSplice = (
  list: Item[],
  idToFind: ID,
  itemToReplace: Item | null = null,
  deleteCount: number,
  position: DropPosition = "ABOVE"
): boolean => {
  for (let [index, item] of list.entries()) {
    if (String(item.id) === String(idToFind)) {
      if (itemToReplace !== null) {
        let realIndex =
          position === "ABOVE"
            ? index
            : position === "BELOW"
            ? index + 1
            : index - 1;
        if (position === "INTO") {
          list[realIndex].children.push(itemToReplace);
          list.splice(index, deleteCount);
        } else {
          list.splice(realIndex, deleteCount, itemToReplace);
        }
      } else {
        list.splice(index, deleteCount);
      }
      return true;
    }

    if (item.children && item.children.length > 0) {
      const found = recursiveSplice(
        item.children,
        idToFind,
        itemToReplace,
        deleteCount,
        position
      );

      if (found) {
        return found;
      }
    }
  }
  return false;
};

const recursiveFindIndex = (idtoFind: ID, list: Item[]): number => {
  for (const [index, item] of list.entries()) {
    if (String(item.id) === String(idtoFind)) {
      return index;
    }

    if (item.children && item.children.length > 0) {
      const childIndex = recursiveFindIndex(idtoFind, item.children);
      if (childIndex !== -1) {
        return childIndex;
      }
    }
  }
  return -1;
};

const pointerUpHandler = () => {
  document.body.style.userSelect = "";

  const ghostElement = document.querySelector(".dq-ghost-item") as HTMLElement;

  if (ghostElement) {
    ghostElement.style.transform = "";
  }

  if (draggingItem.value) {
    recursiveSplice(items.value, draggingItem.value.id, null, 1);

    if (isInserted.value === true) {
      recursiveSplice(items.value, ghostItem.id, draggingItem.value, 1, "INTO");
      isInserted.value = false;
    } else {
      recursiveSplice(items.value, ghostItem.id, draggingItem.value, 1);
    }
  }

  removeAllGhostItems(items.value);

  if (currentTarget.value) {
    currentTarget.value.style.top = "";
    currentTarget.value.style.left = "";
    currentTarget.value.style.width = "";
    currentTarget.value.style.height = "";
  }

  draggingItem.value = null;
  enteredItem.value = null;
  isDragging.value = false;
};

const pointerMoveHandler = (evt: PointerEvent) => {
  if (animationFrameId) {
    return;
  }

  if (!isDragging.value) {
    return;
  }

  pointerX.value = evt.clientX;
  pointerY.value = evt.clientY + window.scrollY;

  animationFrameId = requestAnimationFrame(() => {
    let x = pointerX.value - clickPosX.value;
    let y = pointerY.value - clickPosY.value;
    currentTarget.value.style.top = `${y}px`;
    currentTarget.value.style.left = `${x}px`;
    checkIntersection();
    checkInsertion();
    animationFrameId = null;
  });
};

const hasItemBefore = (list: Item[], idToFind: ID): boolean => {
  for (const [index, item] of list.entries()) {
    if (String(item.id) === String(ghostItem.id)) {
      if (index === 0) {
        return false;
      }
      if (
        !list[index - 1].id ||
        (String(list[index - 1].id) === String(ghostItem.id) &&
          index - 1 === 0) ||
        String(list[index - 1].id) === String(idToFind)
      ) {
        return false;
      }
      return true;
    }

    if (item.children && item.children.length > 0) {
      const hasItem = hasItemBefore(item.children, idToFind);

      if (hasItem) {
        return hasItem;
      }
    }
  }
  return false;
};

const checkInsertion = () => {
  if (!draggingItem.value) {
    return;
  }

  if (!currentTarget.value) {
    return;
  }
  const draggingElement = currentTarget.value.querySelector(".dq-element");

  if (!draggingElement) {
    return;
  }

  const draggingRect = draggingElement.getBoundingClientRect();

  const ghostElement = document.querySelector(".dq-ghost-item") as HTMLElement;

  if (!ghostElement) {
    return;
  }

  const ghostIndex = recursiveFindIndex(ghostItem.id, items.value);

  if (ghostIndex < 1) {
    return;
  }

  if (!hasItemBefore(items.value, draggingItem.value.id)) {
    isInserted.value === false;
    return;
  }

  const currentItemRect = ghostElement.getBoundingClientRect();

  if (
    isInserted.value === false &&
    draggingRect.top > currentItemRect.top &&
    draggingRect.top < currentItemRect.bottom &&
    draggingRect.left > currentItemRect.left + 50
  ) {
    isInserted.value = true;
    ghostElement.style.transform = "translateX(20px)";
  }

  if (
    isInserted.value === true &&
    draggingRect.top > currentItemRect.top &&
    draggingRect.top < currentItemRect.bottom &&
    draggingRect.left < currentItemRect.left - 20
  ) {
    isInserted.value = false;
    ghostElement.style.transform = "";
  }
};

const checkIntersection = () => {
  if (!draggingItem.value) {
    return;
  }

  if (!currentTarget.value) {
    return;
  }

  const draggingElement = currentTarget.value.querySelector(".dq-element");

  if (!draggingElement) {
    return;
  }

  const draggingRect = draggingElement.getBoundingClientRect();

  for (const currentItemElement of dragItems.value) {
    const currentItemRect = currentItemElement.getBoundingClientRect();

    // TODO: Check this
    if (
      currentItemElement.dataset.id === null ||
      currentItemElement.dataset.id === undefined
    ) {
      continue;
    }

    if (
      currentItemElement.dataset.id === draggingItem.value?.id ||
      currentItemElement.dataset.id === "ghost"
    ) {
      continue;
    }

    if (
      draggingRect.top > currentItemRect.top &&
      draggingRect.top < currentItemRect.bottom
    ) {
      isInserted.value = false;
      const ghostElement = document.querySelector(
        ".dq-ghost-item"
      ) as HTMLElement;
      if (ghostElement) {
        ghostElement.style.transform = "";
      }

      const half = currentItemRect.bottom - currentItemRect.height / 2;
      recursiveSplice(items.value, ghostItem.id, null, 1);

      if (draggingRect.top <= half) {
        recursiveSplice(
          items.value,
          currentItemElement.dataset.id,
          ghostItem,
          0,
          "ABOVE"
        );
      } else {
        recursiveSplice(
          items.value,
          currentItemElement.dataset.id,
          ghostItem,
          0,
          "BELOW"
        );
      }
      return;
    }
  }
};

if (document && document.body) {
  document.body.addEventListener("pointerup", pointerUpHandler);
  document.body.addEventListener("pointermove", pointerMoveHandler);
}

/**
 * A composable function that provides drag-and-drop functionality for items
 * within a Vue application. This function handles various drag events and
 * manages the state of dragging items, including their visual representation
 * and the temporary tree structure during dragging.
 *
 * @returns {Object} An object containing reactive properties and methods
 *                  for managing drag-and-drop interactions:
 *                  - {Ref<Item[]>} items - The current list of items.
 *                  - {Ref<Item|null>} draggingItem - The item currently being dragged.
 *                  - {Ref<Item|null>} enteredItem - The item currently being hovered over.
 *                  - {Ref<Item|null>} lastDraggedItem - The last item that was dragged.
 *                  - {Function} pointerDownHandler - Handles the pointer down event for touch support.
 *                  - {Function} pointerUpHandler - Handles the pointer up event for touch support.
 *                  - {Function} setDebug - Enables debugging mode for the drag-and-drop process.
 *                  - {Function} dragOverHandler - Handles the drag over event for visual feedback.
 */
export const useDragQueen = () => {
  /**
   * A heper function for logging. When calling this function the internal debug flag is active and logs for the drag events are called.
   */
  const setDebug = (activate: boolean) => {
    debug.value = activate;
  };

  /**
   * Handles the pointer down event, initializing the dragging item and
   * updating relevant state variables. This function sets the original ID
   * of the item being dragged and modifies its ID for the dragging operation.
   *
   * @param {PointerEvent} evt - The pointer event object containing details
   *                             about the pointer action.
   * @param {any} item - The item being interacted with, containing its ID
   *                     and other relevant properties.
   */
  const pointerDownHandler = (evt: PointerEvent, item: Item) => {
    backupItems.value = [...items.value];
    currentTarget.value = evt.target as HTMLElement;
    dragItems.value = [
      ...(Array.from(
        document.querySelectorAll(".dq-element")
      ) as HTMLElement[]),
    ];
    document.body.style.userSelect = "none";

    if (debug.value) {
      console.log("Event POINTERDOWN", evt.type);
    }

    const rect = currentTarget.value.getBoundingClientRect();

    draggingItem.value = JSON.parse(JSON.stringify(item));
    currentTarget.value.style.width = `${rect.width}px`;
    currentTarget.value.style.height = `${rect.height}px`;

    if (draggingItem.value) {
      recursiveSplice(items.value, draggingItem.value?.id, ghostItem, 0);
    }

    isDragging.value = true;
    itemSize.value = { width: rect.width, height: rect.height };

    clickPosX.value = evt.clientX - rect.left;
    clickPosY.value = evt.clientY - rect.top;

    pointerX.value = evt.clientX;
    pointerY.value = evt.clientY + window.scrollY;

    let x = pointerX.value - clickPosX.value;
    let y = pointerY.value - clickPosY.value;

    currentTarget.value.style.top = `${y}px`;
    currentTarget.value.style.left = `${x}px`;
  };

  return {
    draggingItem,
    enteredItem,
    items,
    lastDraggedItem,
    itemSize,
    pointerDownHandler,
    pointerMoveHandler,
    pointerUpHandler,
    setDebug,
    ghost,
  };
};
