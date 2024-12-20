<template>
  <header class="bg-gray-800 text-white flex justify-between items-center p-4 md:flex-row flex-col border-b border-gray-700 sm:w-screen">
    <h3 class="text-2xl font-bold mb-2 md:mb-0">
      Welcome !
    </h3>
    <div class="flex items-center space-x-4 mr-2">

      <!-- Logout Button -->
      <button @click="handleLogout" class="bg-red-500 hover:bg-red-600 text-white px-2 md:px-4 py-2 rounded flex items-center">
        <svg class="w-5 h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6-10V5a3 3 0 00-6 0v1"></path>
        </svg>
        Logout
      </button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// Logout handler function
const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
/* No additional styles needed */
</style>
