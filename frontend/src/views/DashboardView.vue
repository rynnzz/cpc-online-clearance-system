<template>
  <div class="w-full">
    <!-- Admin Dashboard -->
    <div v-if="userRole.includes('admin')" class="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 min-h-screen">
    <!-- Admin Dashboard Header -->
    <div class="mb-8 text-center">
      <h1 class="text-5xl font-extrabold tracking-wide">Admin Dashboard</h1>
      <p class="text-lg text-gray-400 mt-2">Manage users, subjects, and registrations at a glance</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <!-- Total Teachers -->
      <div class="card bg-gray-800 p-6 rounded-lg shadow-lg text-center">
        <i class="fas fa-chalkboard-teacher text-blue-500 text-5xl mb-4"></i>
        <h2 class="text-2xl font-semibold">Total Teachers</h2>
        <p class="text-4xl font-bold mt-2">{{ dashboardStore.userCounts.teacher }}</p>
      </div>

      <!-- Total Students -->
      <div class="card bg-gray-800 p-6 rounded-lg shadow-lg text-center">
        <i class="fas fa-user-graduate text-green-500 text-5xl mb-4"></i>
        <h2 class="text-2xl font-semibold">Total Students</h2>
        <p class="text-4xl font-bold mt-2">{{ dashboardStore.userCounts.student || 0 }}</p>
      </div>

      <!-- Subjects Offered -->
      <div class="card bg-gray-800 p-6 rounded-lg shadow-lg text-center">
        <i class="fas fa-book text-yellow-500 text-5xl mb-4"></i>
        <h2 class="text-2xl font-semibold">Subjects Offered</h2>
        <p class="text-4xl font-bold mt-2">{{ dashboardStore.userCounts.subjects }}</p>
      </div>
    </div>

    <!-- Recent Registrations -->
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-12">
      <h2 class="text-3xl font-bold mb-6">
        <i class="fas fa-user-plus text-purple-500"></i> Recent Registrations
      </h2>
      <div v-if="dashboardStore.recentRegistrations.length > 0">
        <table class="table w-full bg-gray-700 text-gray-100 rounded-lg">
          <thead class="bg-gray-700 text-gray-400">
            <tr>
              <th class="p-4 text-left">Full Name</th>
              <th class="p-4 text-left">Role/s</th>
              <th class="p-4 text-left">Date Created</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="registration in dashboardStore.recentRegistrations"
              :key="registration.created_at"
              class="hover:bg-gray-600"
            >
              <td class="p-4">{{ registration.first_name }} {{ registration.last_name }}</td>
              <td class="p-4">{{ registration.teacher_roles || registration.role }}</td>
              <td class="p-4">{{ new Date(registration.created_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-400 py-4">
        <i class="fas fa-info-circle text-4xl mb-2"></i>
        <p class="text-lg">No recent registrations available.</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <button
        @click="navigateTo('manage-teacher-accounts')"
        class="btn btn-primary w-full flex items-center justify-center gap-2"
      >
        <i class="fas fa-chalkboard-teacher"></i>
        Manage Teachers
      </button>
      <button
        @click="navigateTo('manage-student-accounts')"
        class="btn btn-primary w-full flex items-center justify-center gap-2"
      >
        <i class="fas fa-user-graduate"></i>
        Manage Students
      </button>
      <button
        @click="navigateTo('manage-subjects')"
        class="btn btn-primary w-full flex items-center justify-center gap-2"
      >
        <i class="fas fa-book"></i>
        Manage Subjects
      </button>
    </div>
  </div>


    <!-- Teacher Dashboard -->
    <div v-if="userRole.some(role => ['Full Time', 'Part Time'].includes(role)) && !userRole.some(role => 
             ['Department Head - BSIT', 'Department Head - BEED', 'Department Head - BSHM', 'Department Head - BSED', 
              'Accounting', 'Librarian', 'SAO/SSG Adviser', 'Guidance Counselor', 'Registrar', 'Clinic'].includes(role))" class="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 min-h-screen">
    <!-- Dashboard Header -->
    <div class="mb-8 text-center">
      <h1 class="text-5xl font-extrabold tracking-wide">Teacher Dashboard</h1>
      <p class="text-lg text-gray-400 mt-2">Manage your subjects, students, and sections with ease</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      <!-- Total Students -->
      <div class="card bg-gray-800 p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-transform transform hover:-translate-y-2">
        <i class="fas fa-user-graduate text-green-500 text-5xl mb-4"></i>
        <h2 class="text-2xl font-bold">Total Students</h2>
        <p class="text-4xl font-semibold mt-2">{{ dashboardStore.teacherDashboard.totalStudents }}</p>
      </div>

      <!-- Total Subjects -->
      <div class="card bg-gray-800 p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-transform transform hover:-translate-y-2">
        <i class="fas fa-book text-yellow-500 text-5xl mb-4"></i>
        <h2 class="text-2xl font-bold">Total Subjects</h2>
        <p class="text-4xl font-semibold mt-2">{{ dashboardStore.teacherDashboard.totalSubjects }}</p>
      </div>

      <!-- Total Sections -->
      <div class="card bg-gray-800 p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-transform transform hover:-translate-y-2">
        <i class="fas fa-users text-blue-500 text-5xl mb-4"></i>
        <h2 class="text-2xl font-bold">Total Sections</h2>
        <p class="text-4xl font-semibold mt-2">{{ dashboardStore.teacherDashboard.totalSections }}</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Subject Clearance -->
      <button
        @click="navigateTo('subject-clearance')"
        class="btn btn-primary w-full flex items-center justify-center gap-2 py-3 px-6 text-lg font-semibold"
      >
        <i class="fas fa-tasks"></i> Subject Clearance
      </button>

      <!-- Administrative Clearance -->
      <button
        @click="navigateTo('administrative-clearance')"
        class="btn btn-primary w-full flex items-center justify-center gap-2 py-3 px-6 text-lg font-semibold"
      >
        <i class="fas fa-clipboard-check"></i> Administrative Clearance
      </button>

      <!-- Account Settings -->
      <button
        @click="navigateTo('teacher-profile')"
        class="btn btn-primary w-full flex items-center justify-center gap-2 py-3 px-6 text-lg font-semibold"
      >
        <i class="fas fa-cogs"></i> Account Settings
      </button>
    </div>
  </div>

  <div v-if="userRole.includes('teacher') && userRole.some(role =>
          [
            'Department Head - BSIT',
            'Department Head - BEED',
            'Department Head - BSHM',
            'Department Head - BSED',
            'Accounting',
            'Librarian',
            'SAO/SSG Adviser',
            'Guidance Counselor',
            'Registrar',
            'Clinic',
          ].includes(role)
        )" class="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 min-h-screen">
    <!-- Dashboard Header -->
    <div class="mb-8 text-center">
      <h1 class="text-5xl font-extrabold tracking-wide">Non-Teaching Staff Dashboard</h1>
      <p class="text-lg text-gray-400 mt-2">Access key statistics and perform essential actions</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      <!-- Pending Clearances -->
      <div class="card bg-gray-800 p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-transform transform hover:-translate-y-2">
        <i class="fas fa-clipboard-list text-blue-500 text-5xl mb-4"></i>
        <h2 class="text-2xl font-bold">Pending Clearances</h2>
        <p class="text-4xl font-semibold mt-2">{{ dashboardStore.pendingClearances }}</p>
      </div>

      <!-- Active Students -->
      <div class="card bg-gray-800 p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-transform transform hover:-translate-y-2">
        <i class="fas fa-user-graduate text-green-500 text-5xl mb-4"></i>
        <h2 class="text-2xl font-bold">Active Students</h2>
        <p class="text-4xl font-semibold mt-2">{{ dashboardStore.totalStudents }}</p>
      </div>

      <!-- Total Departments -->
      <div class="card bg-gray-800 p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-transform transform hover:-translate-y-2">
        <i class="fas fa-building text-yellow-500 text-5xl mb-4"></i>
        <h2 class="text-2xl font-bold">Total Departments</h2>
        <p class="text-4xl font-semibold mt-2">{{ dashboardStore.totalDepartments }}</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Manage Clearances -->
      <button
        @click="navigateTo('administrative-clearance')"
        class="btn btn-primary w-full flex items-center justify-center gap-2 py-3 px-6 text-lg font-semibold"
      >
        <i class="fas fa-tasks"></i> Administrative Clearance
      </button>

      <!-- Account Settings -->
      <button
        @click="navigateTo('teacher-profile')"
        class="btn btn-primary w-full flex items-center justify-center gap-2 py-3 px-6 text-lg font-semibold"
      >
        <i class="fas fa-cogs"></i> Account Settings
      </button>
    </div>
  </div>

    <!-- Student Dashboard -->
    <div v-if="userRole.includes('student')" class="p-6 bg-gray-900 text-gray-100 min-h-screen">
  <h1 class="text-3xl font-bold mb-6">Student Dashboard</h1>

  <!-- Dashboard Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <!-- Subjects Enrolled -->
    <div class="card bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg shadow-md flex flex-col items-center">
      <div class="icon bg-white text-blue-600 p-3 rounded-full text-3xl mb-4 shadow">
        <i class="fas fa-book"></i>
      </div>
      <h2 class="text-lg font-semibold text-white">Subjects Enrolled</h2>
      <p class="text-4xl font-bold text-white mt-2">{{ dashboardStore.totalSubjects }}</p>
    </div>

    <!-- Total Subject Units -->
    <div class="card bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-lg shadow-md flex flex-col items-center">
      <div class="icon bg-white text-green-600 p-3 rounded-full text-3xl mb-4 shadow">
        <i class="fas fa-layer-group"></i>
      </div>
      <h2 class="text-lg font-semibold text-white">Total Subject Units</h2>
      <p class="text-4xl font-bold text-white mt-2">{{ dashboardStore.totalUnits }}</p>
    </div>

    <!-- Approved Clearance -->
    <div class="card bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-lg shadow-md flex flex-col items-center">
      <div class="icon bg-white text-indigo-600 p-3 rounded-full text-3xl mb-4 shadow">
        <i class="fas fa-check-circle"></i>
      </div>
      <h2 class="text-lg font-semibold text-white">Approved Clearance</h2>
      <p class="text-4xl font-bold text-white mt-2">{{ dashboardStore.approvedClearances }}</p>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <button
      @click="navigateTo('view-clearance')"
      class="btn btn-primary flex items-center justify-center gap-2 p-3 rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white"
    >
      <i class="fas fa-eye"></i> View Clearance
    </button>
    <button
      @click="navigateTo('profile')"
      class="btn btn-primary flex items-center justify-center gap-2 p-3 rounded-lg shadow-md bg-green-600 hover:bg-green-700 text-white"
    >
      <i class="fas fa-user-cog"></i> Account Settings
    </button>
  </div>
</div>

    <FirstTimeSetupTeacher 
      :isOpen="isFirstTimeSetupTeacherOpen"
      :closeModal="closeFirstTimeModalTeacher"  
      v-if="userRole.includes('teacher') && isFirstTimeSetupTeacherOpen"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useDashboardStore } from "@/stores/dashboardStore";
import FirstTimeSetupTeacher from '@/components/FirstTimeSetupTeacher.vue';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const isFirstTimeSetupTeacherOpen = ref(false);

const userRole = computed(() => authStore.userRole);

onMounted(async () => {
  try {
    await dashboardStore.initializeDashboard();
    authStore.initializeAuth();
    const storedFirstLogin = localStorage.getItem('isFirstLogin')
  if (userRole.value.includes('teacher') && storedFirstLogin === '1') {
    isFirstTimeSetupTeacherOpen.value = true;
  }
  } catch (error) {
    console.error("Error initializing dashboard:", error);
  }
  const studentId = authStore.userId;
  if (studentId) {
    dashboardStore.initializeStudentDashboard(studentId);
  }
  const roleId = authStore.roleId;
  console.log(roleId);
  if (roleId) {
    dashboardStore.initializeNonTeachingDashboard(roleId);
  }
});

const teacherId = authStore.userId;

if (teacherId) {
  dashboardStore.initializeTeacherDashboard(teacherId);
}

const closeFirstTimeModalTeacher = () => {
  isFirstTimeSetupTeacherOpen.value = false;
};



const navigateTo = (route) => {
  window.location.href = `/${route}`;
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