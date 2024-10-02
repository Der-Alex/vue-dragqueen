import { ref } from "vue";

interface Item {
  id: number;
  children: Item[];
}

const items = ref<Item[]>([]);
const dropItems = ref<Item[]>([]);
const draggingItem = ref<Item | null>(null);
const originalId = ref(-1);
const isDragging = ref(false);
const enteredItem = ref<Item | null>(null);
const originalIndex = ref(-1);
const lastDraggedItem = ref<Item | null>(null);
const isTouching = ref<Item | null>(null);
const debug = ref(false);
const draggingElement = ref<HTMLElement>();
const lastEvent = ref<"DRAGENTER" | "DRAGLEAVE" | "">("");
const lastPosition = ref<"above" | "below" | "into" | "">("");

function findItemById(tree: Item[], id: number): Item | null {
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

function insertItem(
  tree: Item[],
  targetId: number,
  newItem: Item,
  position: "above" | "below" | "into"
): boolean {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];

    if (item.id === targetId) {
      if (position === "above") {
        tree.splice(i, 0, newItem); // Insert before the target item
      } else if (position === "below") {
        tree.splice(i + 1, 0, newItem); // Insert after the target item
      } else if (position === "into") {
        tree[i].children.push(newItem);
      }
      return true; // Item inserted
    }

    // Recursively search in children
    if (item.children.length > 0) {
      const insertedInChildren = insertItem(
        item.children,
        targetId,
        newItem,
        position
      );
      if (insertedInChildren) {
        return true; // Item inserted in children
      }
    }
  }

  return false; // Target item not found
}

function removeItemById(tree: Item[], targetId: number): boolean {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];

    // Prüfen, ob das aktuelle Item die Ziel-ID hat
    if (item.id === targetId) {
      tree.splice(i, 1); // Entfernt das Item aus dem Array
      return true; // Item wurde entfernt
    }

    // Rekursiv in den Kindern weitersuchen
    if (item.children.length > 0) {
      const removedFromChildren = removeItemById(item.children, targetId);
      if (removedFromChildren) {
        return true; // Item wurde in den Kindern entfernt
      }
    }
  }

  return false; // Ziel-Item nicht gefunden
}

function getDragLeavePosition(
  draggingElement: HTMLElement,
  enteredElement: HTMLElement,
  event: DragEvent
): "above" | "below" | "into" {
  const enteredRect = enteredElement.getBoundingClientRect();
  const draggingRect = draggingElement.getBoundingClientRect();

  // Verlassen auf Basis der Y-Positionen prüfen
  const leavePointY = event.clientY;

  // Bestimmen der Mittellinie des enteredElement
  const middleY = enteredRect.top + enteredRect.height / 2;

  // Prüfen ob das draggingElement oberhalb oder unterhalb verlassen hat
  if (leavePointY < middleY - enteredRect.height / 4) {
    return "above";
  } else if (leavePointY > middleY + enteredRect.height / 4) {
    return "below";
  } else {
    return "into";
  }
}

export const useDragQueen = () => {
  const setDebug = () => {
    debug.value = true;
  };

  const dragHandler = (evt: DragEvent) => {
    evt.stopPropagation();
    console.log(evt);
  };

  const dragStartHandler = (evt: DragEvent, item: any, index: number) => {
    evt.stopPropagation();
    if (debug.value) {
      console.log("Event DRAGSTART", draggingItem.value?.id);
    }

    isDragging.value = true;
    originalIndex.value = index;
  };

  const dragEnterHandler = (evt: DragEvent, item: Item, index: number) => {
    evt.stopPropagation();

    lastEvent.value = "DRAGENTER";

    if (debug.value) {
      console.log("Event DRAGENTER", item.id, index);
    }

    enteredItem.value = item;

    if (draggingItem.value?.id === enteredItem.value?.id) {
      return;
    }

    if (draggingItem.value?.id === item.id) {
      return;
    }

    if (originalIndex.value === index) {
      return;
    }

    lastPosition.value = "into";
  };

  const dragLeaveHandler = (evt: any, item: any) => {
    evt.stopPropagation();
    lastEvent.value = "DRAGLEAVE";
    if (debug.value) {
      console.log("Event DRAGLEAVE", evt, item.id);
    }

    if (evt.target.nodeName === "#text") {
      lastPosition.value = "into";
      return;
    }

    lastPosition.value = getDragLeavePosition(
      draggingElement.value as HTMLElement,
      evt.target as HTMLElement,
      evt
    );
  };

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

    if (
      draggingItem.value?.id === enteredItem.value?.id ||
      (draggingItem.value?.id as number) - 99999999 === enteredItem.value?.id
    ) {
      return;
    }

    if (
      draggingItem.value?.children &&
      draggingItem.value.children.length > 0 &&
      enteredItem.value?.id
    ) {
      const isEnteredItemChild = findItemById(
        draggingItem.value.children,
        enteredItem.value.id
      );
      if (isEnteredItemChild) {
        return;
      }
    }

    if (draggingItem.value && enteredItem.value) {
      console.log("insert before", draggingItem.value.id, enteredItem.value.id);
      insertItem(
        items.value,
        enteredItem.value.id,
        draggingItem.value,
        lastPosition.value as "above" | "below" | "into"
      );
      removeItemById(items.value, originalId.value);
      draggingItem.value.id = originalId.value;
    }

    isDragging.value = false;
    lastDraggedItem.value = draggingItem.value;
    draggingItem.value = null;
  };

  const dropHandler = (evt: DragEvent, item: any) => {
    if (debug.value) {
      console.log("Event DROP", evt, item);
    }

    //reorder();
    draggingItem.value = null;
    enteredItem.value = null;
  };

  const dropHandlerDropContainer = (evt: DragEvent) => {
    evt.preventDefault();
    if (lastDraggedItem.value) {
      dropItems.value.push(lastDraggedItem.value);
    }
  };

  const pointerDownHandler = (evt: PointerEvent, item: any) => {
    if (debug.value) {
      console.log("Event POINTERDOWN", evt.type, isTouching.value);
    }

    draggingElement.value = evt.target as HTMLElement;

    originalId.value = item.id;
    draggingItem.value = { ...item };
    isTouching.value = item;

    if (draggingItem.value) {
      draggingItem.value.id += 99999999;
    }

    if (debug.value) {
      console.log("touchy", isTouching.value, draggingItem.value);
    }
  };

  const pointerUpHandler = (evt: PointerEvent) => {
    if (debug.value) {
      console.log("Event POINTERUP", evt.type, isTouching.value);
    }

    isTouching.value = null;

    if (debug.value) {
      console.log("touchy", isTouching.value);
    }
  };

  // const reorder = () => {
  //   if (debug.value) {
  //     console.log("reordering");
  //   }

  //   if (
  //     JSON.stringify(draggingItem.value) === JSON.stringify(enteredItem.value)
  //   ) {
  //     return;
  //   }

  //   const indexToMove = items.value.indexOf(draggingItem.value);
  //   let indexToPlace = items.value.indexOf(enteredItem.value);
  //   items.value.splice(indexToMove, 1);

  //   if (indexToPlace > items.value.length) {
  //     indexToPlace--;
  //   }

  //   items.value.splice(indexToPlace, 0, draggingItem.value);

  //   if (debug.value) {
  //     console.log("reordered", items);
  //   }
  // };
  // const swap = (index1: number, index2: number) => {
  //   if (debug.value) {
  //     console.log(`swapping ${index1} and ${index2}`);
  //   }

  //   const temp = items.value[index1];
  //   items.value[index1] = items.value[index2];
  //   items.value[index2] = temp;

  //   if (debug.value) {
  //     console.log(items.value);
  //   }
  // };

  return {
    items,
    dropItems,
    draggingItem,
    isDragging,
    enteredItem,
    lastDraggedItem,
    originalIndex,
    isTouching,
    dragHandler,

    dragEndHandler,
    dragEnterHandler,
    dragLeaveHandler,
    dragStartHandler,
    dropHandler,
    dropHandlerDropContainer,
    pointerDownHandler,
    pointerUpHandler,
    setDebug,
  };
};
