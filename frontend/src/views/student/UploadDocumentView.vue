<template>
    <div class="flex flex-col min-h-screen">
      <!-- Import the Header Component -->
      <Header />
  
      <div class="flex flex-1">
        <!-- Sidebar Component -->
        <Sidebar />
  
        <!-- Main Dashboard Content -->
        <div class="flex-1 flex items-center justify-center bg-gray-100">
          <h1 class="text-4xl font-bold">Upload Document ni diri</h1>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // Import the Header and Sidebar components
  import Header from '@/components/Header.vue'
  import Sidebar from '@/components/Sidebar.vue'
  </script>
  
  <style scoped>
  /* Add custom styles if necessary */
  </style>
  