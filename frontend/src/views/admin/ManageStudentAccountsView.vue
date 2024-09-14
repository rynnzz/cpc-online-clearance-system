<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header Component -->
    <Header />

    <div class="flex flex-1">
      <!-- Sidebar Component -->
      <Sidebar />

      <!-- Main Content for Managing Student Accounts -->
      <div class="flex-1 p-8 bg-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-4xl font-bold">Manage Student Accounts</h1>
          <!-- Button to trigger Add Student Modal -->
          <button @click="openAddModal" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            Add New
          </button>
        </div>

        <!-- Students Table -->
        <table class="table-auto w-full bg-white shadow rounded">
          <thead>
            <tr class="bg-gray-200 text-left">
              <th class="p-4">#</th>
              <th class="p-4">Full Name</th>
              <th class="p-4">Email</th>
              <th class="p-4">Degree</th>
              <th class="p-4">Year and Section</th>
              <th class="p-4">Student Type</th>
              <th class="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in students" :key="student.id" class="border-b">
              <td class="p-4">{{ index + 1 }}</td>
              <td class="p-4">{{ student.first_name }} {{ student.middle_name }} {{ student.last_name }}</td>
              <td class="p-4">{{ student.email }}</td>
              <td class="p-4">{{ student.degree }}</td>
              <td class="p-4">{{ student.yr_and_section }}</td>
              <td class="p-4">{{ student.student_type }}</td>
              <td class="p-4 space-x-2">
                <button @click="editStudent(student)" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">Edit</button>
                <button @click="deleteStudent(student.id)" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Add Student Modal -->
        <div v-if="isAddModalOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div class="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 class="text-2xl font-semibold mb-4">Add Student</h2>
            <form @submit.prevent="handleAddStudent">
              <div class="space-y-4">
                <input
                  v-model="newStudent.first_name"
                  type="text"
                  placeholder="First Name"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newStudent.middle_name"
                  type="text"
                  placeholder="Middle Name"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newStudent.last_name"
                  type="text"
                  placeholder="Last Name"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newStudent.email"
                  type="text"
                  placeholder="Email"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newStudent.password"
                  type="password"
                  placeholder="Password"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newStudent.degree"
                  type="text"
                  placeholder="Degree"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newStudent.yr_and_section"
                  type="text"
                  placeholder="Year and Section"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newStudent.student_type"
                  type="text"
                  placeholder="Student Type"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div class="mt-6 flex justify-end space-x-2">
                <button @click="closeAddModal" type="button" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
                  Cancel
                </button>
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Edit Student Modal -->
        <div v-if="isEditing" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div class="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 class="text-2xl mb-4">Edit Student</h2>
            <form @submit.prevent="updateStudent">
              <div class="space-y-4">
                <input
                  v-model="currentStudent.name"
                  type="text"
                  placeholder="Student Name"
                  class="p-2 border rounded w-full"
                  required
                />
                <input
                  v-model="currentStudent.email"
                  type="email"
                  placeholder="Email"
                  class="p-2 border rounded w-full"
                  required
                />
                <input
                  v-model="currentStudent.subject"
                  type="text"
                  placeholder="Subject"
                  class="p-2 border rounded w-full"
                  required
                />
              </div>
              <div class="mt-6 flex justify-end space-x-2">
                <button @click="cancelEdit" type="button" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
                  Cancel
                </button>
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import { ref, onMounted, computed } from 'vue'
import { useStudentStore } from '@/stores/studentStore'

const studentStore = useStudentStore()

const newStudent = ref({ first_name: '', middle_name: '', last_name: '', email: '', password: '', degree: '', yr_and_section: '', student_type: '' })
const isAddModalOpen = ref(false)
const isEditing = ref(false)
const currentStudent = ref({})

const openAddModal = () => {
  isAddModalOpen.value = true
}

const closeAddModal = () => {
  isAddModalOpen.value = false
  newStudent.value = { first_name: '', middle_name: '', last_name: '', email: '', password: '', degree: '', yr_and_section: '', student_type: '' }
}

onMounted(async () => {
  console.log('Component mounted'); // Add this line
  try {
    await studentStore.fetchStudents();
  } catch (error) {
    console.error("Error fetching Students:", error);
  }
})

const handleAddStudent = async () => {
  try {
    await studentStore.addStudent(newStudent.value)
    closeAddModal()
  } catch (error) {
    console.error("Error adding Student:", error)
  }
}

const editStudent = (student) => {
  isEditing.value = true
  currentStudent.value = { ...student }
}

const updateStudent = async () => {
  try {
    await studentStore.updateStudent(currentStudent.value)
    isEditing.value = false
  } catch (error) {
    console.error("Error updating Student:", error)
  }
}

const deleteStudent = async (id) => {
  try {
    await studentStore.deleteStudent(id)
  } catch (error) {
    console.error("Error deleting Student:", error)
  }
}

const cancelEdit = () => {
  isEditing.value = false
}

const students = computed(() => studentStore.students);
</script>

<style scoped>
/* Add custom styles if necessary */
</style>
