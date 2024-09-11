<template>
    <header class="bg-gray-800 text-white flex justify-between items-center p-4">
      <div class="text-lg font-bold">
        Welcome Admin!
      </div>
      <div class="flex items-center space-x-4">
        <!-- Notifications Button -->
        <button class="relative">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span class="absolute top-0 right-0 inline-block w-2 h-2 transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"></span>
        </button>
  
        <!-- Logout Button -->
        <button @click="handleLogout" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

  </style>
  