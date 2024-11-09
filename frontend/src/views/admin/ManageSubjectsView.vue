<template>
  <div class="p-8 bg-gray-900 text-gray-100 min-h-screen w-full relative" :class="{ 'pointer-events-none': showAddModal || showEditModal }">
    <h1 class="text-3xl font-semibold mb-6">Manage Subjects</h1>

    <!-- Button to Open Add Subject Modal -->
    <button @click="openAddModal" class="btn btn-primary mb-6">Add New Subject</button>

    <!-- Add Subject Modal -->
    <div v-if="showAddModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl pointer-events-auto">
        <h2 class="text-2xl font-semibold mb-4">Add New Subject</h2>
        <form @submit.prevent="addSubject">
          <div class="mb-4">
            <label class="block mb-2 text-lg">Subject Name</label>
            <input v-model="subjectData.name" type="text" class="input input-bordered w-full" placeholder="Enter subject name" required />
          </div>
          <div class="mb-4">
            <label class="block mb-2 text-lg">School Year</label>
            <input v-model="subjectData.schoolYear" type="text" class="input input-bordered w-full" placeholder="e.g., 2024-2025" required />
          </div>
          <div class="mb-4">
            <label class="block mb-2 text-lg">Semester</label>
            <select v-model="subjectData.semester" class="input input-bordered w-full" required>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
            </select>
          </div>
          <div class="flex justify-end space-x-4">
            <button type="button" @click="closeAddModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Subject</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Subject Modal -->
    <div v-if="showEditModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl pointer-events-auto">
        <h2 class="text-2xl font-semibold mb-4">Edit Subject</h2>
        <form @submit.prevent="saveEdit">
          <div class="mb-4">
            <label class="block mb-2 text-lg">Subject Name</label>
            <input v-model="subjectData.name" type="text" class="input input-bordered w-full" placeholder="Enter subject name" required />
          </div>
          <div class="mb-4">
            <label class="block mb-2 text-lg">School Year</label>
            <input v-model="subjectData.schoolYear" type="text" class="input input-bordered w-full" placeholder="e.g., 2024-2025" required />
          </div>
          <div class="mb-4">
            <label class="block mb-2 text-lg">Semester</label>
            <select v-model="subjectData.semester" class="input input-bordered w-full" required>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
            </select>
          </div>
          <div class="flex justify-end space-x-4">
            <button type="button" @click="closeEditModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Subject Table -->
    <div class="bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4">Subjects List</h2>
      <table class="table w-full">
        <thead>
          <tr class="bg-gray-700">
            <th class="p-4 text-left">Subject ID</th>
            <th class="p-4 text-left">Subject Name</th>
            <th class="p-4 text-left">School Year</th>
            <th class="p-4 text-left">Semester</th>
            <th class="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in subjectStore.subjects" :key="subject.id" class="hover:bg-gray-600">
            <td class="p-4">{{ subject.id }}</td>
            <td class="p-4">{{ subject.name }}</td>
            <td class="p-4">{{ subject.schoolYear }}</td>
            <td class="p-4">{{ subject.semester === 1 ? '1st Semester' : '2nd Semester' }}</td>
            <td class="p-4">
              <button @click="openEditModal(subject)" class="btn btn-sm btn-warning mr-2">Edit</button>
              <button @click="deleteSubject(subject.id)" class="btn btn-sm btn-error">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSubjectStore } from '@/stores/subjectStore';

const subjectStore = useSubjectStore();

const subjectData = ref({ name: '', schoolYear: '', semester: 1 });
const showAddModal = ref(false);
const showEditModal = ref(false);
const editSubjectId = ref(null);

onMounted(() => {
  subjectStore.getAllSubjects();
});

// Open Add Modal
const openAddModal = () => {
  showAddModal.value = true;
};

// Close Add Modal
const closeAddModal = () => {
  showAddModal.value = false;
  resetForm();
};

// Open Edit Modal
const openEditModal = (subject) => {
  subjectData.value = { ...subject };
  editSubjectId.value = subject.id;
  showEditModal.value = true;
};

// Close Edit Modal
const closeEditModal = () => {
  showEditModal.value = false;
  resetForm();
};

// Add a new subject
const addSubject = async () => {
  await subjectStore.addSubject({ 
    name: subjectData.value.name, 
    schoolYear: subjectData.value.schoolYear, 
    semester: subjectData.value.semester 
  });
  closeAddModal();
};

// Save changes to an edited subject
const saveEdit = async () => {
  await subjectStore.updateSubject(editSubjectId.value, { 
    name: subjectData.value.name, 
    schoolYear: subjectData.value.schoolYear, 
    semester: subjectData.value.semester 
  });
  closeEditModal();
};

// Delete a subject
const deleteSubject = async (id) => {
  await subjectStore.deleteSubject(id);
};

// Reset form
const resetForm = () => {
  subjectData.value = { name: '', schoolYear: '', semester: 1 };
  editSubjectId.value = null;
};
</script>

<style scoped>
.pointer-events-none {
  pointer-events: none;
}
.pointer-events-auto {
  pointer-events: auto;
}
</style>
