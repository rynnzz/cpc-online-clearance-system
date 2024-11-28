<template>
  <div class="w-full">
    <!-- Admin Dashboard -->
    <div v-if="userRole.includes('admin')" class="p-8 bg-gray-900 text-gray-100 min-h-screen">
      <h1 class="text-4xl font-bold mb-6">Admin Dashboard</h1>

      <!-- Summary Cards for Admin -->
      <div class="grid grid-cols-1 md:grid-cols-3 mb-6 gap-6">
        <div class="card bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-2">Total Teachers</h2>
          <p class="text-3xl font-bold">{{ dashboardStore.userCounts.teacher }}</p>
        </div>
        <div class="card bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-2">Total Students</h2>
          <p class="text-3xl font-bold">{{ dashboardStore.userCounts.student }}</p>
        </div>
        <div class="card bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-2">Subjects Offered</h2>
          <p class="text-3xl font-bold">{{ dashboardStore.userCounts.subjects }}</p>
        </div>
      </div>

      <!-- Recent Activity Section for Admin -->
      <div class="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-2xl font-semibold mb-4">Recent Activity</h2>
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-700">
              <th class="p-4 text-left">Full Name</th>
              <th class="p-4 text-left">Role</th>
              <th class="p-4 text-left">Description</th>
              <th class="p-4 text-left">Date Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="registration in dashboardStore.recentRegistrations" :key="registration.created_at" class="hover:bg-gray-600">
              <td class="p-4">{{ registration.first_name }} {{ registration.last_name }}</td>
              <td class="p-4">{{ registration.role }}</td>
              <td class="p-4">{{ registration.teacher_type }}</td>
              <td class="p-4">{{ new Date(registration.created_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Actions for Admin -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button @click="navigateTo('manage-teacher-accounts')" class="btn btn-primary w-full">
          Manage Teachers
        </button>
        <button @click="navigateTo('manage-student-accounts')" class="btn btn-primary w-full">
          Manage Students
        </button>
        <button @click="navigateTo('manage-subjects')" class="btn btn-primary w-full">
          Manage Subjects
        </button>
      </div>
    </div>
    
    <!-- Teacher Dashboard -->
    <div v-if="userRole.includes('teacher')" class="p-8 bg-gray-900 text-gray-100 min-h-screen">
      <h1 class="text-4xl font-bold mb-6">Teacher Dashboard</h1>

      <!-- Summary Cards for Teacher -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div class="card bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold">Total Students</h2>
          <p class="text-4xl font-semibold mt-4">{{ teacherDashboardData.totalStudents }}</p>
        </div>
        <div class="card bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold">Total Subjects</h2>
          <p class="text-4xl font-semibold mt-4">{{ teacherDashboardData.totalSubjects }}</p>
        </div>
        <div class="card bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold">Approved Clearances</h2>
          <p class="text-4xl font-semibold mt-4">{{ teacherDashboardData.totalApproved }}</p>
        </div>
        <div class="card bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold">Pending Clearances</h2>
          <p class="text-4xl font-semibold mt-4">{{ teacherDashboardData.totalPending }}</p>
        </div>
      </div>

      <!-- Subject Distribution -->
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-10">
        <h2 class="text-2xl font-bold mb-4">Subject Distribution</h2>
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-700 text-white">
              <th class="p-4 text-left">Subject</th>
              <th class="p-4 text-left">Total Students</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in teacherDashboardData.subjectDistribution" :key="subject.subjectId" class="hover:bg-gray-600">
              <td class="p-4">{{ subject.subjectName }}</td>
              <td class="p-4">{{ subject.totalStudents }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Clearance Status Summary by Subject -->
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-10">
        <h2 class="text-2xl font-bold mb-4">Clearance Status Summary by Subject</h2>
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-700 text-white">
              <th class="p-4 text-left">Subject</th>
              <th class="p-4 text-left">Approved</th>
              <th class="p-4 text-left">Pending</th>
              <th class="p-4 text-left">Rejected</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in teacherDashboardData.clearanceSummary" :key="subject.subjectId" class="hover:bg-gray-600">
              <td class="p-4">{{ subject.subjectName }}</td>
              <td class="p-4 text-green-500">{{ subject.approved }}</td>
              <td class="p-4 text-blue-500">{{ subject.pending }}</td>
              <td class="p-4 text-red-500">{{ subject.rejected }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Recent Approvals/Rejections -->
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">Recent Approvals & Rejections</h2>
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-700 text-white">
              <th class="p-4 text-left">Date</th>
              <th class="p-4 text-left">Student</th>
              <th class="p-4 text-left">Subject</th>
              <th class="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in teacherDashboardData.recentActivities" :key="activity.id" class="hover:bg-gray-600">
              <td class="p-4">{{ activity.date }}</td>
              <td class="p-4">{{ activity.studentName }}</td>
              <td class="p-4">{{ activity.subjectName }}</td>
              <td class="p-4" :class="{
                'text-green-500': activity.action === 'Approved',
                'text-red-500': activity.action === 'Rejected'
              }">{{ activity.action }}</td>
            </tr>
            <tr v-if="teacherDashboardData.recentActivities.length === 0">
              <td colspan="4" class="p-4 text-center text-gray-500">No recent activities</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="userRole.includes('student')" class="p-8 bg-gray-900 text-gray-100 min-h-screen">
      <h1 class="text-4xl font-bold mb-6">Student Dashboard</h1>

      <!-- Summary Cards for Student -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div class="card bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold">Subjects Enrolled</h2>
          <p class="text-4xl font-semibold mt-4">8</p>
        </div>
        <div class="card bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold">Clearance Status</h2>
          <p class="text-xl mt-4">4 Approved, 3 Pending, 1 Rejected</p>
        </div>
        <div class="card bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold">Total Units</h2>
          <p class="text-4xl font-semibold mt-4">24</p>
        </div>
      </div>

      <!-- Upcoming Deadlines (Static for now) -->
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-10">
        <h2 class="text-2xl font-bold mb-4">Upcoming Deadlines</h2>
        <ul class="list-disc pl-6 text-lg">
          <li>Submit project for Science by Nov 20, 2024</li>
          <li>Clearance for Mathematics by Dec 5, 2024</li>
          <li>Submit assignments for English by Dec 10, 2024</li>
        </ul>
      </div>

      <!-- Recently Approved Clearances (Static for now) -->
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">Recently Approved Clearances</h2>
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-700 text-white">
              <th class="p-4 text-left">Date</th>
              <th class="p-4 text-left">Subject</th>
              <th class="p-4 text-left">Teacher</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-gray-600">
              <td class="p-4">Nov 1, 2024</td>
              <td class="p-4">Mathematics</td>
              <td class="p-4">Mr. John Doe</td>
            </tr>
            <tr class="hover:bg-gray-600">
              <td class="p-4">Oct 15, 2024</td>
              <td class="p-4">History</td>
              <td class="p-4">Ms. Emily White</td>
            </tr>
            <!-- Add more rows as needed -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- First-Time Setup Modals -->
    <FirstTimeSetupTeacher 
      :isOpen="isFirstTimeSetupTeacherOpen"
      :closeModal="closeFirstTimeModalTeacher"  
      v-if="userRole.includes('teacher') && isFirstTimeSetupTeacherOpen"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import FirstTimeSetupTeacher from '@/components/FirstTimeSetupTeacher.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const router = useRouter();

// Compute the user's role from the authStore
const userRole = computed(() => authStore.userRole);

const teacherDashboardData = ref({
  totalStudents: 0,
  totalSubjects: 0,
  totalApproved: 0,
  totalPending: 0,
  subjectDistribution: [],
  clearanceSummary: [],
  recentActivities: []
});

const studentDashboardData = ref({
  subjectsEnrolled: 8,
  clearanceStatus: {
    approved: 4,
    pending: 3,
    rejected: 1
  },
  totalUnits: 24,
  clearanceDetails: [
    { subject: 'Mathematics', teacher: 'Mr. John Doe', status: 'Approved' },
    { subject: 'English', teacher: 'Ms. Jane Smith', status: 'Pending' },
    { subject: 'Science', teacher: 'Dr. Mike Brown', status: 'Rejected' }
  ],
  upcomingDeadlines: [
    { subject: 'Science', deadline: 'Nov 20, 2024' },
    { subject: 'Mathematics', deadline: 'Dec 5, 2024' },
    { subject: 'English', deadline: 'Dec 10, 2024' }
  ],
  recentApprovals: [
    { date: 'Nov 1, 2024', subject: 'Mathematics', teacher: 'Mr. John Doe' },
    { date: 'Oct 15, 2024', subject: 'History', teacher: 'Ms. Emily White' }
  ]
});

// Modal open state based on firstLogin status
const isFirstTimeSetupTeacherOpen = ref(false);

onMounted(() => {
  dashboardStore.initializeDashboard();
  authStore.initializeAuth();
  const storedFirstLogin = localStorage.getItem('isFirstLogin')
  if (userRole.value.includes('teacher') && storedFirstLogin === '1') {
    isFirstTimeSetupTeacherOpen.value = true;
  }
});

// Close the teacher setup modal
const closeFirstTimeModalTeacher = () => {
  isFirstTimeSetupTeacherOpen.value = false;
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
