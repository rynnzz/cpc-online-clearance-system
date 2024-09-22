<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isLoginPage = computed(() => route.path === '/'); // Check if current path is the login page
</script>

<template>
  <div class="flex flex-col w-full min-h-screen bg-base-100">
    <!-- Import the Header Component -->
    <Header v-if="!isLoginPage" />

    <div class="flex flex-1">
      <!-- Sidebar Component -->
      <Sidebar v-if="!isLoginPage" />

      <div class="flex-1 bg-base-200">
        <div v-if="isLoginPage">
          <RouterView />
        </div>
        <div v-else class="flex h-full">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional styles for responsiveness if needed */
</style>
