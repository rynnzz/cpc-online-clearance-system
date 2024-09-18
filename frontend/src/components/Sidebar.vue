<template>
  <div class="flex">
    <!-- Sidebar -->
    <div :class="['bg-gray-800 text-white transition-all duration-300', { 'w-72': isOpen, 'w-20': !isOpen }]" 
         class="h-screen overflow-y-auto">
      <div class="p-6 text-xl font-semibold">
        <button 
          @click="toggleSidebar"
          class="text-white bg-gray-700 hover:bg-gray-600 rounded-lg px-2 py-1"
        >
          <i :class="isOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>
        </button>
        <span v-if="isOpen" class="ml-3">Menu</span>
      </div>

      <div class="p-6 text-xl font-semibold">CPC Online Clearance</div>

      <ul v-if="userRole === 'admin'">
        <!-- Admin-specific menu items -->
        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'dashboard' }]"
          @click="navigateTo('dashboard')"
        >
          <i class="fas fa-tachometer-alt mr-3"></i> 
          <span v-if="isOpen">Dashboard</span>
        </li>
        
        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'approve-requests' }]"
          @click="navigateTo('approve-requests')"
        >
          <i class="fas fa-check-circle mr-3"></i> 
          <span v-if="isOpen">Approve Requests</span>
        </li>

        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'students-status' }]"
          @click="navigateTo('students-status')"
        >
          <i class="fas fa-user-graduate mr-3"></i> 
          <span v-if="isOpen">Students Status</span>
        </li>

        <!-- Separator -->
        <hr class="my-4 border-gray-600 m-3" />

        <!-- Manage Accounts Dropdown -->
        <li class="relative">
          <div 
            class="flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg"
            @click="toggleDropdown"
          >
            <i class="fas fa-users mr-3"></i> 
            <span v-if="isOpen">Manage Accounts</span>
            <i class="fas fa-chevron-down ml-auto" v-if="isOpen"></i>
          </div>
          <ul 
            v-if="dropdownOpen || activeItem === 'teacher-accounts' || activeItem === 'student-accounts'" 
            class="ml-8 mt-2 bg-gray-800 rounded-lg"
          >
            <li 
              :class="['flex items-center px-6 py-3 hover:bg-gray-600 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'teacher-accounts' }]"
              @click="navigateTo('teacher-accounts')"
            >
              <i class="fas fa-chalkboard-teacher mr-3"></i> 
              <span v-if="isOpen">Teacher Accounts</span>
            </li>
            <li 
              :class="['flex items-center px-6 py-3 hover:bg-gray-600 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'student-accounts' }]"
              @click="navigateTo('student-accounts')"
            >
              <i class="fas fa-user mr-3"></i> 
              <span v-if="isOpen">Student Accounts</span>
            </li>
          </ul>
        </li>
      </ul>

      <ul v-if="userRole === 'teacher'">
        <!-- Teacher-specific menu items -->
        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'dashboard' }]"
          @click="navigateTo('dashboard')"
        >
          <i class="fas fa-tachometer-alt mr-3"></i> 
          <span v-if="isOpen">Dashboard</span>
        </li>
        
        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'approve-clearance' }]"
          @click="navigateTo('approve-clearance')"
        >
          <i class="fas fa-check-circle mr-3"></i> 
          <span v-if="isOpen">Approve Clearance</span>
        </li>
      </ul>

      <ul v-if="userRole === 'student'">
        <!-- Student-specific menu items -->
        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'dashboard' }]"
          @click="navigateTo('dashboard')"
        >
          <i class="fas fa-tachometer-alt mr-3"></i> 
          <span v-if="isOpen">Dashboard</span>
        </li>
        
        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'view-clearance' }]"
          @click="navigateTo('view-clearance')"
        >
          <i class="fa-solid fa-newspaper mr-3"></i>
          <span v-if="isOpen">View Clearance</span>
        </li>

        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'upload-document' }]"
          @click="navigateTo('upload-document')"
        >
          <i class="fa-regular fa-square-plus mr-3"></i>
          <span v-if="isOpen">Upload Document</span>
        </li>

        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'profile' }]"
          @click="navigateTo('profile')"
        >
          <i class="fa-solid fa-circle-user mr-3"></i>
          <span v-if="isOpen">Student Profile</span>
        </li>
      </ul>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const userRole = computed(() => authStore.userRole);
const isOpen = ref(true);
const dropdownOpen = ref(false);
const activeItem = ref('');
const router = useRouter();
const route = useRoute();

// Toggle Sidebar visibility
const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

// Navigation function with active item setting
const navigateTo = (item) => {
  activeItem.value = item; // Set the clicked item as active

  const routes = {
    'dashboard': '/dashboard',
    'approve-requests': '/approve-requests',
    'students-status': '/students-status',
    'teacher-accounts': '/manage-teacher-accounts',
    'student-accounts': '/manage-student-accounts',
    'approve-clearance': '/approve-clearance',
    'view-clearance': '/view-clearance',
    'profile': '/profile',
    'upload-document': '/upload-document',
  };

  router.push(routes[item]); // Navigate to the new route
};

// Toggle dropdown for Manage Accounts
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// Watch route change and set active menu item
watch(
  () => route.path,
  (newPath) => {
    const pathToActiveItem = {
      '/dashboard': 'dashboard',
      '/approve-requests': 'approve-requests',
      '/students-status': 'students-status',
      '/manage-teacher-accounts': 'teacher-accounts',
      '/manage-student-accounts': 'student-accounts',
      '/approve-clearance': 'approve-clearance',
      '/view-clearance': 'view-clearance',
      '/profile': 'profile',
      '/upload-document': 'upload-document',
    };

    // Set the active item based on the current route path
    activeItem.value = pathToActiveItem[newPath] || 'dashboard';
  }
);

// Initialize activeItem based on the current route on component mount
onMounted(() => {
  const pathToActiveItem = {
    '/dashboard': 'dashboard',
    '/approve-requests': 'approve-requests',
    '/students-status': 'students-status',
    '/manage-teacher-accounts': 'teacher-accounts',
    '/manage-student-accounts': 'student-accounts',
    '/approve-clearance': 'approve-clearance',
    '/view-clearance': 'view-clearance',
    '/profile': 'profile',
    '/upload-document': 'upload-document',
  };
  activeItem.value = pathToActiveItem[route.path] || 'dashboard';
  authStore.initializeStore();
});
</script>

<style scoped>
/* Custom styles for sidebar and scrolling */
.bg-gray-800 {
  background-color: #2d3748;
}

.h-screen {
  height: 100vh;
}

.overflow-y-auto {
  overflow-y: auto;
}

ul li {
  margin-bottom: 1rem; /* Adds more spacing between menu items */
}

@media (max-width: 768px) {
  .w-72 {
    width: 100%; /* Make sidebar full width on smaller screens */
  }
}
</style>
