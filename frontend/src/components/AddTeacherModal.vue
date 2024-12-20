<template>
  <transition name="modal-fade" appear>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div class="modal-box bg-gray-800 text-gray-200 shadow-2xl w-full max-w-3xl rounded-lg p-8">
        <!-- Modal Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-blue-400 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 11a8.1 8.1 0 00-15.5-2M4 4l16 16m-9.5-1.5L12 17m2.5-2.5L15 14" />
            </svg>
            <span>Add Teacher Account</span>
          </h2>
          <button @click="resetForm" class="text-red-500 hover:text-red-700 transition duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleAddTeacher" class="space-y-6">
          <!-- Input Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">First Name</label>
              <input
                v-model="newTeacher.first_name"
                type="text"
                placeholder="Enter first name"
                class="input input-bordered w-full bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Middle Name</label>
              <input
                v-model="newTeacher.middle_name"
                type="text"
                placeholder="Enter middle name"
                class="input input-bordered w-full bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
              <input
                v-model="newTeacher.last_name"
                type="text"
                placeholder="Enter last name"
                class="input input-bordered w-full bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <input
                v-model="newTeacher.email"
                type="email"
                placeholder="Enter email address"
                class="input input-bordered w-full bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                v-model="newTeacher.password"
                type="password"
                placeholder="Enter password"
                class="input input-bordered w-full bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              class="btn bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition duration-200"
              @click="resetForm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition duration-200"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12a8 8 0 018-8M12 4a8 8 0 000 16m0 0a8 8 0 010-16"></path>
                </svg>
                Adding...
              </span>
              <span v-else>Add Teacher</span>
            </button>
          </div>

          <!-- Feedback Messages -->
          <div v-if="message" class="mt-6 text-green-400 text-center text-lg font-semibold">
            {{ message }}
          </div>
          <div v-if="error" class="mt-6 text-red-400 text-center text-lg font-semibold">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from "vue";
import { useTeacherStore } from "@/stores/teacherStore";

const props = defineProps({
  isOpen: Boolean,
  closeModal: Function,
});

const newTeacher = ref({
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  password: "",
});

const message = ref("");
const error = ref("");
const loading = ref(false);

const teacherStore = useTeacherStore();

const handleAddTeacher = async () => {
  loading.value = true;
  error.value = "";
  message.value = "";

  try {
    const formattedData = { ...newTeacher.value };

    // Call store to add teacher
    const response = await teacherStore.addTeacher(formattedData);

    // Check if the email already exists or any other status
    if (response.status === 400) {
      error.value = response.message; // Display backend error
    } else if (response.status === 201) {
      message.value = response.message; // Success message
      resetForm();
    }
  } catch (err) {
    console.error("Error adding teacher:", err);
  } finally {
    loading.value = false;
    setTimeout(() => {
      message.value = "";
      error.value = "";
    }, 5000);
  }
};


const resetForm = () => {
  props.closeModal();
  newTeacher.value = {
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    password: "",
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
