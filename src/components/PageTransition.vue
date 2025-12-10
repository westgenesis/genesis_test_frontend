<template>
  <transition name="cool">
    <slot />
  </transition>
</template>

<style scoped>
.cool-enter-active,
.cool-leave-active {
  transition: all 0.3s ease-out;
  transform-origin: center center;
}

.cool-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.cool-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.cool-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.cool-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
