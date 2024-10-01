<template>
        <div>
          <h1>Welcome to the Dashboard!</h1>
      
          <!-- Other dashboard content goes here -->
      
          <!-- First-Time Setup Modal -->
          <FirstTimeSetupModal :isOpen="isFirstTimeModalOpen" :closeModal="closeFirstTimeSetupModal" />
        </div>
      </template>
      
      <script setup>
      import { ref } from 'vue';
      import FirstTimeSetupModal from '@/components/FirstTimeSetupModal.vue';
      
      const isFirstTimeModalOpen = ref(true);
      
      </script>
      