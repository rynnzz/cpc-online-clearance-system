<template>
  <div class="flex-1 p-8 bg-gray-900 text-gray-100">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">Manage Student Accounts</h1>
      <!-- Button to trigger Add Student Modal -->
      <button @click="openAddModal" class="btn btn-primary flex items-center">
        <i class="fas fa-plus mr-2"></i>
        Add New
      </button>
    </div>

    <!-- Search Input -->
    <div class="mb-4 relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search"
        class="input w-1/3 bg-gray-700 text-white pl-10"
      />
      <i class="fas fa-search text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"></i>
    </div>

    <!-- Students Table -->
    <div class="overflow-x-auto">
      <table class="table w-full bg-gray-800 shadow-md border border-gray-700">
        <thead>
          <tr class="bg-gray-700">
            <th class="p-4">#</th>
            <th class="p-4">Full Name</th>
            <th class="p-4">Email</th>
            <th class="p-4">course</th>
            <th class="p-4">Year and Section</th>
            <th class="p-4">Student Type</th>
            <th class="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(student, index) in filteredStudents" :key="student.id" class="border-b border-gray-700 hover:bg-gray-600">
            <td class="p-4">{{ index + 1 }}</td>
            <td class="p-4">{{ student.first_name }} {{ student.middle_name }} {{ student.last_name }}</td>
            <td class="p-4">{{ student.email }}</td>
            <td class="p-4">{{ student.course }}</td>
            <td class="p-4">{{ student.year_and_section }}</td>
            <td class="p-4">{{ student.student_type }}</td>
            <td class="p-4 space-x-2 flex">
              <button @click="editStudent(student)" class="btn btn-warning flex items-center">
                <i class="fas fa-edit mr-2"></i> Edit
              </button>
              <button @click="deleteStudent(student.id)" class="btn btn-error flex items-center">
                <i class="fas fa-trash mr-2"></i> Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Student Modal -->
    <div v-if="isAddModalOpen" class="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50">
      <div class="bg-gray-800 p-6 rounded shadow-lg w-1/2">
        <h2 class="text-2xl font-semibold mb-4">Add Student</h2>
        <form @submit.prevent="handleAddStudent">
          <div class="space-y-4">
            <input
              v-model="newStudent.first_name"
              type="text"
              placeholder="First Name"
              class="input w-full bg-gray-700 text-white"
              required
            />
            <input
              v-model="newStudent.middle_name"
              type="text"
              placeholder="Middle Name"
              class="input w-full bg-gray-700 text-white"
              required
            />
            <input
              v-model="newStudent.last_name"
              type="text"
              placeholder="Last Name"
              class="input w-full bg-gray-700 text-white"
              required
            />
            <input
              v-model="newStudent.email"
              type="email"
              placeholder="Email"
              class="input w-full bg-gray-700 text-white"
              required
            />
            <input
              v-model="newStudent.password"
              type="password"
              placeholder="Password"
              class="input w-full bg-gray-700 text-white"
              required
            />
            <select 
              v-model="newStudent.student_type" 
              class="select w-full bg-gray-700 text-white" 
              required>
              <option value="" disabled>Select Student Type</option>
              <option value="Regular">Regular</option>
              <option value="Irregular">Irregular</option>
            </select>
          </div>
          <div class="mt-6 flex justify-end space-x-2">
            <button class="btn btn-secondary" @click="closeAddModal">
              Cancel
            </button>
            <button class="btn btn-primary" type="submit">
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Student Modal -->
    <div v-if="isEditing" class="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50">
  <div class="bg-gray-800 p-6 rounded shadow-lg w-1/2">
    <h2 class="text-2xl mb-4">Edit Student</h2>
    <form @submit.prevent="updateStudent">
      <div class="space-y-4">
        <input
          v-model="currentStudent.first_name"
          type="text"
          placeholder="First Name"
          class="input w-full bg-gray-700 text-white"
          required
        />
        <input
          v-model="currentStudent.middle_name"
          type="text"
          placeholder="Middle Name"
          class="input w-full bg-gray-700 text-white"
          required
        />
        <input
          v-model="currentStudent.last_name"
          type="text"
          placeholder="Last Name"
          class="input w-full bg-gray-700 text-white"
          required
        />
        <input
          v-model="currentStudent.email"
          type="email"
          placeholder="Email"
          class="input w-full bg-gray-700 text-white"
          required
        />
        <input
          v-model="currentStudent.password"
          type="password"
          placeholder="Password"
          class="input w-full bg-gray-700 text-white"
          required
        />
        
        <!-- course Dropdown -->
        <select 
          v-model="currentStudent.course" 
          class="select w-full bg-gray-700 text-white" 
          required>
          <option value="" disabled>Select Course</option>
          <option value="BSIT">BSIT</option>
          <option value="BSHM">BSHM</option>
          <option value="BSED">BSED</option>
          <option value="BEED">BEED</option>
        </select>

        <!-- Student Type Dropdown -->
        <select 
          v-model="currentStudent.student_type" 
          class="select w-full bg-gray-700 text-white" 
          required>
          <option value="" disabled>Select Student Type</option>
          <option value="Regular">Regular</option>
          <option value="Irregular">Irregular</option>
        </select>

        <input
          v-model="currentStudent.year_and_section"
          type="text"
          placeholder="Year and Section"
          class="input w-full bg-gray-700 text-white"
          required
        />
      </div>
      <div class="mt-6 flex justify-end space-x-2">
        <button @click="cancelEdit" type="button" class="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary">
          Update Student
        </button>
      </div>
    </form>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStudentStore } from '@/stores/studentStore'

const studentStore = useStudentStore()

const newStudent = ref({ first_name: '', middle_name: '', last_name: '', email: '', password: '', course: '', year_and_section: '', student_type: '' })
const isAddModalOpen = ref(false)
const isEditing = ref(false)
const currentStudent = ref({})
const searchQuery = ref('')

const openAddModal = () => {
  isAddModalOpen.value = true
}

const closeAddModal = () => {
  isAddModalOpen.value = false
  newStudent.value = { first_name: '', middle_name: '', last_name: '', email: '', password: '', course: '', year_and_section: '', student_type: '' }
}

onMounted(async () => {
  await studentStore.fetchStudents();
});

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

const filteredStudents = computed(() => {
  if (!searchQuery.value) {
    return students.value;
  }
  const query = searchQuery.value.toLowerCase();
  return students.value.filter(student => 
    `${student.first_name} ${student.middle_name} ${student.last_name}`.toLowerCase().includes(query) ||
    student.email.toLowerCase().includes(query) ||
    student.course.toLowerCase().includes(query) ||
    student.student_type.toLowerCase() === query ||
    student.year_and_section.toLowerCase().includes(query)
  );
});

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
