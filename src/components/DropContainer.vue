<script setup lang="ts">
const dropHandler = (evt: DragEvent) => {
  evt.preventDefault();
  //console.log("Event DROP", evt.type);
};
const dragEnterHandler = (evt: DragEvent) => {
  evt.preventDefault();
  //console.log("Event DRAGENTER", evt.type);
};
const dragOverHandler = (evt: DragEvent) => {
  evt.preventDefault();
  //console.log("Event DRAGOVER", evt.type);
};
const dragLeaveHandler = (evt: DragEvent) => {
  evt.preventDefault();
  //console.log("Event DRAGLEAVE", evt.type);
};
const dragExitHandler = (evt: DragEvent) => {
  evt.preventDefault();
  //console.log("Event DRAGEXIT", evt.type);
};
</script>
<template>
  <div
    class="drop-container"
    @dragover="dragOverHandler"
    @dragenter="dragEnterHandler"
    @dragleave="dragLeaveHandler"
    @dragexit="dragExitHandler"
    @drop="dropHandler">
    <slot />
  </div>
</template>
