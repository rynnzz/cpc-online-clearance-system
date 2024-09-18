<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <Header />

    <div class="flex flex-1">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main Content Area -->
      <div class="flex-1 p-6 bg-gray-100">
        <h1 class="text-3xl font-bold mb-6">Clearance Approvals</h1>

        <!-- Search and Filter Options -->
        <div class="mb-4 flex justify-between items-center">
          <input
            type="text"
            v-model="searchQuery"
            class="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by student name"
          />
          <select
            v-model="filterStatus"
            class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <!-- Clearance Table for Each Subject -->
        <div v-for="(subject, index) in teacherSubjects" :key="index" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">{{ subject.name }}</h2>
          <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left p-4">Student Name</th>
                <th class="text-left p-4">Degree</th>
                <th class="text-left p-4">Year & Section</th>
                <th class="text-left p-4">Status</th>
                <th class="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="student in filteredStudents(subject.id)"
                :key="student.id"
                class="border-b"
              >
                <td class="p-4">{{ student.first_name }} {{ student.middle_name }} {{ student.last_name }}</td>
                <td class="p-4">{{ student.degree }}</td>
                <td class="p-4">{{ student.yr_and_section }}</td>
                <td class="p-4">
                  <span
                    :class="statusClass(student.status)"
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                  >
                    {{ student.status }}
                  </span>
                </td>
                <td class="p-4 flex space-x-2">
                  <button
                    @click="approveClearance(student.id)"
                    class="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600"
                    :disabled="student.status === 'approved'"
                  >
                    Approve
                  </button>
                  <button
                    @click="rejectClearance(student.id)"
                    class="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600"
                    :disabled="student.status === 'rejected'"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination (optional) -->
        <div class="mt-4">
          <button
            @click="prevPage"
            class="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
          >
            Previous
          </button>
          <button
            @click="nextPage"
            class="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useStudentStore } from '@/stores/studentStore'
import { useTeacherStore } from '@/stores/teacherStore'

const studentStore = useStudentStore()
const teacherStore = useTeacherStore()

// Fetch students and teachers with subjects
onMounted(async () => {
  await studentStore.fetchStudents()
  await teacherStore.fetchTeachers() // Fetch teachers with subjects included
})

const searchQuery = ref('')
const filterStatus = ref('')

// Get the teacher's subjects
const teacherSubjects = computed(() => teacherStore.teachers.flatMap(teacher => teacher.subjects))

// Filter students based on search, status, and subject
const filteredStudents = () => {
  let filtered = students.value;

  if (searchQuery.value) {
    filtered = filtered.filter((student) =>
      (student.first_name + ' ' + student.middle_name + ' ' + student.last_name).toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (filterStatus.value) {
    filtered = filtered.filter((student) => student.status === filterStatus.value);
  }

  return filtered;
}

// Approve and Reject actions
const approveClearance = (id) => {
  const student = students.value.find((student) => student.id === id)
  if (student) student.status = 'approved'
}

const rejectClearance = (id) => {
  const student = students.value.find((student) => student.id === id)
  if (student) student.status = 'rejected'
}

// Status class for styling
const statusClass = (status) => {
  if (status === 'approved') return 'bg-green-200 text-green-800'
  if (status === 'rejected') return 'bg-red-200 text-red-800'
  return 'bg-yellow-200 text-yellow-800'
}

// Pagination logic (optional)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  currentPage.value++
}

const students = computed(() => studentStore.students)
</script>

<style scoped>
/* Add any custom styles here */
</style>
