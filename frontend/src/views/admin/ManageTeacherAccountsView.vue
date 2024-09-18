<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header Component -->
    <Header />

    <div class="flex flex-1">
      <!-- Sidebar Component -->
      <Sidebar />

      <!-- Main Content for Managing Teacher Accounts -->
      <div class="flex-1 p-8 bg-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-4xl font-bold">Manage Teacher Accounts</h1>
          <!-- Button to trigger Add Teacher Modal -->
          <button @click="openAddModal" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center">
            <i class="fas fa-plus mr-2"></i> Add New
          </button>
        </div>

        <!-- Responsive Teachers Table -->
        <div class="table-wrapper">
          <table class="table-auto w-full bg-white shadow rounded">
            <thead>
              <tr class="bg-gray-200 text-left">
                <th class="p-4">#</th>
                <th class="p-4">Full Name</th>
                <th class="p-4">Email</th>
                <th class="p-4">Year And Sections Handled</th>
                <th class="p-4">Subjects Handled</th>
                <th class="p-4">Teacher Type</th>
                <th class="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(teacher, index) in teachers" :key="teacher.id" class="border-b">
                <td class="p-4">{{ index + 1 }}</td>
                <td class="p-4">{{ teacher.last_name }}, {{ teacher.first_name }} {{ teacher.middle_name }}</td>
                <td class="p-4">{{ teacher.email }}</td>
                <td class="p-4">{{ teacher.yr_and_section }}</td>
                <td class="p-4">{{ teacher.subjects }}</td>
                <td class="p-4">{{ teacher.teacher_type }}</td>
                <td class="p-4 space-x-2 flex">
                  <button @click="editTeacher(teacher)" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition flex items-center">
                    <i class="fas fa-edit mr-2"></i> Edit
                  </button>
                  <button @click="deleteTeacher(teacher.id)" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center">
                    <i class="fas fa-trash mr-2"></i> Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Add Teacher Modal -->
        <div v-if="isAddModalOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div class="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 class="text-2xl font-semibold mb-4">Add Teacher</h2>
            <form @submit.prevent="handleAddTeacher">
              <div class="space-y-4">
                <input
                  v-model="newTeacher.first_name"
                  type="text"
                  placeholder="First Name"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newTeacher.middle_name"
                  type="text"
                  placeholder="Middle Name"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newTeacher.last_name"
                  type="text"
                  placeholder="Last Name"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newTeacher.email"
                  type="email"
                  placeholder="Email"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newTeacher.password"
                  type="password"
                  placeholder="Password"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newTeacher.yr_and_section"
                  type="text"
                  placeholder="Year And Sections Handled"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newTeacher.subjects"
                  type="text"
                  placeholder="Subjects Handled"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  v-model="newTeacher.teacher_type"
                  type="text"
                  placeholder="Teacher Type"
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div class="mt-6 flex justify-end space-x-2">
                <button @click="closeAddModal" type="button" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition flex items-center">
                  <i class="fas fa-times mr-2"></i> Cancel
                </button>
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center">
                  <i class="fas fa-check mr-2"></i> Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Edit Teacher Modal -->
        <div v-if="isEditing" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div class="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 class="text-2xl mb-4">Edit Teacher</h2>
            <form @submit.prevent="updateTeacher">
              <div class="space-y-4">
                <input
                  v-model="currentTeacher.first_name"
                  type="text"
                  placeholder="First Name"
                  class="p-2 border rounded w-full"
                  required
                />
                <input
                  v-model="currentTeacher.middle_name"
                  type="text"
                  placeholder="Middle Name"
                  class="p-2 border rounded w-full"
                  required
                />
                <input
                  v-model="currentTeacher.last_name"
                  type="text"
                  placeholder="Last Name"
                  class="p-2 border rounded w-full"
                  required
                />
                <input
                  v-model="currentTeacher.email"
                  type="email"
                  placeholder="Email"
                  class="p-2 border rounded w-full"
                  required
                />
                <input
                  v-model="currentTeacher.password"
                  type="password"
                  placeholder="Password"
                  class="p-2 border rounded w-full"
                  required
                />
                <input
                  v-model="currentTeacher.yr_and_section"
                  type="text"
                  placeholder="Year And Sections Handled"
                  class="p-2 border rounded w-full"
                  required
                />
                <input
                  v-model="currentTeacher.subjects"
                  type="text"
                  placeholder="Subjects Handled"
                  class="p-2 border rounded w-full"
                  required
                />
                <input
                  v-model="currentTeacher.teacher_type"
                  type="text"
                  placeholder="Teacher Type"
                  class="p-2 border rounded w-full"
                  required
                />
              </div>
              <div class="mt-6 flex justify-end space-x-2">
                <button 
                @click="cancelEdit" 
                type="button" 
                class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition flex items-center">
                Cancel
                </button>
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center">
                Update Teacher
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
import { useTeacherStore } from '@/stores/teacherStore'

const teacherStore = useTeacherStore()

const newTeacher = ref({ first_name: '', middle_name: '', last_name: '', email: '', password: '', yr_and_section: '', subjects: '', teacher_type: '' })
const isAddModalOpen = ref(false)
const isEditing = ref(false)
const currentTeacher = ref({})

const openAddModal = () => {
  isAddModalOpen.value = true
}

const closeAddModal = () => {
  isAddModalOpen.value = false
  newTeacher.value = { first_name: '', middle_name: '', last_name: '', email: '', password: '', yr_and_section: '', subjects: '', teacher_type: '' }
}

onMounted(async () => {
  try {
    await teacherStore.fetchTeachers()
  } catch (error) {
    console.error('Error fetching teachers:', error)
  }
})

const handleAddTeacher = async () => {
  try {
    await teacherStore.addTeacher(newTeacher.value)
    closeAddModal()
  } catch (error) {
    console.error('Error adding teacher:', error)
  }
}

const editTeacher = (teacher) => {
  isEditing.value = true
  currentTeacher.value = { ...teacher }
}

const updateTeacher = async () => {
  try {
    await teacherStore.updateTeacher(currentTeacher.value)
    isEditing.value = false
  } catch (error) {
    console.error('Error updating teacher:', error)
  }
}

const deleteTeacher = async (id) => {
  try {
    await teacherStore.deleteTeacher(id)
  } catch (error) {
    console.error('Error deleting teacher:', error)
  }
}

const cancelEdit = () => {
  isEditing.value = false
}

const teachers = computed(() => teacherStore.teachers)
</script>

<style scoped>


table {
  width: 100%;
  min-width: 600px; /* Minimum width to prevent layout breaking */
}

th, td {
  padding: 0.75rem; /* Adjust padding for better mobile appearance */
  text-align: left;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  th, td {
    font-size: 14px; /* Reduce text size on smaller devices */
  }

  .p-4 {
    padding: 0.5rem; /* Reduce padding for smaller screens */
  }

  .btn {
    padding: 0.25rem 0.5rem; /* Reduce button padding for small screens */
  }

  .modal-content {
    width: 90%; /* Make modal width responsive */
    max-width: none; /* Override max-width for modal */
  }
}
</style>
