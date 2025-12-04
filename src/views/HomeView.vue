<script setup>
import FormAddDish from '@/components/Forms/FormAddDish.vue';
</script>

<template>
  <main>
    <div class="logo">
      <img src="/logo.png" width="50px" />
    </div>
    <div>
      <FormAddDish />
    </div>
  </main>
</template>
<style scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.logo {
  display: flex;
  justify-content: center;
}
</style>