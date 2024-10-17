<template>
        <div>
          <h1>Welcome to the Dashboard!</h1>
      
          <!-- Other dashboard content goes here -->
      
          <!-- First-Time Setup Modal -->
          <FirstTimeSetupModal 
          :isOpen="isFirstTimeModalOpen" 
          :closeModal="firstTimeModalClose"
          v-if = "userRole === 'student' || userRole === 'teacher'"
          />
        </div>
      </template>
      
      <script setup>
      import { ref, computed } from 'vue';
      import FirstTimeSetupModal from '@/components/FirstTimeSetupModal.vue';
      import { useAuthStore } from '@/stores/authStore'

      const authStore = useAuthStore();
      const isFirstTimeModalOpen = ref(!authStore.first_login);
      const userRole = computed(() => authStore.userRole);

      const firstTimeModalClose = async () => {
  isFirstTimeModalOpen.value = false;
  authStore.markSetupComplete(); // Mark setup as complete in the store
};
      
  
      </script>
      