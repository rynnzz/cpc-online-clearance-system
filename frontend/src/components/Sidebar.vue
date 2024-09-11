<template>
  <div class="flex">
    <!-- Sidebar -->
    <div :class="['h-screen bg-gray-800 text-white transition-all duration-300', { 'w-72': isOpen, 'w-20': !isOpen }]">
      <div class="p-6 text-xl font-semibold">
        <!-- Toggle button -->
        <button 
          @click="toggleSidebar"
          class="text-white bg-gray-700 hover:bg-gray-600 rounded-lg px-2 py-1"
        >
          <i :class="isOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>
        </button>
        <span v-if="isOpen" class="ml-3">Menu</span>
      </div>

      <ul v-if="userRole === 'admin'">
        <!-- Admin-specific menu items -->
        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'admin-dashboard' }]"
          @click="navigateTo('admin-dashboard')"
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
        <hr class="my-4 border-gray-600" />

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
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'admin-dashboard' }]"
          @click="navigateTo('teacher-dashboard')"
        >
          <i class="fas fa-tachometer-alt mr-3"></i> 
          <span v-if="isOpen">Dashboard</span>
        </li>
        
        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'approve-requests' }]"
          @click="navigateTo('approve-clearance')"
        >
          <i class="fas fa-check-circle mr-3"></i> 
          <span v-if="isOpen">Approve Clearance</span>
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
  dropdownOpen.value = (item === 'teacher-accounts' || item === 'student-accounts'); // Keep dropdown open for sub-items

  const routes = {
    'admin-dashboard': '/admin-dashboard',
    'approve-requests': '/approve-requests',
    'students-status': '/students-status',
    'teacher-accounts': '/manage-teacher-accounts',
    'student-accounts': '/manage-student-accounts',
    'teacher-dashboard': '/teacher-dashboard',
    'approve-clearance': '/approve-clearance',
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
      '/admin-dashboard': 'admin-dashboard',
      '/approve-requests': 'approve-requests',
      '/students-status': 'students-status',
      '/manage-teacher-accounts': 'teacher-accounts',
      '/manage-student-accounts': 'student-accounts',
      '/teacher-dashboard': 'teacher-dashboard',
      '/approve-clearance': 'approve-clearance',
    };

    // Set the active item based on the current route path
    activeItem.value = pathToActiveItem[newPath] || 'admin-dashboard';
  }
);

// Initialize activeItem based on the current route on component mount
onMounted(() => {
  const pathToActiveItem = {
    '/admin-dashboard': 'admin-dashboard',
    '/approve-requests': 'approve-requests',
    '/students-status': 'students-status',
    '/manage-teacher-accounts': 'teacher-accounts',
    '/manage-student-accounts': 'student-accounts',
    '/teacher-dashboard': 'teacher-dashboard',
    '/approve-clearance': 'approve-clearance',
  };
  activeItem.value = pathToActiveItem[route.path] || 'admin-dashboard';
  authStore.initializeStore();
});
</script>

<style scoped>
/* Custom styles for bigger menu items and more spacing */
ul li {
  margin-bottom: 1rem; /* Adds more spacing between menu items */
}
</style>
