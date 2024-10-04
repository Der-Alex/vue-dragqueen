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
type ID = string | number;

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

const items = ref<Item[]>([]);
const draggingItem = ref<Item | null>(null);
const enteredItem = ref<Item | null>(null);
const lastDraggedItem = ref<Item | null>(null);
const debug = ref(false);
const lastEvent = ref<EventType>();
const dropPosition = ref<DropPosition>();

/**
 * Checks if the current dragging item is the same as the target item
 *
 * @param target The target item to compare.
 * @returns boolean True if both items are the same, otherwise false.
 */
function isSameItem(target: Item): boolean {
  if (!draggingItem.value) {
    return true;
  }

  return (
    draggingItem.value.id === enteredItem.value?.id ||
    draggingItem.value.id === target.id
  );
}

/**
 * Updates the temporary tree structure to reflect the current drag state.
 * The items array will contain the preview of the tree as it would look
 * if the dragged item were dropped at the current position.
 */
function updateTree() {
  if (!draggingItem.value || !enteredItem.value || !dropPosition.value) {
    return;
  }

  removeItemById(items.value, draggingItem.value.id);
  insertItem(
    items.value,
    enteredItem.value.id,
    draggingItem.value,
    dropPosition.value
  );
}

/**
 * Recursively searches the tree for an item by its ID.
 *
 * @function findItemById
 * @param {Item[]} tree - The tree structure to search.
 * @param {number} id - The ID of the item to search for.
 * @returns {Item | null} The item if found, otherwise null.
 */
function findItemById(tree: Item[], id: ID): Item | null {
  for (const item of tree) {
    if (item.id === id) {
      return item;
    }

    if (item.children.length > 0) {
      const found = findItemById(item.children, id);

      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Inserts a new item into the tree at a specified position relative to a target item.
 *
 * @function insertItem
 * @param {Item[]} tree - The tree structure to insert the item into.
 * @param {number} targetId - The ID of the target item to insert relative to.
 * @param {Item} newItem - The new item to insert.
 * @param {DropPosition} position - The position to insert the new item (ABOVE, BELOW, INTO).
 * @returns {boolean} True if the item was inserted successfully, false otherwise.
 */
function insertItem(
  tree: Item[],
  targetId: ID,
  newItem: Item,
  position: "ABOVE" | "BELOW" | "INTO"
): boolean {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];

    if (item.id === targetId) {
      if (position === "ABOVE") {
        tree.splice(i, 0, newItem);
      } else if (position === "BELOW") {
        tree.splice(i + 1, 0, newItem);
      } else if (position === "INTO") {
        tree[i].children.push(newItem);
      }

      return true;
    }

    if (item.children.length > 0) {
      const insertedInChildren = insertItem(
        item.children,
        targetId,
        newItem,
        position
      );
      if (insertedInChildren) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Removes an item from the tree based on its ID.
 *
 * @function removeItemById
 * @param {Item[]} tree - The tree structure to remove the item from.
 * @param {number} targetId - The ID of the item to remove.
 * @returns {boolean} True if the item was removed, false otherwise.
 */
function removeItemById(tree: Item[], targetId: ID): boolean {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];

    // Remove the item if found
    if (item.id === targetId) {
      tree.splice(i, 1);

      return true;
    }

    if (item.children.length > 0) {
      const removedFromChildren = removeItemById(item.children, targetId);
      if (removedFromChildren) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Determines the position of the mouse pointer in relation to a
 * specified HTML element during a drag leave event.
 *
 * @param {HTMLElement} enteredElement - The HTML element that the
 *                                       drag event is currently interacting with.
 * @param {DragEvent} event - The drag event object containing details
 *                            about the drag operation, including the mouse
 *                            pointer's position.
 *
 * @returns {DropPosition} - A string indicating the relative position of
 *                           the pointer with respect to the entered element:
 *                           - "ABOVE" if the pointer is above the element,
 *                           - "BELOW" if the pointer is below the element,
 *                           - "INTO" if the pointer is within the vertical
 *                             bounds of the element.
 */
function getDragLeavePosition(
  enteredElement: HTMLElement,
  event: DragEvent
): DropPosition {
  const enteredRect = enteredElement.getBoundingClientRect();
  const leavePointY = event.clientY;
  const topBoundary = enteredRect.top + 8;
  const bottomBoundary = enteredRect.bottom - 8;

  if (leavePointY < topBoundary) {
    return "ABOVE";
  } else if (leavePointY > bottomBoundary) {
    return "BELOW";
  } else {
    return "INTO";
  }
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
 *                  - {Function} dragHandler - Handles the drag event.
 *                  - {Function} dragEndHandler - Handles the end of the drag event.
 *                  - {Function} dragEnterHandler - Handles when an item is dragged into a drop zone.
 *                  - {Function} dragLeaveHandler - Handles when an item leaves a drop zone.
 *                  - {Function} dragStartHandler - Handles the start of the drag event.
 *                  - {Function} dropHandler - Handles the drop event on items.
 *                  - {Function} dropHandlerDropContainer - Handles the drop event on the drop container.
 *                  - {Function} pointerDownHandler - Handles the pointer down event for touch support.
 *                  - {Function} pointerUpHandler - Handles the pointer up event for touch support.
 *                  - {Function} setDebug - Enables debugging mode for the drag-and-drop process.
 *                  - {Function} dragOverHandler - Handles the drag over event for visual feedback.
 */
export const useDragQueen = () => {
  const backgroundColor = `rgba(${Math.floor(
    Math.random() * 255
  )}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
    Math.random() * 255
  )}, 0.3 )`;

  /**
   * A heper function for logging. When calling this function the internal debug flag is active and logs for the drag events are called.
   */
  const setDebug = () => {
    debug.value = true;
  };

  /**
   * Handles the drag start event for an item. This function sets the dragging
   * state, updates the currently dragged item, and stores the item's ID in
   * the data transfer object for the drag operation.
   *
   * @param {DragEvent} evt - The drag event object containing details about the drag operation.
   * @param {Item} item - The item that is being dragged.
   */
  const dragStartHandler = (evt: DragEvent, item: Item) => {
    evt.stopPropagation();

    if (debug.value) {
      console.log("Event DRAGSTART", draggingItem.value?.id);
    }

    draggingItem.value = item;
    evt.dataTransfer?.setData("text/plain", item.id.toString());
    updateTree();
  };

  /**
   * Handles the drag enter event for an item. This function checks if an
   * item is being dragged, determines if the entered item is valid, and
   * updates the temporary tree structure and drop position accordingly.
   *
   * @param {DragEvent} evt - The drag event object containing details about the
   *                          drag operation.
   * @param {Item} item - The item that has been entered as a drop target.
   * @param {number} index - The index of the entered item within the list.
   */
  const dragEnterHandler = (evt: DragEvent, item: Item, index: number) => {
    evt.stopPropagation();

    if (!draggingItem.value) {
      return;
    }

    if (isSameItem(item)) {
      return;
    }

    if (findItemById(draggingItem.value.children, item.id)) {
      return;
    }

    if (debug.value) {
      console.log("Event DRAGENTER", item.id, index);
    }

    lastEvent.value = "DRAGENTER";
    enteredItem.value = item;

    dropPosition.value = "INTO";
    updateTree();
  };

  /**
   * Handles the drag over event for an item. This function updates the
   * drop position based on the current mouse position and checks if the
   * dragged item is valid for the current drop target.
   *
   * @param {DragEvent} evt - The drag event object containing details about the
   *                          drag operation.
   * @param {Item} item - The item that is currently being hovered over.
   * @param {number} index - The index of the hovered item within the list.
   */
  const dragOverHandler = (evt: any, item: Item, index: number) => {
    evt.stopPropagation();

    if (!draggingItem.value || !enteredItem.value) {
      return;
    }

    if (isSameItem(item)) {
      return;
    }

    if (findItemById(draggingItem.value.children, enteredItem.value.id)) {
      return;
    }

    if (debug.value) {
      console.log("DRAGOVER");
    }

    if (
      dropPosition.value !==
      getDragLeavePosition(evt.target as HTMLElement, evt)
    ) {
      dropPosition.value = getDragLeavePosition(evt.target as HTMLElement, evt);
      updateTree();
    }
  };

  /**
   * Handles the drag leave event for an item. This function determines
   * if the dragged item is still valid as it leaves the current drop
   * target and updates the drop position accordingly.
   *
   * @param {DragEvent} evt - The drag event object containing details about the
   *                          drag operation.
   * @param {any} item - The item that is being left as a drop target.
   */
  const dragLeaveHandler = (evt: any, item: any) => {
    evt.stopPropagation();

    // We need a dragging item and at least one item we entered. Otherwise we wouldn't move
    if (!draggingItem.value || !enteredItem.value) {
      return;
    }

    if (isSameItem(item)) {
      return;
    }

    if (findItemById(draggingItem.value.children, enteredItem.value.id)) {
      return;
    }

    lastEvent.value = "DRAGLEAVE";

    if (debug.value) {
      console.log("Event DRAGLEAVE", evt, item.id);
    }

    if (evt.target.nodeName === "#text") {
      dropPosition.value = "INTO";
      return;
    }

    dropPosition.value = getDragLeavePosition(evt.target as HTMLElement, evt);
    updateTree();
  };

  /**
   * Handles the end of a drag operation. This function checks the validity of the
   * drag action, updates the item list if necessary, and resets dragging-related
   * state variables.
   *
   * @param {DragEvent} evt - The drag event object containing details about the
   *                          drag operation.
   */
  const dragEndHandler = (evt: DragEvent) => {
    evt.stopPropagation();

    if (debug.value) {
      console.log(
        "Event DRAGEND",
        draggingItem.value?.id,
        enteredItem.value?.id,
        lastDraggedItem.value?.id
      );
    }

    // We need a dragging item and at least one item we entered. Otherwise we wouldn't move
    if (!draggingItem.value || !enteredItem.value) {
      return;
    }

    if (draggingItem.value.id === enteredItem.value.id) {
      return;
    }

    if (
      draggingItem.value.children &&
      draggingItem.value.children.length > 0 &&
      enteredItem.value.id
    ) {
      const isEnteredItemChild = findItemById(
        draggingItem.value.children,
        enteredItem.value.id
      );
      if (isEnteredItemChild) {
        return;
      }
    }

    lastDraggedItem.value = draggingItem.value;
    draggingItem.value = null;
    enteredItem.value = null;
    dropPosition.value = undefined;
  };

  /**
   * Handles the drop event for a dragged item. This function resets
   * the dragging state and clears the entered item once the item is dropped.
   *
   * @param {DragEvent} evt - The drag event object containing details about the
   *                          drop operation.
   * @param {any} item - The item that was the target of the drop event.
   */

  const dropHandler = (evt: DragEvent, item: any) => {
    if (debug.value) {
      console.log("Event DROP", evt, item);
    }

    draggingItem.value = null;
    enteredItem.value = null;
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
  const pointerDownHandler = (evt: PointerEvent, item: any) => {
    if (debug.value) {
      console.log("Event POINTERDOWN", evt.type);
    }

    draggingItem.value = { ...item };
  };

  return {
    items,
    draggingItem,
    enteredItem,
    lastDraggedItem,
    dragEndHandler,
    dragEnterHandler,
    dragOverHandler,
    dragLeaveHandler,
    dragStartHandler,
    dropHandler,
    pointerDownHandler,
    setDebug,
    backgroundColor,
  };
};
