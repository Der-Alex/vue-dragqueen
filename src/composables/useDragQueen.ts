import { ref } from "vue";
export const useDragQueen = () => {
  const items = ref<any[]>([]);
  const dropItems = ref<any[]>([]);
  const draggingItem = ref(-1);
  const isDragging = ref(false);
  const enteredItem = ref(-1);
  const originalIndex = ref(-1);
  const lastDraggedItem = ref(-1);
  const isTouching = ref(-1);
  const debug = ref(false);

  const setDebug = () => {
    debug.value = true;
  };

  const dragStartHandler = (evt: DragEvent, item: any, index: number) => {
    if (debug.value) {
      console.log("Event DRAGSTART", evt, item);
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

    if (draggingItem.value === enteredItem.value) {
      return;
    }

    if (draggingItem.value === item) {
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

  //   const dragEndHandler = (evt: DragEvent) => {
  //     evt.preventDefault();
  //     console.log("Event DRAGEND", evt.type);
  //   };

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
      console.log("touchy", isTouching.value);
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
    if (draggingItem.value === enteredItem.value) {
      return;
    }

    const indexToMove = items.value.indexOf(draggingItem.value);
    let indexToPlace = items.value.indexOf(enteredItem.value);
    items.value.splice(indexToMove, 1);

    if (indexToPlace > items.value.length) {
      indexToPlace--;
    }

    items.value.splice(indexToPlace, 0, draggingItem.value);
  };
  const swap = (index1: number, index2: number) => {
    const temp = items.value[index1];
    items.value[index1] = items.value[index2];
    items.value[index2] = temp;
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
