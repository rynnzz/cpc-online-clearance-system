<template>
  <div class="p-8 bg-gray-900 text-gray-100 w-full">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <h1 class="text-4xl sm:text-2xl font-bold mb-4 sm:mb-0">Manage Teacher Accounts</h1>
      <div class="flex space-x-2">
        <button @click="openAddModal" class="btn btn-primary flex items-center">
          <i class="fas fa-plus mr-2"></i> Add New
        </button>
        <button @click="openBulkAddModal" class="btn btn-secondary flex items-center">
          <i class="fas fa-upload mr-2"></i> Bulk Add
        </button>
      </div>
    </div>

    <!-- Search bar section -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div class="relative w-full sm:w-1/3 mb-4 sm:mb-0">
          <input
            v-model="searchQuery"
            @input="filterTeachers"
            type="text"
            placeholder="Search by name or email"
            class="input input-bordered w-full bg-gray-800 text-white border border-gray-700 p-2 pl-10 rounded-md"
          />
          <i class="fas fa-search absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"></i>
        </div>
        <button @click="bulkDelete" :disabled="!selectedTeachers.length" class="btn btn-error flex items-center">
          <i class="fas fa-trash mr-2"></i> Delete Selected
        </button>
      </div>

    <table class="table-auto overflow-x-auto w-full bg-gray-800 shadow-md border border-gray-700">
      <thead>
        <tr class="bg-gray-700">
          <th class="p-4 text-sm text-left">
            <input type="checkbox" @change="selectAll($event)" />
          </th>
          <th class="p-4 text-sm text-left">#</th>
          <th class="p-4 text-sm text-left">Full Name</th>
          <th class="p-4 text-sm text-left">Email</th>
          <th class="p-4 text-sm text-left">Role/s</th>
          <th class="p-4 text-sm text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(teacher, index) in filteredTeachers" :key="teacher.id" class="border-b border-gray-700 hover:bg-gray-600">
          <td class="p-4 text-sm">
            <input type="checkbox" :value="teacher.id" v-model="selectedTeachers" />
          </td>
          <td class="p-4 text-sm"> {{ index + 1 }}</td>
          <td class="p-4 text-sm">{{ teacher.last_name }}, {{ teacher.first_name }} {{ teacher.middle_name }}</td>
          <td class="p-4 text-sm">{{ teacher.email }}</td>
          <td class="p-4 text-sm">{{ teacher.roles ? teacher.roles.join(', ') : 'N/A' }}</td>

          <td class="p-4 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <button @click="openEditModal(teacher)" class="btn btn-warning text-xs sm:text-sm"><i class="fas fa-edit"></i></button>
            <button @click="openConfirmationModal(teacher.id)" class="btn btn-error text-xs sm:text-sm"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-end items-center my-4">
      <button @click="previousPage" class="btn btn-primary mr-2" :disabled="currentPage === 1">Previous</button>
      <span class="mr-4">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" class="btn btn-primary ml-2" :disabled="currentPage >= totalPages">Next</button>
    </div>

    <!-- Bulk Add Modal -->
    <div v-if="isBulkAddModalOpen" class="modal modal-open">
      <div class="modal-box bg-gray-800 text-white">
        <h2 class="text-2xl font-semibold mb-4">Bulk Add Teachers</h2>
        <form @submit.prevent="handleBulkAdd">
          <div class="mb-4">
            <input type="file" @change="handleFileUpload" class="file-input file-input-bordered w-full bg-gray-700" accept=".xlsx, .xls" />
          </div>
          <div class="modal-action mt-4">
            <button type="button" class="btn btn-secondary" @click="closeBulkAddModal">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Teachers</button>
          </div>
        </form>
      </div>
    </div>

    <AddTeacherModal :isOpen="isAddModalOpen" :closeModal="closeAddModal" />
    <EditTeacherModal :isOpen="isEditModalOpen" :closeModal="closeEditModal" :teacher="currentTeacher" />
    <input type="checkbox" id="confirmation-modal" class="modal-toggle" v-model="isConfirmationModalOpen" />
    <div class="modal">
      <div class="modal-box">
        <h2 class="text-lg font-bold">Confirm Deletion</h2>
        <p class="py-4">Are you sure you want to delete this teacher? This action cannot be undone.</p>
        <div class="modal-action">
          <button class="btn" @click="deleteTeacher(teacherIdToDelete)">Yes, Delete</button>
          <button class="btn" @click="closeConfirmationModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useTeacherStore } from '@/stores/teacherStore';
import AddTeacherModal from '@/components/AddTeacherModal.vue';
import EditTeacherModal from '@/components/EditTeacherModal.vue';

const teacherStore = useTeacherStore();
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isBulkAddModalOpen = ref(false);
const isConfirmationModalOpen = ref(false);
const teacherIdToDelete = ref(null);
const currentTeacher = ref({});
const file = ref(null);
const searchQuery = ref(''); // Search query for filtering
const selectedTeachers = ref([]); // List of selected teacher IDs for bulk actions

const currentPage = ref(1);
const pageSize = ref(10);

const handleFileUpload = (event) => {
  file.value = event.target.files[0];
};

const handleBulkAdd = async () => {
  if (!file.value) {
    alert("Please upload an Excel file.");
    return;
  }
  try {
    const formData = new FormData();
    formData.append('file', file.value);
    
    await teacherStore.bulkAddTeachers(formData);
    alert("Teachers added successfully.");
    closeBulkAddModal();
  } catch (error) {
    console.error("Error adding Teachers:", error);
  }
};

onMounted(async () => {
  await teacherStore.fetchTeachers();
});

const teachers = computed(() => teacherStore.teachers || []);

// Computed properties for pagination
const filteredTeachers = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return teachers.value
    .filter(teacher => 
      teacher.first_name.toLowerCase().includes(query) ||
      teacher.last_name.toLowerCase().includes(query) ||
      teacher.email.toLowerCase().includes(query)
    )
    .slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
});

const totalPages = computed(() => Math.ceil(teachers.value.length / pageSize.value));

// Pagination methods
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

// Bulk selection methods
const selectAll = (event) => {
  if (event.target.checked) {
    selectedTeachers.value = filteredTeachers.value.map(teacher => teacher.id);
  } else {
    selectedTeachers.value = [];
  }
};

// Bulk delete function
const bulkDelete = async () => {
  if (selectedTeachers.value.length === 0) return;

  const confirmed = confirm(`Are you sure you want to delete ${selectedTeachers.value.length} teacher(s)?`);
  if (!confirmed) return;

  try {
    await Promise.all(selectedTeachers.value.map(id => teacherStore.deleteTeacher(id)));
    selectedTeachers.value = []; // Clear selection after deletion
    await teacherStore.fetchTeachers();
    alert("Selected teachers deleted successfully.");
  } catch (error) {
    console.error("Error deleting selected teachers:", error);
  }
};

// Search filter function
const filterTeachers = () => {
  currentPage.value = 1; // Reset to first page when filtering
};

const openAddModal = () => (isAddModalOpen.value = true);
const closeAddModal = () => {
  isAddModalOpen.value = false
};

const openBulkAddModal = () => (isBulkAddModalOpen.value = true);
const closeBulkAddModal = () => (isBulkAddModalOpen.value = false);

const openEditModal = (teacher) => {
  console.log("Selected teacher:", teacher);
  currentTeacher.value = { ...teacher };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  currentTeacher.value = {};
};

const openConfirmationModal = (id) => {
  teacherIdToDelete.value = id;
  isConfirmationModalOpen.value = true;
};

const closeConfirmationModal = () => {
  isConfirmationModalOpen.value = false;
  teacherIdToDelete.value = null;
};

const deleteTeacher = async (id) => {
  try {
    await teacherStore.deleteTeacher(id);
    await teacherStore.fetchTeachers();
    closeConfirmationModal();
  } catch (error) {
    console.error('Error deleting teacher:', error);
  }
};
</script>
