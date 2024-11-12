<template>
  <div class="flex-1 p-8 bg-gray-900 text-gray-100">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl sm:text-2xl font-bold">Manage Student Accounts</h1>
      <!-- Buttons to trigger Add Student and Bulk Add Modal -->
      <div class="space-x-4">
        <button @click="openAddModal" class="btn btn-primary">
          <i class="fas fa-plus mr-2"></i> Add New
        </button>
        <button @click="openBulkAddModal" class="btn btn-secondary">
          <i class="fas fa-file-upload mr-2"></i> Bulk Add
        </button>
      </div>
    </div>

    <!-- Search Input and Delete Selected Button -->
    <div class="flex justify-between items-center mb-4">
      <div class="relative w-full sm:w-1/3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="input w-full bg-gray-700 text-white pl-10"
        />
        <i class="fas fa-search text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"></i>
      </div>
      <button @click="bulkDelete" :disabled="!selectedStudents.length" class="btn btn-error flex items-center">
        <i class="fas fa-trash mr-2"></i> Delete Selected
      </button>
    </div>

    <!-- Students Table -->
    <table class="table w-full bg-gray-800 text-white">
      <thead>
        <tr class="bg-gray-700">
          <th><input type="checkbox" @change="selectAll($event)" /></th>
          <th>#</th>
          <th>Full Name</th>
          <th>Email</th>
          <th>Course</th>
          <th>Year and Section</th>
          <th>Student Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(student, index) in paginatedStudents" :key="student.id" class="hover:bg-gray-600">
          <td><input type="checkbox" :value="student.id" v-model="selectedStudents" /></td>
          <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
          <td>{{ student.first_name }} {{ student.middle_name }} {{ student.last_name }}</td>
          <td>{{ student.email }}</td>
          <td>{{ student.course }}</td>
          <td>{{ student.year_and_section }}</td>
          <td>{{ student.student_type }}</td>
          <td class="flex space-x-2">
            <button @click="editStudent(student)" class="btn btn-warning">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="openConfirmationModal(student.id)" class="btn btn-error">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination Controls -->
    <div class="flex justify-end items-center my-4">
      <button @click="previousPage" class="btn btn-primary mr-2" :disabled="currentPage === 1">Previous</button>
      <span class="mr-4">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" class="btn btn-primary ml-2" :disabled="currentPage >= totalPages">Next</button>
    </div>

    <!-- Add Student Modal -->
    <div v-if="isAddModalOpen" class="modal modal-open">
      <div class="modal-box bg-gray-800 text-white">
        <h2 class="text-2xl font-semibold mb-4">Add Student</h2>
        <form @submit.prevent="handleAddStudent">
          <div class="space-y-4">
            <input v-model="newStudent.first_name" type="text" placeholder="First Name" class="input input-bordered w-full bg-gray-700" required />
            <input v-model="newStudent.middle_name" type="text" placeholder="Middle Name" class="input input-bordered w-full bg-gray-700" required />
            <input v-model="newStudent.last_name" type="text" placeholder="Last Name" class="input input-bordered w-full bg-gray-700" required />
            <input v-model="newStudent.email" type="email" placeholder="Email" class="input input-bordered w-full bg-gray-700" required />
            <input v-model="newStudent.password" type="password" placeholder="Password" class="input input-bordered w-full bg-gray-700" required />
            <select v-model="newStudent.student_type" class="select select-bordered w-full bg-gray-700" required>
              <option value="" disabled>Select Student Type</option>
              <option value="Regular">Regular</option>
              <option value="Irregular">Irregular</option>
            </select>
          </div>
          <div class="modal-action mt-4">
            <button type="button" class="btn btn-secondary" @click="closeAddModal">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Student</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Bulk Add Modal -->
    <div v-if="isBulkAddModalOpen" class="modal modal-open">
      <div class="modal-box bg-gray-800 text-white">
        <h2 class="text-2xl font-semibold mb-4">Bulk Add Students</h2>
        <form @submit.prevent="handleBulkAdd">
          <div class="mb-4">
            <input type="file" @change="handleFileUpload" class="file-input file-input-bordered w-full bg-gray-700" accept=".xlsx, .xls" />
          </div>
          <div class="modal-action mt-4">
            <button type="button" class="btn btn-secondary" @click="closeBulkAddModal">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Students</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <input type="checkbox" id="confirmation-modal" class="modal-toggle" v-model="isConfirmationModalOpen" />
    <div class="modal">
      <div class="modal-box">
        <h2 class="text-lg font-bold">Confirm Deletion</h2>
        <p class="py-4">Are you sure you want to delete this student? This action cannot be undone.</p>
        <div class="modal-action">
          <button class="btn" @click="deleteStudent(studentIdToDelete)">Yes, Delete</button>
          <button class="btn" @click="closeConfirmationModal">Cancel</button>
        </div>
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
const isBulkAddModalOpen = ref(false)
const searchQuery = ref('')
const file = ref(null)
const selectedStudents = ref([]) // List of selected students for bulk actions
const isConfirmationModalOpen = ref(false);
const studentIdToDelete = ref(null);

const currentPage = ref(1)
const pageSize = ref(10)

const openAddModal = () => { isAddModalOpen.value = true }
const closeAddModal = () => { isAddModalOpen.value = false }

const openBulkAddModal = () => { isBulkAddModalOpen.value = true }
const closeBulkAddModal = () => { isBulkAddModalOpen.value = false }

const handleFileUpload = (event) => {
  file.value = event.target.files[0]
}

const handleBulkAdd = async () => {
  if (!file.value) {
    alert("Please upload an Excel file.")
    return
  }
  try {
    const formData = new FormData()
    formData.append('file', file.value)
    await studentStore.bulkAddStudents(formData)
    alert("Students added successfully.")
    closeBulkAddModal()
  } catch (error) {
    console.error("Error adding Students:", error)
  }
}

onMounted(async () => {
  await studentStore.fetchStudents()
})

const handleAddStudent = async () => {
  try {
    await studentStore.addStudent(newStudent.value)
    closeAddModal()
  } catch (error) {
    console.error("Error adding Student:", error)
  }
}

// Bulk selection
const selectAll = (event) => {
  selectedStudents.value = event.target.checked ? paginatedStudents.value.map(student => student.id) : []
}

// Bulk delete function
const bulkDelete = async () => {
  if (selectedStudents.value.length === 0) return
  const confirmed = confirm(`Are you sure you want to delete ${selectedStudents.value.length} student(s)?`)
  if (!confirmed) return
  try {
    await Promise.all(selectedStudents.value.map(id => studentStore.deleteStudent(id)))
    selectedStudents.value = []
    await studentStore.fetchStudents()
    alert("Selected students deleted successfully.")
  } catch (error) {
    console.error("Error deleting selected students:", error)
  }
}

const openConfirmationModal = (id) => {
  studentIdToDelete.value = id;
  isConfirmationModalOpen.value = true;
};

const closeConfirmationModal = () => {
  isConfirmationModalOpen.value = false;
  studentIdToDelete.value = null;
};

const deleteStudent = async (id) => {
  try {
    await studentStore.deleteStudent(id);
    await studentStore.fetchStudents();
    alert("Student deleted successfully.");
  } catch (error) {
    console.error('Error deleting student:', error);
  }
};

const students = computed(() => studentStore.students)

const filteredStudents = computed(() => {
  if (!searchQuery.value) return students.value;
  const query = searchQuery.value.toLowerCase();
  
  return students.value.filter(student => 
    `${student.first_name ?? ''} ${student.middle_name ?? ''} ${student.last_name ?? ''}`.toLowerCase().includes(query) ||
    (student.email ?? '').toLowerCase().includes(query) ||
    (student.course ?? '').toLowerCase().includes(query) ||
    (student.year_and_section ?? '').toLowerCase().includes(query) ||
    (student.student_type ?? '').toLowerCase().includes(query)
  );
});

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStudents.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / pageSize.value))

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const previousPage = () => { if (currentPage.value > 1) currentPage.value-- }

</script>
