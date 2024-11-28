<template>
  <div class="flex">
    <!-- Sidebar -->
    <div :class="['bg-gray-800 text-white transition-all duration-300', { 'w-82': isOpen, 'w-20': !isOpen }]" 
         class="h-full overflow-x-auto shadow-md border-r border-gray-700">

      <div class="p-6 text-xl font-semibold">CPC Online Clearance</div>

         <!-- Admin Sidebar Menu -->
         <ul v-if="userRole.includes('admin')" class="space-y-4 px-6">
        <!-- Dashboard -->
        <li :class="{ 'bg-gray-600': activeItem === 'dashboard' }" class="rounded-md transition duration-300 ease-in-out hover:bg-gray-600">
          <button @click="navigateTo('dashboard')" class="flex items-center w-full px-4 py-3 text-left text-lg">
            <i class="fas fa-tachometer-alt mr-5"></i>
            <span v-if="isOpen">Dashboard</span>
          </button>
        </li>

        <!-- Manage Subjects -->
        <li :class="{ 'bg-gray-600': activeItem === 'manage-subjects' }" class="rounded-md transition duration-300 ease-in-out hover:bg-gray-600">
          <button @click="navigateTo('manage-subjects')" class="flex items-center w-full px-4 py-3 text-left text-lg">
            <i class="fa-solid fa-book mr-5"></i>
            <span v-if="isOpen">Manage Subjects</span>
          </button>
        </li>

        <!-- Separator -->
        <hr class="my-4 border-gray-700" />

        <!-- Manage Accounts Dropdown with Hover -->
        <li class="relative rounded-md" @mouseenter="openDropdown" @mouseleave="conditionalCloseDropdown">
          <div class="flex items-center w-full px-4 py-3 text-left text-lg cursor-pointer transition duration-300 ease-in-out hover:bg-gray-600" @click="toggleDropdown">
            <i class="fas fa-users mr-5"></i>
            <span v-if="isOpen">Manage Accounts</span>
            <i :class="dropdownOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="ml-3" v-if="isOpen"></i>
          </div>
          
          <!-- Dropdown Menu -->
          <ul v-show="dropdownOpen" class=" rounded-lg shadow mt-1 p-1 space-y-1 transition-opacity duration-300 ease-in-out opacity-100">
            <!-- Teacher Accounts -->
            <li :class="{ 'bg-gray-600': activeItem === 'teacher-accounts' }" class="rounded-lg transition duration-300 ease-in-out hover:bg-gray-500">
              <button @click="navigateTo('teacher-accounts')" class="flex items-center w-full px-4 py-3 text-left text-lg">
                <i class="fas fa-chalkboard-teacher mr-4"></i>
                Teacher Accounts
              </button>
            </li>

            <!-- Student Accounts -->
            <li :class="{ 'bg-gray-600': activeItem === 'student-accounts' }" class="rounded-lg transition duration-300 ease-in-out hover:bg-gray-500">
              <button @click="navigateTo('student-accounts')" class="flex items-center w-full px-4 py-3 text-left text-lg">
                <i class="fas fa-user mr-4"></i>
                Student Accounts
              </button>
            </li>
          </ul>
        </li>
      </ul>

      <ul v-if="userRole.includes('teacher')">
        <!-- Teacher-specific menu items -->
        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'dashboard' }]"
          @click="navigateTo('dashboard')"
        >
          <i class="fas fa-tachometer-alt mr-3"></i> 
          <span v-if="isOpen">Dashboard</span>
        </li>
        
        <li 
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'subject-clearance' }]"
          @click="navigateTo('subject-clearance')"
        >
          <i class="fas fa-check-circle mr-3"></i> 
          <span v-if="isOpen">Subject Clearance</span>
        </li>

        <li v-if="userRole.includes('teacher') && ['Department Head - BSIT', 'Department Head - BEED', 'Department Head - BSHM', 'Department Head - BSED', 'Accounting', 'Librarian', 'SAO/SSG Adviser', 'Guidance Counselor', 'Registrar', 'Clinic'].some(role => userRole.includes(role)) && !(['Full Time', 'Part Time'].every(role => userRole.length === 1 && userRole.includes(role)))"
          :class="['flex items-center px-6 py-3 hover:bg-gray-700 cursor-pointer text-lg', { 'bg-gray-600': activeItem === 'administrative-clearance' }]"
          @click="navigateTo('administrative-clearance')"
        >
        <i class="fa-solid fa-folder-open mr-3"></i>
          <span v-if="isOpen">Administrative Clearance</span>
        </li>
      </ul>

      <ul v-if="userRole.includes('student')">
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

// Navigation function with active item setting
const navigateTo = (item) => {
  activeItem.value = item;

  const routes = {
    'dashboard': '/dashboard',
    'manage-subjects': '/manage-subjects',
    'teacher-accounts': '/manage-teacher-accounts',
    'student-accounts': '/manage-student-accounts',
    'view-clearance': '/view-clearance',
    'profile': '/profile',
    'subject-clearance': '/subject-clearance',
    'administrative-clearance': '/administrative-clearance',

  };

  router.push(routes[item]);
};

// Dropdown handling
const openDropdown = () => {
  dropdownOpen.value = true;
};

const closeDropdown = () => {
  dropdownOpen.value = false;
};

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// Ensure dropdown stays open when submenu items are clicked
const conditionalCloseDropdown = () => {
  // Close the dropdown only if it's not actively open via clicking
  if (!dropdownOpen.value) {
    closeDropdown();
  }
};

// Watch route change and set active menu item
watch(
  () => route.path,
  (newPath) => {
    const pathToActiveItem = {
      '/dashboard': 'dashboard',
      '/manage-subjects': 'manage-subjects',
      '/manage-teacher-accounts': 'teacher-accounts',
      '/manage-student-accounts': 'student-accounts',
      '/view-clearance': 'view-clearance',
      '/profile': 'profile',
      '/subject-clearance': 'subject-clearance',
      '/administrative-clearance': 'administrative-clearance'
    };
    activeItem.value = pathToActiveItem[newPath] || 'dashboard';
  }
);

// Initialize activeItem based on the current route on component mount
onMounted(() => {
  const pathToActiveItem = {
    '/dashboard': 'dashboard',
    '/manage-subjects': 'manage-subjects',
    '/manage-teacher-accounts': 'teacher-accounts',
    '/manage-student-accounts': 'student-accounts',
    '/view-clearance': 'view-clearance',
    '/profile': 'profile',
    '/subject-clearance': 'subject-clearance',
    '/administrative-clearance': 'administrative-clearance'
  };
  activeItem.value = pathToActiveItem[route.path] || 'dashboard';
  authStore.initializeAuth();
});
</script>