<template>
  <div class="p-8 relative bg-gray-900 text-gray-100">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">Manage Teacher Accounts</h1>
      <div class="flex space-x-2">
        <button @click="openAddModal" class="btn btn-primary flex items-center">
          <i class="fas fa-plus mr-2"></i> Add New
        </button>
        <button @click="openBulkAddModal" class="btn btn-secondary flex items-center">
          <i class="fas fa-upload mr-2"></i> Bulk Add
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="table w-full bg-gray-800 shadow-md border border-gray-700">
        <thead>
          <tr class="bg-gray-700">
            <th class="p-4">#</th>
            <th class="p-4">Full Name</th>
            <th class="p-4">Email</th>
            <th class="p-4">Year & Sections</th>
            <th class="p-4">Subjects Handled</th>
            <th class="p-4">Teacher Type</th>
            <th class="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(teacher, index) in teachers" :key="teacher.id" class="border-b border-gray-700 hover:bg-gray-600">
            <td class="p-4">{{ index + 1 }}</td>
            <td class="p-4">{{ teacher.last_name }}, {{ teacher.first_name }} {{ teacher.middle_name }}</td>
            <td class="p-4">{{ teacher.email }}</td>
            <td class="p-4">{{ teacher.yr_and_section }}</td>
            <td class="p-4">
              <button @click="openSubjectsModal(teacher.subjects)" class="btn btn-primary w-40">
                View Subjects
              </button>
            </td>
            <td class="p-4">{{ teacher.teacher_type }}</td>
            <td class="p-4 flex space-x-2">
              <button @click="openEditModal(teacher)" class="btn btn-warning">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="openConfirmationModal(teacher.id)" class="btn btn-error">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AddTeacherModal :isOpen="isAddModalOpen" :closeModal="closeAddModal" />
    <EditTeacherModal :isOpen="isEditModalOpen" :closeModal="closeEditModal" :teacher="currentTeacher" />
    <SubjectsModal :isOpen="isSubjectsModalOpen" :subjects="currentSubjects" :closeModal="closeSubjectsModal" />

    <!-- Bulk Add Modal -->
    <BulkAddModal :isOpen="isBulkAddModalOpen" :closeModal="closeBulkAddModal" />

    <!-- Confirmation Modal -->
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
import AddTeacherModal from '@/components/AddTeacherModal.vue';
import EditTeacherModal from '@/components/EditTeacherModal.vue';
import SubjectsModal from '@/components/TeacherSubjectsModal.vue';
import BulkAddModal from '@/components/BulkAddModal.vue'; // Import the BulkAddModal
import { ref, onMounted, computed } from 'vue';
import { useTeacherStore } from '@/stores/teacherStore';

const teacherStore = useTeacherStore();
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isSubjectsModalOpen = ref(false);
const isBulkAddModalOpen = ref(false); // State for Bulk Add Modal
const isConfirmationModalOpen = ref(false);
const teacherIdToDelete = ref(null);
const currentTeacher = ref({});
const currentSubjects = ref([]);

onMounted(async () => {
  await teacherStore.fetchTeachers();
});

const teachers = computed(() => teacherStore.teachers);

const openAddModal = () => {
  isAddModalOpen.value = true;
};

const closeAddModal = () => {
  isAddModalOpen.value = false;
};

const openBulkAddModal = () => {
  isBulkAddModalOpen.value = true; // Open the Bulk Add Modal
};

const closeBulkAddModal = () => {
  isBulkAddModalOpen.value = false; // Close the Bulk Add Modal
};

const openEditModal = (teacher) => {
  currentTeacher.value = { ...teacher };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  currentTeacher.value = {};
};

const openSubjectsModal = (subjects) => {
  currentSubjects.value = subjects;
  isSubjectsModalOpen.value = true;
};

const closeSubjectsModal = () => {
  isSubjectsModalOpen.value = false;
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

<style scoped>
.bg-gray-900 {
  background-color: #1f2937; /* Dark background */
}

.text-gray-100 {
  color: #ffffff; /* Light text */
}

.bg-gray-800 {
  background-color: #2d3748; /* Darker table background */
}

.table {
  border-collapse: collapse;
  width: 100%;
}

.table th,
.table td {
  text-align: left;
  padding: 1rem;
}

.border-b {
  border-bottom: 1px solid #4b5563; /* Dark border for separation */
}

.hover\:bg-gray-600:hover {
  background-color: #4b5563; /* Darker gray for hover effect */
}
</style>
