<template>
  <div>
    <h1>Welcome to the Dashboard!</h1>

    <!-- First-Time Setup Modal -->
    <FirstTimeSetupModal 
      :isOpen="isFirstTimeModalOpen"
      :closeModal="closeFirstTimeModal"
      v-if="userRole === 'teacher' && isFirstTimeModalOpen"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import FirstTimeSetupModal from '@/components/FirstTimeSetupModal.vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// Compute the user's role and firstLogin status from the authStore
const userRole = computed(() => authStore.userRole);
const isFirstLogin = computed(() => authStore.isFirstLogin);

// Modal open state based on firstLogin status
const isFirstTimeModalOpen = ref(false);

// On component mount, initialize auth and check if modal needs to be opened
onMounted(() => {
  authStore.initializeAuth(); // Load token and user data from localStorage
  if (userRole.value === 'teacher' && isFirstLogin.value) {
    isFirstTimeModalOpen.value = true; // Open modal if it's the first login
  }
});

// Close modal and update firstLogin status
const closeFirstTimeModal = async () => {
  isFirstTimeModalOpen.value = false;
};
</script>
