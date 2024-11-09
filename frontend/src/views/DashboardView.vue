<template>
  <div class="w-full">
    <div v-if="userRole === 'admin'" class="p-8 bg-gray-900 text-gray-100 min-h-screen">
      <h1 class="text-4xl font-bold mb-6">Admin Dashboard</h1>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 mb-6 gap-6">
        <!-- Teachers Count -->
        <div class="card bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-2">Total Teachers</h2>
          <p class="text-3xl font-bold">{{ dashboardStore.userCounts.teacher }}</p>
        </div>
        <!-- Students Count -->
        <div class="card bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-2">Total Students</h2>
          <p class="text-3xl font-bold">{{ dashboardStore.userCounts.student }}</p>
        </div>
        <!-- Subjects Offered -->
        <div class="card bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-2">Subjects Offered</h2>
          <p class="text-3xl font-bold">{{ dashboardStore.userCounts.subjects }}</p>
        </div>
      </div>

      <!-- Recent Registrations Section -->
      <div class="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-2xl font-semibold mb-4">Recent Activity</h2>
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-700">
              <th class="p-4 text-left">Full Name</th>
              <th class="p-4 text-left">Role</th>
              <th class="p-4 text-left">Date Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="registration in dashboardStore.recentRegistrations" :key="registration.created_at" class="hover:bg-gray-600">
              <td class="p-4">{{ registration.first_name }} {{ registration.last_name }}</td>
              <td class="p-4">{{ registration.role }}</td>
              <td class="p-4">{{ new Date(registration.created_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Actions Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button @click="navigateTo('manage-teacher-accounts')" class="btn btn-primary w-full">
          Manage Teachers
        </button>
        <button @click="navigateTo('manage-student-accounts')" class="btn btn-primary w-full">
          Manage Students
        </button>
        <button @click="navigateTo('manage-courses')" class="btn btn-primary w-full">
          Manage Subjects
        </button>
      </div>
    </div>
  
    <!-- First-Time Setup Modals -->
    <FirstTimeSetupTeacher 
      :isOpen="isFirstTimeSetupTeacherOpen"
      :closeModal="closeFirstTimeModalTeacher"  
      v-if="userRole === 'teacher' && isFirstTimeSetupTeacherOpen"
    />
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const router = useRouter();

// Compute the user's role from the authStore
const userRole = computed(() => authStore.userRole);

// Modal open state based on firstLogin status
const isFirstTimeSetupTeacherOpen = ref(false);
const isFirstTimeSetupStudentOpen = ref(false);

onMounted(() => {
  dashboardStore.initializeDashboard();
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

// Navigate to different management pages
const navigateTo = (page) => {
  router.push({ name: page });
};
</script>

<style scoped>
.card {
  transition: transform 0.3s;
}
.card:hover {
  transform: scale(1.05);
}
</style>
