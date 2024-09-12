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
          <button @click="openAddModal" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            Add Teacher
          </button>
        </div>

        <!-- Teachers Table -->
        <table class="table-auto w-full bg-white shadow rounded">
          <thead>
            <tr class="bg-gray-200 text-left">
              <th class="p-4">#</th>
              <th class="p-4">Name</th>
              <th class="p-4">Email</th>
              <th class="p-4">Subject</th>
              <th class="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(teacher, index) in teachers" :key="teacher.id" class="border-b">
              <td class="p-4">{{ index + 1 }}</td>
              <td class="p-4">{{ teacher.name }}</td>
              <td class="p-4">{{ teacher.email }}</td>
              <td class="p-4">{{ teacher.subject }}</td>
              <td class="p-4 space-x-2">
                <button @click="editTeacher(teacher)" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">Edit</button>
                <button @click="deleteTeacher(teacher.id)" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Add Teacher Modal -->
        <div v-if="isAddModalOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div class="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 class="text-2xl font-semibold mb-4">Add Teacher</h2>
            <form @submit.prevent="handleAddTeacher">
              <div class="space-y-4">
                <input
                  v-model="newTeacher.name"
                  type="text"
                  placeholder="Teacher Name"
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
                  v-model="newTeacher.subject"
                  type="text"
                  placeholder="Subject"
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
              </div>
              <div class="mt-6 flex justify-end space-x-2">
                <button @click="closeAddModal" type="button" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
                  Cancel
                </button>
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Edit Teacher Modal -->
        <div v-if="isEditing" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div class="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 class="text-2xl mb-4">Edit Teacher</h2>
            <form @submit.prevent="updateTeacher">
              <div class="space-y-4">
                <input
                  v-model="currentTeacher.name"
                  type="text"
                  placeholder="Teacher Name"
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
                  v-model="currentTeacher.subject"
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
import { ref, onMounted } from 'vue'
import { useTeacherStore } from '@/stores/teacherStore'

const teacherStore = useTeacherStore()

const newTeacher = ref({ name: '', email: '', subject: '', password: '' })
const isAddModalOpen = ref(false)
const isEditing = ref(false)
const currentTeacher = ref({})

const openAddModal = () => {
  isAddModalOpen.value = true
}

const closeAddModal = () => {
  isAddModalOpen.value = false
  newTeacher.value = { name: '', email: '', subject: '', password: '' }
}

onMounted(async () => {
  console.log('Component mounted'); // Add this line
  try {
    await teacherStore.fetchTeachers();
  } catch (error) {
    console.error("Error fetching teachers:", error);
  }
})

const handleAddTeacher = async () => {
  try {
    await teacherStore.addTeacher(newTeacher.value)
    closeAddModal()
  } catch (error) {
    console.error("Error adding teacher:", error)
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
    console.error("Error updating teacher:", error)
  }
}

const deleteTeacher = async (id) => {
  try {
    await teacherStore.deleteTeacher(id)
  } catch (error) {
    console.error("Error deleting teacher:", error)
  }
}

const cancelEdit = () => {
  isEditing.value = false
}

const teachers = teacherStore.teachers
</script>

<style scoped>
/* Add custom styles if necessary */
</style>
