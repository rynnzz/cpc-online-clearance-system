<template>
  <transition name="modal-fade" appear>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div class="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-4xl transform transition-transform duration-300 scale-100">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-semibold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 11a8.1 8.1 0 00-15.5-2M4 4l16 16m-9.5-1.5L12 17m2.5-2.5L15 14" />
            </svg>
            Edit Teacher Account
          </h2>
          <button @click="props.closeModal" class="text-red-500 hover:text-red-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleEditTeacher" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">First Name</label>
              <input
                v-model="currentTeacher.first_name"
                type="text"
                placeholder="Enter first name"
                class="input input-bordered w-full bg-gray-800 text-gray-300 border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Middle Name</label>
              <input
                v-model="currentTeacher.middle_name"
                type="text"
                placeholder="Enter middle name"
                class="input input-bordered w-full bg-gray-800 text-gray-300 border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
              <input
                v-model="currentTeacher.last_name"
                type="text"
                placeholder="Enter last name"
                class="input input-bordered w-full bg-gray-800 text-gray-300 border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input
                v-model="currentTeacher.email"
                type="email"
                placeholder="Enter email address"
                class="input input-bordered w-full bg-gray-800 text-gray-300 border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                required
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                v-model="currentTeacher.password"
                type="password"
                placeholder="Enter new password (optional)"
                class="input input-bordered w-full bg-gray-800 text-gray-300 border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-4">
            <button
              @click="props.closeModal"
              type="button"
              class="btn bg-red-600 text-gray-100 hover:bg-red-700 transition duration-200 px-6 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn bg-blue-600 text-gray-100 hover:bg-blue-700 transition duration-200 px-6 py-2 rounded"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="animate-spin h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M4 12a8 8 0 018-8M12 4a8 8 0 000 16m0 0a8 8 0 010-16"></path>
                </svg>
                Updating...
              </span>
              <span v-else>Update Teacher</span>
            </button>
          </div>
        </form>

        <!-- Messages -->
        <div v-if="message" class="mt-6 text-green-400 text-center">{{ message }}</div>
        <div v-if="error" class="mt-6 text-red-400 text-center">{{ error }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTeacherStore } from '@/stores/teacherStore';

const props = defineProps({
  isOpen: Boolean,
  closeModal: Function,
  teacher: Object
});

// Form Data
const currentTeacher = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  password: ''
});

const message = ref('');
const error = ref('');
const loading = ref(false);

// Store setup
const teacherStore = useTeacherStore();

// Watch for the teacher prop to populate the currentTeacher
watch(() => props.teacher, (newTeacher) => {
  if (newTeacher) {
    currentTeacher.value = { ...newTeacher };
  } else {
    resetForm(); // Reset form if no teacher data
  }
}, { immediate: true });

// Function to handle form submission for updating the teacher
const handleEditTeacher = async () => {
  loading.value = true; // Start loading
  try {
    // Update the teacher details
    await teacherStore.updateTeacher(currentTeacher.value); 
    message.value = 'Teacher updated successfully!';
    resetForm(); // Reset form after submission
    props.closeModal(); // Close modal on success
  } catch (err) {
    console.error('Error updating teacher:', err);
    error.value = 'Failed to update teacher. Please try again.';
  } finally {
    loading.value = false; // End loading
    setTimeout(() => {
      message.value = '';
      error.value = '';
    }, 5000); // Clear messages after 5 seconds
  }
};

// Reset form to default values
const resetForm = () => {
  currentTeacher.value = {
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: ''
  };
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
