<template>
  <div class="p-8 bg-gray-900 text-gray-100 w-full">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl sm:text-2xl font-bold">Manage Teacher Accounts</h1>
      <div class="flex space-x-2">
        <button @click="openAddModal" class="btn btn-primary flex items-center">
          <i class="fas fa-plus mr-2"></i> Add New
        </button>
        <button @click="openBulkAddModal" class="btn btn-secondary flex items-center">
          <i class="fas fa-upload mr-2"></i> Bulk Add
        </button>
      </div>
    </div>

  <table class="table-auto overflow-x-auto w-full bg-gray-800 shadow-md border border-gray-700">
    <thead>
      <tr class="bg-gray-700">
        <th class="p-4 text-sm text-left">#</th>
        <th class="p-4 text-sm text-left">Full Name</th>
        <th class="p-4 text-sm text-left">Email</th>
        <th class="p-4 text-sm text-left">Teacher Type</th>
        <th class="p-4 text-sm text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(teacher, index) in paginatedTeachers" :key="teacher.id" class="border-b border-gray-700 hover:bg-gray-600 md:overflow-hidden">
        <td class="p-4 text-sm">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
        <td class="p-4 text-sm">{{ teacher.last_name }}, {{ teacher.first_name }} {{ teacher.middle_name }}</td>
        <td class="p-4 text-sm">{{ teacher.email }}</td>
        <td class="p-4 text-sm">{{ teacher.teacher_type }}</td>
        <!-- Adjust button layout for smaller screens -->
        <td class="p-4 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          <button @click="openSubjectsModal(teacher.yearSectionSubjects)" class="btn btn-info text-xs sm:text-sm">
            Subjects
          </button>
          <button @click="openEditModal(teacher)" class="btn btn-warning text-xs sm:text-sm">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="openConfirmationModal(teacher.id)" class="btn btn-error text-xs sm:text-sm">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    </tbody>
  </table>


    <div class="flex justify-end items-center my-4">
  <button @click="previousPage" class="btn btn-primary mr-2" :disabled="currentPage === 1">Previous</button>
  <span class="mr-4">Page {{ currentPage }} of {{ totalPages }}</span>
  <button @click="nextPage" class="btn btn-primary ml-2" :disabled="currentPage >= totalPages">Next</button>
    </div>

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
    <SubjectsModal 
      :isOpen="isSubjectsModalOpen" :closeModal="closeSubjectsModal" :yearSectionSubjects="currentYearSectionSubjects" />
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
import SubjectsModal from '@/components/SubjectsModal.vue';

const teacherStore = useTeacherStore();
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isBulkAddModalOpen = ref(false);
const isSubjectsModalOpen = ref(false);
const isConfirmationModalOpen = ref(false);
const teacherIdToDelete = ref(null);
const currentTeacher = ref({});
const currentYearSectionSubjects = ref([]);
const file = ref(null)

const currentPage = ref(1);
const pageSize = ref(10);

const handleFileUpload = (event) => {
  file.value = event.target.files[0] // Get the uploaded file
}

const handleBulkAdd = async () => {
  if (!file.value) {
    alert("Please upload an Excel file.")
    return
  }
  try {
    const formData = new FormData()
    formData.append('file', file.value)
    
    // Send the form data to the backend
    await teacherStore.bulkAddTeachers(formData)
    alert("Teachers added successfully.")
    closeBulkAddModal()
  } catch (error) {
    console.error("Error adding Teachers:", error)
  }
}

onMounted(async () => {
  await teacherStore.fetchTeachers();
});

const teachers = computed(() => {
  return teacherStore.teachers || [];
});

// Computed properties for pagination
const paginatedTeachers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const paginated = teachers.value.slice(start, start + pageSize.value);
  return paginated;
});


const totalPages = computed(() => {
  return Math.ceil(teachers.value.length / pageSize.value);
});

// Pagination methods
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

const openAddModal = () => {
  isAddModalOpen.value = true;
};

const closeAddModal = () => {
  isAddModalOpen.value = false;
};

const openBulkAddModal = () => {
  isBulkAddModalOpen.value = true;
};

const closeBulkAddModal = () => { 
  isBulkAddModalOpen.value = false
}

const openEditModal = (teacher) => {
  currentTeacher.value = { ...teacher };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  currentTeacher.value = {};
};

const openSubjectsModal = (yearSectionSubjects) => {
  currentYearSectionSubjects.value = yearSectionSubjects;
  isSubjectsModalOpen.value = true;
};

const closeSubjectsModal = () => {
  isSubjectsModalOpen.value = false;
  currentYearSectionSubjects.value = [];
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
