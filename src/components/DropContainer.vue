<script setup lang="ts"></script>

<template>
  <div class="dq-container">
    <slot />
  </div>
</template>
<style>
.dq-container {
  position: relative;
  background: rgba(230, 60, 60, 0.5);
  padding: 0.5rem;
  border: 1px dashed rgba(255, 60, 60, 1);
}
</style>
