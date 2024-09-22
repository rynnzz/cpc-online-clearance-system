<template>
    <div class="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50" v-if="isOpen">
      <div class="bg-gray-800 p-6 rounded shadow-lg w-1/2">
        <h2 class="text-2xl mb-4">Bulk Add Teachers</h2>
        <form @submit.prevent="bulkAddTeachers">
          <textarea
            v-model="bulkInput"
            placeholder="Enter teacher details (one per line, format: first_name,middle_name,last_name,email,password,degree,yr_and_section,student_type)"
            class="input w-full bg-gray-700 text-white mb-4"
            rows="10"
            required
          ></textarea>
          <div class="mt-6 flex justify-end space-x-2">
            <button @click="closeModal" type="button" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Add Teachers
            </button>
          </div>
        </form>
        <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useTeacherStore } from '@/stores/teacherStore';
  
  const props = defineProps({
    isOpen: Boolean,
    closeModal: Function
  });
  
  const bulkInput = ref('');
  const errorMessage = ref('');
  const teacherStore = useTeacherStore();
  
  const bulkAddTeachers = async () => {
    const teachers = bulkInput.value
      .split('\n')
      .map(line => {
        const [first_name, middle_name, last_name, email, password, degree, yr_and_section, student_type] = line.split(',');
        return { first_name, middle_name, last_name, email, password, degree, yr_and_section, student_type };
      })
      .filter(teacher => teacher.first_name && teacher.last_name && teacher.email); // Filter out incomplete entries
  
    try {
      await teacherStore.bulkAddTeachers(teachers);
      bulkInput.value = '';
      props.closeModal();
    } catch (error) {
      errorMessage.value = 'Failed to add teachers. Please check the input format.';
      console.error('Bulk add error:', error);
    }
  };
  </script>
  
  <style scoped>
  .bg-gray-900 {
    background-color: #1f2937; /* Dark background */
  }
  
  .bg-gray-800 {
    background-color: #2d3748; /* Darker modal background */
  }
  
  .input {
    border: 1px solid #4b5563; /* Dark border */
    border-radius: 0.375rem; /* Rounded corners */
    padding: 0.5rem; /* Padding for inputs */
    width: 100%; /* Full width */
  }
  </style>
  