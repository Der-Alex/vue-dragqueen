<script setup lang="ts">
const dragEndHandler = (evt: DragEvent) => {
  evt.preventDefault();
  console.log("Event DRAGEND", evt.type);
};
</script>
<template>
  <div
    class="drag-item"
    draggable="true"
    @dragend="dragEndHandler">
    <slot />
  </div>
</template>
