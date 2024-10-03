<script setup lang="ts">
const dropHandler = (evt: DragEvent) => {
  evt.preventDefault();
};
const dragEnterHandler = (evt: DragEvent) => {
  evt.preventDefault();
};
const dragOverHandler = (evt: DragEvent) => {
  evt.preventDefault();
};
const dragLeaveHandler = (evt: DragEvent) => {
  evt.preventDefault();
};
const dragExitHandler = (evt: DragEvent) => {
  evt.preventDefault();
};
</script>

<template>
  <div
    class="drop-container"
    @dragover="dragOverHandler"
    @dragenter="dragEnterHandler"
    @dragleave="dragLeaveHandler"
    @dragexit="dragExitHandler"
    @drop="dropHandler"
  >
    <slot />
  </div>
</template>
