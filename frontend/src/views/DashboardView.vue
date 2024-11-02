<template>
  <div>
    <h1>Welcome to the Dashboard!</h1>

    <!-- First-Time Setup Modal for Teachers -->
    <FirstTimeSetupTeacher 
      :isOpen="isFirstTimeSetupTeacherOpen"
      :closeModal="closeFirstTimeModalTeacher"  
      v-if="userRole === 'teacher' && isFirstTimeSetupTeacherOpen"
    />

    <!-- First-Time Setup Modal for Students -->
    <FirstTimeSetupStudent
      :isOpen="isFirstTimeSetupStudentOpen"
      :closeModal="closeFirstTimeModalStudent"
      v-if="userRole === 'student' && isFirstTimeSetupStudentOpen"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import FirstTimeSetupTeacher from '@/components/FirstTimeSetupTeacher.vue';
import FirstTimeSetupStudent from '@/components/FirstTimeSetupStudent.vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore(); // Access authStore to check firstLogin

// Compute the user's role from the authStore
const userRole = computed(() => authStore.userRole);

// Modal open state based on firstLogin status
const isFirstTimeSetupTeacherOpen = ref(false);
const isFirstTimeSetupStudentOpen = ref(false);

// On component mount, check if the modal should be opened based on localStorage and user role
onMounted(() => {
  const storedFirstLogin = localStorage.getItem('isFirstLogin')
  if (userRole.value === 'teacher' && storedFirstLogin === '1') {
    isFirstTimeSetupTeacherOpen.value = true;
  } else if (userRole.value === 'student' && storedFirstLogin === '1') {
    isFirstTimeSetupStudentOpen.value = true;
  }
});

// Close the teacher setup modal
const closeFirstTimeModalTeacher = () => {
  isFirstTimeSetupTeacherOpen.value = false;
};

// Close the student setup modal
const closeFirstTimeModalStudent = () => {
  isFirstTimeSetupStudentOpen.value = false;
};
</script>
