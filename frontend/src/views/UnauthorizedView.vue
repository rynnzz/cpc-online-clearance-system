<!-- src/views/UnauthorizedView.vue -->
<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-900 w-full text-white">
      <div class="text-center p-8 rounded-lg shadow-lg bg-gray-800">
        <h1 class="text-4xl text-red-500 font-bold mb-4">Access Denied!</h1>
        <p class="text-lg mb-6">You do not have permission to access this page.</p>
        <router-link to="/dashboard" class="btn btn-primary">Return to Dashboard</router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  
  </script>

  