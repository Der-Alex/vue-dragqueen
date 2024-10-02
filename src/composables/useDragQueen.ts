import { ref } from "vue";

const items = ref<any[]>([]);
const dropItems = ref<any[]>([]);
const draggingItem = ref(-1);
const isDragging = ref(false);
const enteredItem = ref(-1);
const originalIndex = ref(-1);
const lastDraggedItem = ref(-1);
const isTouching = ref(-1);
const debug = ref(false);

function moveItem(tree, itemId, targetId, isChild = false) {
  let itemToMove = null;
  let parentOfItem = null;

  // Funktion zum Entfernen eines Items und seines Elternteils aus dem Baum
  function removeItem(node, parent = null) {
    for (let i = 0; i < node.length; i++) {
      if (node[i].id === itemId) {
        itemToMove = node.splice(i, 1)[0];
        parentOfItem = parent;
        return true;
      }
      if (node[i].children && removeItem(node[i].children, node[i])) {
        return true;
      }
    }
    return false;
  }

  // Funktion zum Einfügen des Items an der gewünschten Stelle
  function insertItem(node) {
    for (let i = 0; i < node.length; i++) {
      if (node[i].id === targetId) {
        if (isChild) {
          node[i].children.push(itemToMove); // Als Kind hinzufügen
        } else {
          node.splice(i, 0, itemToMove); // Als Geschwister hinzufügen
        }
        return true;
      }
      if (node[i].children && insertItem(node[i].children)) {
        return true;
      }
    }
    return false;
  }

  // Entfernen des Items
  if (!removeItem(tree)) {
    console.error("Item not found");
    return;
  }

  // Einfügen des Items
  if (!insertItem(tree)) {
    console.error("Target not found");
    return;
  }

  // Rückgabe der veränderten Baumstruktur
  return tree;
}

export const useDragQueen = () => {
  const setDebug = () => {
    debug.value = true;
  };

  const dragStartHandler = (evt: DragEvent, item: any, index: number) => {
    if (debug.value) {
      console.log("Event DRAGSTART", evt, item, draggingItem.value, index);
    }

    isDragging.value = true;
    originalIndex.value = index;
  };

  const dragEnterHandler = (evt: DragEvent, item: any, index: number) => {
    evt.preventDefault();

    if (debug.value) {
      console.log("Event DRAGENTER", evt, item);
    }

    enteredItem.value = item;

    if (
      JSON.stringify(draggingItem.value) === JSON.stringify(enteredItem.value)
    ) {
      return;
    }

    if (JSON.stringify(draggingItem.value) === JSON.stringify(item)) {
      return;
    }

    if (originalIndex.value === index) {
      return;
    }

    swap(originalIndex.value, index);
    originalIndex.value = index;
  };

  const dragLeaveHandler = (evt: DragEvent, item: any) => {
    if (debug.value) {
      console.log("Event DRAGLEAVE", evt, item);
    }
  };

  const dragEndHandler = (evt: DragEvent) => {
    if (debug.value) {
      console.log("Event DRAGEND", evt);
    }

    isDragging.value = false;
    lastDraggedItem.value = draggingItem.value;
    draggingItem.value = -1;
  };

  const dropHandler = (evt: DragEvent, item: any) => {
    if (debug.value) {
      console.log("Event DROP", evt, item);
    }

    reorder();
    draggingItem.value = -1;
    enteredItem.value = -1;
  };

  const dropHandlerDropContainer = (evt: DragEvent) => {
    evt.preventDefault();
    dropItems.value.push(lastDraggedItem.value);
  };

  const pointerDownHandler = (evt: PointerEvent, item: any) => {
    if (debug.value) {
      console.log("Event POINTERDOWN", evt.type, isTouching.value);
    }

    draggingItem.value = item;
    isTouching.value = item;

    if (debug.value) {
      console.log("touchy", isTouching.value, draggingItem.value);
    }
  };

  const pointerUpHandler = (evt: PointerEvent) => {
    if (debug.value) {
      console.log("Event POINTERUP", evt.type, isTouching.value);
    }

    isTouching.value = -1;

    if (debug.value) {
      console.log("touchy", isTouching.value);
    }
  };

  const reorder = () => {
    if (debug.value) {
      console.log("reordering");
    }

    if (
      JSON.stringify(draggingItem.value) === JSON.stringify(enteredItem.value)
    ) {
      return;
    }

    const indexToMove = items.value.indexOf(draggingItem.value);
    let indexToPlace = items.value.indexOf(enteredItem.value);
    items.value.splice(indexToMove, 1);

    if (indexToPlace > items.value.length) {
      indexToPlace--;
    }

    items.value.splice(indexToPlace, 0, draggingItem.value);

    if (debug.value) {
      console.log("reordered", items);
    }
  };
  const swap = (index1: number, index2: number) => {
    if (debug.value) {
      console.log(`swapping ${index1} and ${index2}`);
    }

    const temp = items.value[index1];
    items.value[index1] = items.value[index2];
    items.value[index2] = temp;

    if (debug.value) {
      console.log(items.value);
    }
  };

  return {
    items,
    dropItems,
    draggingItem,
    isDragging,
    enteredItem,
    lastDraggedItem,
    originalIndex,
    isTouching,
    dragEndHandler,
    dragEnterHandler,
    dragLeaveHandler,
    dragStartHandler,
    dropHandler,
    dropHandlerDropContainer,
    pointerDownHandler,
    pointerUpHandler,
    reorder,
    swap,
    setDebug,
  };
};
