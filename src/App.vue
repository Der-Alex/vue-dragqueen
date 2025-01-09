<script setup lang="ts">
import DragItem from "@/components/DragItem.vue";
import DropContainer from "@/components/DropContainer.vue";
</script>

<template>
  <div class="app w-full">
    <DropContainer>
      <DragItem>1</DragItem>
      <DragItem>2</DragItem>
      <DragItem>3</DragItem>
    </DropContainer>
  </div>
</template>

<style>
.app {
  height: 5000px;
}
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease-out;
}

.list-enter-from,
.list-leave-to {
  transform: translatex(0);
}
.dq-drag-item .dq-drag-item {
  margin-left: 1.5rem;
}
</style>
