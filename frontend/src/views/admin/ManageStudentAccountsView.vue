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
          <th>ID Number</th>
          <th>Full Name</th>
          <th>Email</th>
          <th>Course</th>
          <th>Section</th>
          <th>Student Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(student, index) in paginatedStudents" :key="student.id" class="hover:bg-gray-600">
          <td><input type="checkbox" :value="student.student_id" v-model="selectedStudents" /></td>
          <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
          <td>{{ student.id_num }}</td>
          <td>{{ student.first_name }} {{ student.middle_name }} {{ student.last_name }}</td>
          <td>{{ student.email }}</td>
          <td>{{ student.course }}</td>
          <td>{{ student.section }}</td>
          <td>{{ student.student_type }}</td>
          <td class="flex space-x-2">
            <button @click="editStudent(student)" class="btn btn-warning">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="openConfirmationModal(student.student_id)" class="btn btn-error">
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
    <div class="modal-box bg-gray-800 text-white w-full max-w-4xl">
      <h2 class="text-2xl font-semibold mb-4">Add Student</h2>
      <form novalidate @submit.prevent="handleAddStudent">
        <div class="grid grid-cols-2 gap-4">
          <!-- Row 1 -->
          <div class="col-span-1">
            <input
              v-model="newStudent.id_num"
              type="text"
              placeholder="ID Number"
              :class="['input input-bordered w-full bg-gray-700', errors.id_num ? 'border-red-500' : '']"
            />
            <span v-if="errors.id_num" class="text-red-500 text-sm">{{ errors.id_num }}</span>
          </div>
          <div class="col-span-1">
            <input
              v-model="newStudent.first_name"
              type="text"
              placeholder="First Name"
              :class="['input input-bordered w-full bg-gray-700', errors.first_name ? 'border-red-500' : '']"
            />
            <span v-if="errors.first_name" class="text-red-500 text-sm">{{ errors.first_name }}</span>
          </div>
          <div class="col-span-1">
            <input
              v-model="newStudent.middle_name"
              type="text"
              placeholder="Middle Name"
              :class="['input input-bordered w-full bg-gray-700', errors.middle_name ? 'border-red-500' : '']"
            />
            <span v-if="errors.middle_name" class="text-red-500 text-sm">{{ errors.middle_name }}</span>
          </div>
          <!-- Row 2 -->
          <div class="col-span-1">
            <input
              v-model="newStudent.last_name"
              type="text"
              placeholder="Last Name"
              :class="['input input-bordered w-full bg-gray-700', errors.last_name ? 'border-red-500' : '']"
            />
            <span v-if="errors.last_name" class="text-red-500 text-sm">{{ errors.last_name }}</span>
          </div>
          <div class="col-span-1">
            <input
              v-model="newStudent.email"
              type="email"
              placeholder="Email"
              :class="['input input-bordered w-full bg-gray-700', errors.email ? 'border-red-500' : '']"
            />
            <span v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</span>
          </div>
          <!-- Row 3 -->
          <div class="col-span-1">
            <select
              v-model="newStudent.course"
              :class="['select select-bordered w-full bg-gray-700', errors.course ? 'border-red-500' : '']"
            >
              <option value="" disabled>Select Course</option>
              <option value="BSIT">BSIT</option>
              <option value="BSHM">BSHM</option>
              <option value="BEED">BEED</option>
              <option value="BSED - MAJOR IN ENGLISH">BSED - MAJOR IN ENGLISH</option>
              <option value="BSED - MAJOR IN SCIENCE">BSED - MAJOR IN SCIENCE</option>
            </select>
            <span v-if="errors.course" class="text-red-500 text-sm">{{ errors.course }}</span>
          </div>
          <div class="col-span-1">
            <select
              v-model="newStudent.year"
              :class="['select select-bordered w-full bg-gray-700', errors.year ? 'border-red-500' : '']"
            >
              <option value="" disabled>Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
            <span v-if="errors.year" class="text-red-500 text-sm">{{ errors.year }}</span>
          </div>
          <!-- Row 4 -->
          <div class="col-span-1">
            <input
              v-model="newStudent.section"
              type="text"
              placeholder="Section (e.g., 1A)"
              :class="['input input-bordered w-full bg-gray-700', errors.section ? 'border-red-500' : '']"
            />
            <span v-if="errors.section" class="text-red-500 text-sm">{{ errors.section }}</span>
          </div>
          <div class="col-span-1">
            <input
              v-model="newStudent.password"
              type="password"
              placeholder="Password"
              :class="['input input-bordered w-full bg-gray-700', errors.password ? 'border-red-500' : '']"
            />
            <span v-if="errors.password" class="text-red-500 text-sm">{{ errors.password }}</span>
          </div>
          <!-- Row 5 -->
          <div class="col-span-1">
            <select
              v-model="newStudent.student_type"
              :class="['select select-bordered w-full bg-gray-700', errors.student_type ? 'border-red-500' : '']"
            >
              <option value="" disabled>Select Student Type</option>
              <option value="Regular">Regular</option>
              <option value="Irregular">Irregular</option>
            </select>
            <span v-if="errors.student_type" class="text-red-500 text-sm">{{ errors.student_type }}</span>
          </div>
        </div>
        <div class="modal-action mt-4">
          <button type="button" class="btn btn-secondary" @click="closeAddModal">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Student</button>
        </div>
      </form>
    </div>
  </div>


<div v-if="isEditModalOpen" class="modal modal-open flex justify-center items-center">
  <div class="modal-box bg-gray-800 text-white max-w-4xl w-full rounded-lg shadow-lg">
    <h2 class="text-3xl font-semibold mb-6 text-center">Edit Student</h2>
    <form @submit.prevent="handleEditStudent">
      <div class="grid grid-cols-2 gap-6">
        <!-- First Column -->
        <div class="space-y-4">
          <input 
            v-model="editedStudent.first_name" 
            type="text" 
            placeholder="First Name" 
            class="input input-bordered w-full bg-gray-700" 
            required 
          />
          <input 
            v-model="editedStudent.middle_name" 
            type="text" 
            placeholder="Middle Name" 
            class="input input-bordered w-full bg-gray-700" 
          />
          <input 
            v-model="editedStudent.last_name" 
            type="text" 
            placeholder="Last Name" 
            class="input input-bordered w-full bg-gray-700" 
            required 
          />
          <input 
            v-model="editedStudent.email" 
            type="email" 
            placeholder="Email" 
            class="input input-bordered w-full bg-gray-700" 
            required 
          />
        </div>

        <!-- Second Column -->
        <div class="space-y-4">
          <input 
            v-model="editedStudent.password" 
            type="password" 
            placeholder="Password (Optional)" 
            class="input input-bordered w-full bg-gray-700" 
          />
          <select 
            v-model="editedStudent.course" 
            class="select select-bordered w-full bg-gray-700" 
            required
          >
            <option value="" disabled>Select Course</option>
            <option value="BSIT">BSIT</option>
            <option value="BSHM">BSHM</option>
            <option value="BEED">BEED</option>
            <option value="BSED - MAJOR IN ENGLISH">BSED - MAJOR IN ENGLISH</option>
            <option value="BSED - MAJOR IN SCIENCE">BSED - MAJOR IN SCIENCE</option>
          </select>
          <select 
            v-model="editedStudent.year" 
            class="select select-bordered w-full bg-gray-700" 
            required
          >
            <option value="" disabled>Select Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
          <input 
            v-model="editedStudent.section" 
            type="text" 
            placeholder="Section" 
            class="input input-bordered w-full bg-gray-700" 
            required 
          />
        </div>
      </div>

      <div class="mt-6">
        <select 
          v-model="editedStudent.student_type" 
          class="select select-bordered w-full bg-gray-700" 
          required
        >
          <option value="" disabled>Select Student Type</option>
          <option value="Regular">Regular</option>
          <option value="Irregular">Irregular</option>
        </select>
      </div>

      <div class="modal-action mt-6 flex justify-end">
        <button 
          type="button" 
          class="btn btn-secondary px-6 py-2 text-sm" 
          @click="closeEditModal"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn btn-primary px-6 py-2 text-sm ml-4"
        >
          Save Changes
        </button>
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

const newStudent = ref({ id_num: '', first_name: '', middle_name: '', last_name: '', email: '', password: '', course: '', year: '', section:'', student_type: '' })
const isAddModalOpen = ref(false)
const isBulkAddModalOpen = ref(false)
const searchQuery = ref('')
const file = ref(null)
const selectedStudents = ref([])
const isConfirmationModalOpen = ref(false);
const studentIdToDelete = ref(null);
const isEditModalOpen = ref(false);
const editedStudent = ref({});
const errors = ref({});

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
  // Inline Validation
  errors.value = {}; // Reset errors

  if (!newStudent.value.id_num) errors.value.id_num = 'ID Number is required.';
  if (!newStudent.value.first_name) errors.value.first_name = 'First Name is required.';
  if (!newStudent.value.middle_name) errors.value.middle_name = 'Middle Name is required.';
  if (!newStudent.value.last_name) errors.value.last_name = 'Last Name is required.';
  if (!newStudent.value.email) {
    errors.value.email = 'Email is required.';
  } else if (!/\S+@\S+\.\S+/.test(newStudent.value.email)) {
    errors.value.email = 'Invalid email format.';
  }
  if (!newStudent.value.course) errors.value.course = 'Course is required.';
  if (!newStudent.value.year) errors.value.year = 'Year is required.';
  if (!newStudent.value.section) errors.value.section = 'Section is required.';
  if (!newStudent.value.password) {
    errors.value.password = 'Password is required.';
  } else if (newStudent.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters.';
  }
  if (!newStudent.value.student_type) errors.value.student_type = 'Student Type is required.';

  // Check if there are any validation errors
  if (Object.keys(errors.value).length > 0) {
    console.error('Validation failed:', errors.value);
    return;
  }

  try {
    await studentStore.addStudent(newStudent.value); // Call API or store method
    closeAddModal(); // Close the modal after successful addition
  } catch (error) {
    console.error('Error adding Student:', error);
  }
};

// Bulk selection
const selectAll = (event) => {
  selectedStudents.value = event.target.checked ? paginatedStudents.value.map(student => student.student_id) : []
  console.log(selectedStudents.value)
}

const editStudent = (student) => {
  editedStudent.value = { ...student }; // Copy the selected student data
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const handleEditStudent = async () => {
  try {
    await studentStore.updateStudent(editedStudent.value.student_id, editedStudent.value);
    await studentStore.fetchStudents(); // Fetch updated student data to reflect the changes in the table
    alert("Student details updated successfully.");
    closeEditModal();
  } catch (error) {
    console.error("Error updating student:", error);
  }
};


// Bulk delete function
const bulkDelete = async () => {
  if (selectedStudents.value.length === 0) return;
  console.log(selectedStudents.value)

  const confirmed = confirm(`Are you sure you want to delete ${selectedStudents.value.length} student(s)?`);
  if (!confirmed) return;

  try {
    await Promise.all(selectedStudents.value.map(id => studentStore.deleteStudent(id)));
    selectedStudents.value = []; // Clear selection after deletion
    await studentStore.fetchStudents();
    alert("Selected students deleted successfully.");
  } catch (error) {
    console.error("Error deleting selected students:", error);
  }
};


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
    closeConfirmationModal()
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
    String(student.id_num ?? '').toLowerCase().includes(query) || // Convert id_num to string
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
