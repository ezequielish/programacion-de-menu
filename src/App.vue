<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import 'vue3-toastify/dist/index.css';
import NavBar from "@/components/NavBar/NavBar.vue";

</script>

<template>
  <RouterView />
  <NavBar />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}
</style>
