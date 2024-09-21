<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <div class="flex flex-1">
      <Sidebar />
      <div class="flex-1 p-8 bg-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-4xl font-bold">Manage Teacher Accounts</h1>
          <button @click="openAddModal" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center">
            <i class="fas fa-plus mr-2"></i> Add New
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="table-auto w-full bg-white shadow rounded">
            <thead>
              <tr class="bg-gray-200 text-left">
                <th class="p-4">#</th>
                <th class="p-4">Full Name</th>
                <th class="p-4">Email</th>
                <th class="p-4">Year & Sections</th>
                <th class="p-4">Subjects</th>
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
                <td class="p-4">
                  <ul>
                    <li v-for="subject in teacher.subjects" :key="subject">{{ subject }}</li>
                  </ul>
                </td>
                <td class="p-4">{{ teacher.teacher_type }}</td>
                <td class="p-4 flex space-x-2">
                  <button @click="openEditModal(teacher)" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteTeacher(teacher.id)" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AddTeacherModal :isOpen="isAddModalOpen" :closeModal="closeAddModal" />
        <EditTeacherModal :isOpen="isEditModalOpen" :closeModal="closeEditModal" :teacher="currentTeacher" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import AddTeacherModal from '@/components/AddTeacherModal.vue';
import EditTeacherModal from '@/components/EditTeacherModal.vue';
import { ref, onMounted, computed } from 'vue';
import { useTeacherStore } from '@/stores/teacherStore';

const teacherStore = useTeacherStore();
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const currentTeacher = ref({});

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

const openEditModal = (teacher) => {
  console.log('Opening edit modal for:', teacher); // Log the teacher being passed
  currentTeacher.value = { ...teacher }; // Clone the teacher object
  isEditModalOpen.value = true;
};



const closeEditModal = () => {
  isEditModalOpen.value = false;
  currentTeacher.value = null;
};

const deleteTeacher = async (id) => {
  try {
    await teacherStore.deleteTeacher(id);
    await teacherStore.fetchTeachers(); // Refresh the list after deletion
  } catch (error) {
    console.error('Error deleting teacher:', error);
  }
};

</script>
