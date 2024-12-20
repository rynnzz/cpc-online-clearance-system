<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

const route = useRoute();
const isLoginPage = computed(() => route.path === '/'); // Check if current path is the login page
const isUnauthorizedPage = computed(() => route.path ==='/unauthorized')
const isPageNotFoundPage = computed(() => route.path ==='/page-not-found')

onMounted( () => {
    authStore.initializeAuth(); // Initialize auth on app load
    });
</script>

<template>
  <div class="flex flex-col w-screen min-h-screen bg-base-100">
    <!-- Import the Header Component -->
    <Header v-if="!isLoginPage && !isUnauthorizedPage && !isPageNotFoundPage" />

    <div class="flex flex-1">
      <!-- Sidebar Component -->
      <Sidebar v-if="!isLoginPage && !isUnauthorizedPage && !isPageNotFoundPage" />

      <div class="flex-1 bg-gray-900">
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
