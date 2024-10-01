<template>
    <div class="p-8 bg-gray-900 text-gray-100 w-full">
      <div class="mb-6">
        <h1 class="text-4xl sm:text-2xl font-bold">My Subjects</h1>
      </div>
  
      <!-- Loop through each subject and create a table for each -->
      <div v-for="(subject, index) in paginatedSubjects" :key="subject.id" class="mb-6">
        <h2 class="text-2xl font-bold mb-4">Subject {{ index + 1 }}</h2>
  
        <table class="table-auto w-full bg-gray-800 shadow-md border border-gray-700">
          <thead>
            <tr class="bg-gray-700">
              <th class="p-4 text-sm text-left">Details</th>
              <th class="p-4 text-sm text-left">Information</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-700 hover:bg-gray-600">
              <td class="p-4 text-sm font-bold">Subject Name</td>
              <td class="p-4 text-sm">{{ subject.subject_name }}</td>
            </tr>
            <tr class="border-b border-gray-700 hover:bg-gray-600">
              <td class="p-4 text-sm font-bold">Year & Section</td>
              <td class="p-4 text-sm">{{ subject.year_section }}</td>
            </tr>
            <tr class="border-b border-gray-700 hover:bg-gray-600">
              <td class="p-4 text-sm font-bold">Schedule</td>
              <td class="p-4 text-sm">{{ subject.schedule }}</td>
            </tr>
            <tr class="border-b border-gray-700 hover:bg-gray-600">
              <td class="p-4 text-sm font-bold">Teacher</td>
              <td class="p-4 text-sm">{{ subject.teacher_name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Pagination controls -->
      <div class="flex justify-end items-center my-4 space-x-4">
        <button
          @click="previousPage"
          class="btn bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <span class="text-lg">Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          @click="nextPage"
          class="btn bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          :disabled="currentPage >= totalPages"
        >
          Next
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios'; // Import Axios to make API calls
import TeacherFirstTimeLoginModal from '@/components/FirstTimeSetupModal.vue';
  
  const subjects = ref([]); // Subjects handled by the logged-in teacher
  const currentPage = ref(1);
  const pageSize = ref(3);
  
  // Fetch subjects for the logged-in teacher from the backend
  const getTeacherSubjects = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teachers/${id}`); // Use your backend API URL
      subjects.value = response.data.subjects; // Assuming the API returns a 'subjects' array
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };
  
  // Pagination logic
  const totalPages = computed(() => {
    return Math.ceil(subjects.value.length / pageSize.value);
  });
  
  const paginatedSubjects = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return subjects.value.slice(start, start + pageSize.value);
  });
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };
  
  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };
  
  // Fetch subjects when component mounts
  onMounted(() => {
    getTeacherSubjects();
  });
  </script>
  
  <style scoped>
  /* Optional: additional styling */
  .btn {
    transition: background-color 0.2s ease-in-out;
  }
  .btn:hover:not(:disabled) {
    background-color: #2563eb; /* Darker blue on hover */
  }
  </style>
  