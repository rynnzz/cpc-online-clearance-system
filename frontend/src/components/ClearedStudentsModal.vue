<template>
  <transition name="modal-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div class="bg-gray-800 text-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
        <button
          class="absolute top-4 right-4 text-xl text-white"
          @click="closeModal"
        >
          &times;
        </button>
        <h2 class="text-2xl font-bold mb-4 text-center">Cleared Students</h2>

        <!-- Search Bar -->
        <div class="mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, or course..."
            class="w-full p-3 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Cleared Students Table -->
        <table class="table-auto w-full bg-gray-700 rounded-lg">
          <thead>
            <tr class="bg-gray-800">
              <th class="py-3 px-4 text-left text-gray-300 font-semibold">#</th>
              <th class="py-3 px-4 text-left text-gray-300 font-semibold">ID Number</th>
              <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                First Name
              </th>
              <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                Last Name
              </th>
              <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                Course
              </th>
              <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                Section
              </th>
              <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(student, index) in paginatedStudents"
              :key="student.student_id"
              class="hover:bg-gray-600"
            >
              <td class="py-3 px-4">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
              <td class="py-3 px-4">{{ student.student_id_num }}</td>
              <td class="py-3 px-4">{{ student.student_first_name }}</td>
              <td class="py-3 px-4">{{ student.student_last_name }}</td>
              <td class="py-3 px-4">{{ student.department_name }}</td>
              <td class="py-3 px-4">{{ student.section_name }}</td>
              <td class="py-3 px-4 text-green-500">Cleared</td>
            </tr>
            <tr v-if="paginatedStudents.length === 0">
              <td colspan="6" class="py-3 px-4 text-center text-gray-500">
                No cleared students found.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="flex justify-center items-center mt-4 space-x-2">
          <button
            class="btn btn-sm btn-secondary"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Previous
          </button>
          <span class="text-gray-400">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            class="btn btn-sm btn-secondary"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>


<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useStudentStore } from "@/stores/studentStore";

const studentStore = useStudentStore();

defineProps({
  isOpen: Boolean,
});

onMounted(() => {
  studentStore.getClearedStudents();
});

const clearedStudents = computed(() => studentStore.clearedStudents);

const emit = defineEmits(["close"]);

const searchQuery = ref("");

// Pagination variables
const currentPage = ref(1);
const pageSize = 10;

// Filtered students based on the search query
const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) {
    return clearedStudents.value;
  }

  const query = searchQuery.value.toLowerCase();

  return clearedStudents.value.filter((student) => {
    return (
      String(student.student_id_num ?? '').toLowerCase().includes(query) ||
      student.student_first_name.toLowerCase().includes(query) ||
      student.student_last_name.toLowerCase().includes(query) ||
      student.student_email.toLowerCase().includes(query) ||
      student.department_name.toLowerCase().includes(query) ||
      student.section_name.toLowerCase().includes(query)
    );
  });
});

// Watch `filteredStudents` and reset `currentPage` when it changes
watch(filteredStudents, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1; // Reset to the first page when results are fewer
  }
});

// Total number of pages
const totalPages = computed(() => {
  const total = Math.ceil(filteredStudents.value.length / pageSize);
  return total === 0 ? 1 : total; // Ensure at least one page exists even if no results
});

// Paginated students based on the current page
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredStudents.value.slice(start, end);
});

const closeModal = () => {
  emit("close");
};
</script>

