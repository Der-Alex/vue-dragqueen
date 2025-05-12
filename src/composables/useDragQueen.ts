/**
 * A composable function for managing drag-and-drop functionality in a Vue.js application.
 * It allows for tracking drag state, identifying items, and handling drag-related events
 * such as drag start, drag end, and item insertion into a tree-like structure.
 *
 * @module useDragQueen
 */

import { ref, onUnmounted } from "vue";

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
 * @property {boolean} [ghost] - Indicates if the item is a ghost (optional).
 * @property {any} [key] - Additional properties of the item.
 */
export type Item = {
  id: ID;
  children: Item[];
  [key: string]: any;
  ghost?: boolean;
};

/**
 * Defines possible drop positions when inserting or moving an item.
 *
 * @typedef {'ABOVE' | 'BELOW' | 'INTO'} DropPosition
 */
type DropPosition = "ABOVE" | "BELOW" | "INTO";

let animationFrameId: number | null = null;
const items = ref<Item[]>([]);
const flatItems = ref<Map<string, Item>>();
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

const oldItem: Item = {
  id: "oldItem",
  children: [],
  ghost: true,
};

/**
 * Recursively removes all ghost items from a nested list.
 *
 * @param {Item[]} list - The list of items to process.
 *
 * @returns {void}
 *
 * @description
 * - Iterates through the list in reverse order to safely remove ghost items.
 * - Checks if an item is a ghost and matches the `ghostItem.id`, then removes it.
 * - Recursively processes child items to ensure all ghost items are removed.
 */
const removeAllGhostItems = (list: Item[]) => {
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];

    if (item.ghost) {
      list.splice(i, 1);
      continue;
    }

    if (item.children && item.children.length) {
      removeAllGhostItems(item.children);
    }
  }
};

/**
 * Recursively splices an item within a nested list based on the given ID.
 *
 * @param {Item[]} list - The list of items to modify.
 * @param {ID} idToFind - The ID of the item to locate.
 * @param {Item | null} [itemToReplace=null] - The item to replace the found item with, or `null` to remove it.
 * @param {number} deleteCount - The number of items to delete at the found position.
 * @param {DropPosition} [position='ABOVE'] - The position where the item should be inserted ('ABOVE', 'BELOW', 'INTO').
 * @returns {boolean} - Returns `true` if the item was found and modified, otherwise `false`.
 *
 * @description
 * - Iterates through the list to find the item matching `idToFind`.
 * - If found, determines the correct index based on the `position` parameter.
 * - If `position` is 'INTO', the new item is pushed into the found item's children.
 * - Otherwise, the item is replaced or removed using `splice()`.
 * - Recursively searches within child items if the item is not found at the top level.
 */
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
          //list[realIndex].children.push(itemToReplace);
          if (idToFind === "ghost") {
            list[realIndex].children.unshift(itemToReplace);
          } else {
            item.children.unshift(itemToReplace);
          }
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

/**
 * Recursively finds the index of an item with the specified ID in a nested list.
 *
 * @param {ID} idToFind - The ID of the item to search for.
 * @param {Item[]} list - The list of items to search within.
 *
 * @returns {number} - The index of the item if found, otherwise `-1`.
 *
 * @description
 * - Iterates through the list and checks if the current item's ID matches `idToFind`.
 * - If a match is found, returns the current index.
 * - If the item has children, recursively searches within them.
 * - Returns `-1` if the item is not found in the list or any of its child lists.
 */
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

const flattenItemsToMap = (list: Item[]): Map<string, Item> => {
  const map = new Map<string, Item>();

  const traverse = (items: Item[]) => {
    for (const item of items) {
      map.set(String(item.id), item);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  };

  traverse(list);
  return map;
};

/**
 * Handles the pointer down event on a draggable item.
 *
 * @param {PointerEvent} evt - The pointer event triggered by user interaction.
 * @param {Item} item - The item associated with the event.
 *
 * @returns {void}
 *
 * @description
 * - Backs up the current state of items before making changes.
 * - Stores the event target as the current drag target.
 * - Disables text selection while dragging.
 * - Logs the event if debugging is enabled.
 * - Calculates and sets the dimensions of the dragged item.
 * - Inserts a ghost item in place of the dragged item.
 * - Updates the dragging state and stores the item's dimensions.
 * - Records the initial click position relative to the item.
 * - Positions the dragged element based on pointer coordinates.
 */
const pointerDownHandler = (evt: PointerEvent, item: Item) => {
  if (!window || !document || !document.body) {
    // TODO: check how to deal with stuff like that
    return;
  }

  flatItems.value = flattenItemsToMap(items.value);

  currentTarget.value = evt.target as HTMLElement;
  dragItems.value = [
    ...(Array.from(document.querySelectorAll(".dq-element")) as HTMLElement[]),
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
    recursiveSplice(items.value, draggingItem.value?.id, oldItem, 0);
  }

  isDragging.value = true;
  itemSize.value = { width: rect.width, height: rect.height };

  clickPosX.value = evt.clientX - rect.left;
  clickPosY.value = evt.clientY - rect.top;

  pointerX.value = evt.clientX;
  pointerY.value = evt.clientY + window.scrollY;

  const computedStyle = window.getComputedStyle(currentTarget.value);
  const marginLeft = parseFloat(computedStyle.marginLeft) || 0;
  const marginTop = parseFloat(computedStyle.marginTop) || 0;

  let x = pointerX.value - clickPosX.value - marginLeft;
  let y = pointerY.value - clickPosY.value - marginTop;

  currentTarget.value.style.top = `${y}px`;
  currentTarget.value.style.left = `${x}px`;
};

/**
 * Handles the pointer move event while dragging an item.
 *
 * @param {PointerEvent} evt - The pointer event triggered by user movement.
 *
 * @returns {void}
 *
 * @description
 * - Ensures the document and window are available before proceeding.
 * - Prevents redundant execution if an animation frame is already scheduled.
 * - Exits early if no dragging action is active.
 * - Updates pointer coordinates with the current event position.
 * - Uses `requestAnimationFrame` to optimize performance.
 * - Calculates the new position of the dragged item and updates its style.
 * - Calls `checkIntersection` and `checkInsertion` to manage drag interactions.
 */
const pointerMoveHandler = (evt: PointerEvent) => {
  if (!window || !document || !document.body) {
    // TODO: check how to deal with stuff like that
    return;
  }

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

/**
 * Handles the pointer up event, finalizing the drag operation.
 *
 * @returns {void}
 *
 * @description
 * - Ensures the document and window are available before proceeding.
 * - Restores the default `userSelect` behavior for the document body.
 * - Resets the transformation of the ghost element if it exists.
 * - Removes the ghost item and places the dragged item at its final position.
 * - Handles insertion logic based on whether the item was inserted into another.
 * - Cleans up ghost items from the item list.
 * - Resets styles of the dragged element to remove positioning constraints.
 * - Clears relevant state variables to indicate the drag operation is complete.
 */
const pointerUpHandler = () => {
  if (!window || !document || !document.body) {
    // TODO: check how to deal with stuff like that
    return;
  }

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

/**
 * Determines whether there is a valid item before the specified item in the list.
 *
 * @param {Item[]} list - The list of items to search within.
 * @param {ID} idToFind - The ID of the item to check for a preceding item.
 *
 * @returns {boolean} - Returns `true` if there is a valid item before the specified item, otherwise `false`.
 *
 * @description
 * - Iterates through the list to locate the ghost item.
 * - If the ghost item is the first element, returns `false`.
 * - Checks if the preceding item is valid and not another ghost item.
 * - Recursively checks within child elements for nested structures.
 * - Ensures that the function returns `true` only if a valid preceding item exists.
 */
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

/**
 * Checks if the dragged item should be inserted at the ghost item's position.
 *
 * @returns {void}
 *
 * @description
 * - Ensures the dragging item, current target, and ghost element exist before proceeding.
 * - Retrieves the bounding rectangle of the dragged element and ghost element.
 * - Finds the index of the ghost item within the item list.
 * - Returns early if the ghost item is at an invalid position.
 * - Verifies whether an item exists before the dragged item in the structure.
 * - Checks if the dragged item is within the ghost item’s vertical bounds.
 * - Adjusts the ghost item's position visually if an insertion condition is met.
 * - Toggles the insertion state and updates the ghost element’s transform style accordingly.
 */
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
    isInserted.value = false;
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

/**
 * Checks for intersections between the dragging item and other elements.
 *
 * @returns {void}
 *
 * @description
 * - Ensures a dragging item and a current target exist before proceeding.
 * - Retrieves the `.dq-element` inside the current drag target.
 * - Iterates through draggable elements to check for intersection.
 * - Skips elements without a valid dataset ID or those matching the dragged item or ghost.
 * - Determines whether the dragged item intersects with another item.
 * - If an intersection is detected, resets insertion state and removes ghost styling.
 * - Calculates the midpoint of the target item to determine whether to insert above or below.
 * - Calls `recursiveSplice` to insert the ghost item accordingly.
 */
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
      console.log("nulldefined");
      continue;
    }

    if (
      currentItemElement.dataset.id === draggingItem.value?.id ||
      currentItemElement.dataset.id === "ghost" ||
      currentItemElement.dataset.id === "oldItem"
    ) {
      console.log("bad item", currentItemElement.dataset.id);

      continue;
    }

    if (
      draggingRect.top > currentItemRect.top &&
      draggingRect.top < currentItemRect.bottom
    ) {
      console.log("YUP");
      enteredItem.value =
        (flatItems.value?.get(currentItemElement.dataset.id) as Item | null) ||
        null;

      isInserted.value = false;
      removeAllGhostItems(items.value);
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
        if (enteredItem.value && enteredItem.value.children.length > 0) {
          recursiveSplice(
            items.value,
            currentItemElement.dataset.id,
            ghostItem,
            0,
            "INTO"
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
      }
      return;
    }

    if (!flatItems.value) return;

    let lastItemId = Array.from(flatItems.value.values()).pop()?.id;

    if (currentItemElement.dataset.id === String(lastItemId)) {
      console.log("ASDASD", lastItemId);

      const lastItem = dragItems.value.find(
        (item) => item.dataset.id === String(lastItemId)
      );

      if (!lastItem) {
        console.log("no last item");
        return;
      }
      if (!lastItem.parentElement) {
        console.log("no parent");
        return;
      }

      if (
        draggingRect.top > lastItem.parentElement.getBoundingClientRect().bottom
      ) {
        console.log("now we here");
        removeAllGhostItems(items.value);

        const idToFind = items.value[items.value.length - 1].id;

        isInserted.value = false;
        const ghostElement = document.querySelector(
          ".dq-ghost-item"
        ) as HTMLElement;
        if (ghostElement) {
          ghostElement.style.transform = "";
        }

        recursiveSplice(items.value, String(idToFind), ghostItem, 0, "BELOW");
      }
      return;
    }
  }
};

if (window) {
  window.addEventListener("pointerup", pointerUpHandler);
  window.addEventListener("pointermove", pointerMoveHandler);
}

onUnmounted(() => {
  if (window) {
    window.removeEventListener("pointerup", pointerMoveHandler);
    window.removeEventListener("pointermove", pointerMoveHandler);
  }
});

/**
 * Provides drag-and-drop functionality for handling tree-structured items.
 *
 * @returns {Object} The composable's reactive state and event handlers.
 *
 * @property {Ref<Item | null>} draggingItem - The item currently being dragged.
 * @property {Ref<Item | null>} enteredItem - The item currently being hovered over.
 * @property {Ref<Item[]>} items - The list of draggable items.
 * @property {Ref<Item | null>} lastDraggedItem - The last dragged item.
 * @property {Ref<{ width: number, height: number }>} itemSize - The dimensions of the dragged item.
 * @property {Function} pointerDownHandler - Handles the pointer down event to initiate dragging.
 * @property {Function} pointerMoveHandler - Handles pointer movement while dragging.
 * @property {Function} pointerUpHandler - Handles pointer release to finalize dragging.
 * @property {Function} setDebug - Enables or disables debugging mode.
 * @property {Ref<boolean>} ghost - Indicates if a ghost item is currently active.
 */
export const useDragQueen = () => {
  /**
   * A helper function for logging.
   * When calling this function the internal debug flag is active and logs the drag events that are called.
   *
   * @returns {void}
   */
  const setDebug = (activate: boolean) => {
    debug.value = activate;
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
