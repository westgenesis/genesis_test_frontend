<template>
  <div class="logo" @click="handleClick">
    <img :src="logo" class="w-full h-full my-2" />
  </div>
</template>

<script setup lang="ts">
const logo = import.meta.env.VITE_APP_LOGO;
const router = useRouter();
const handleClick = () => {
  router.push({
    path: "/",
  });
};
</script>

<style lang="scss" scoped>
.logo {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 10px;
}
</style>
