<script setup lang="ts">
import api from "@/api/data.json"

</script>

<template>
  <main>
    <div v-for="value in api.dish">
      <img :src="value.image" />
      <div class="categories">
        <span>{{ value.dish_type }}</span>
        <span>{{ value.type }}</span>
      </div>
      <p class="name">{{ value.name }}</p>
      <p class="description">{{ value.description }}</p>
    </div>
  </main>
</template>
<style scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.categories {
  display: flex;
  gap: .5rem;
  margin-top: .5rem;
  margin-bottom: .5rem;
}

.categories span {
  background: #5d2b2b;
  border-radius: 14px;
  padding: .4rem;
  font-size: .8rem;
}

img {
  width: 100%;
  object-fit: cover;
  border-radius: 14px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
}

.name {
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: .5rem;
}

.description {
  margin-top: .5rem;
}
</style>