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
      
      const isFirstTimeModalOpen = ref(true);

      const firstTimeModalClose = () => {
        isFirstTimeModalOpen.value = false;
      };
      
      const authStore = useAuthStore();
      
      const userRole = computed(() => authStore.userRole);
      
  
      </script>
      