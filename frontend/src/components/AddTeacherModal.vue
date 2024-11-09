<template>
  <transition name="modal-fade" appear>
    <div v-if="isOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-6xl h-4/5 transform transition-transform duration-300 scale-95 overflow-y-auto">
        <h2 class="text-2xl font-semibold mb-4 text-primary">Add Teacher Account</h2>

        <form @submit.prevent="handleAddTeacher">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="col-span-2 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input v-model="newTeacher.first_name" type="text" placeholder="First Name" class="input input-bordered w-full bg-gray-800 text-gray-200 placeholder-gray-400" required />
                <input v-model="newTeacher.middle_name" type="text" placeholder="Middle Name" class="input input-bordered w-full bg-gray-800 text-gray-200 placeholder-gray-400" required />
                <input v-model="newTeacher.last_name" type="text" placeholder="Last Name" class="input input-bordered w-full bg-gray-800 text-gray-200 placeholder-gray-400" required />
                <input v-model="newTeacher.email" type="email" placeholder="Email Address" class="input input-bordered w-full bg-gray-800 text-gray-200 placeholder-gray-400" required />
                <input v-model="newTeacher.password" type="password" placeholder="Password" class="input input-bordered w-full bg-gray-800 text-gray-200 placeholder-gray-400" required />
                <select v-model="newTeacher.teacher_type" class="input input-bordered w-full bg-gray-800 text-gray-200 placeholder-gray-400" required>
                  <option value="" disabled>Select Teacher Type</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-4">
            <button @click="props.closeModal" type="button" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? 'Adding...' : 'Add Teacher' }}</button>
          </div>
        </form>

        <div v-if="message" class="mt-4 text-green-500">{{ message }}</div>
        <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
import { useTeacherStore } from '@/stores/teacherStore';

const props = defineProps({
  isOpen: Boolean,
  closeModal: Function
});

const newTeacher = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  password: '',
  teacher_type: '',
});

const message = ref('');
const error = ref('');
const loading = ref(false);

const teacherStore = useTeacherStore();

const handleAddTeacher = async () => {
  loading.value = true;
  try {
    const formattedData = { ...newTeacher.value };

    await teacherStore.addTeacher(formattedData);
    message.value = 'Teacher added successfully!';
    resetForm();
    props.closeModal();
  } catch (err) {
    console.error('Error adding teacher:', err);
    error.value = 'Failed to add teacher. Please try again.';
  } finally {
    loading.value = false;
    setTimeout(() => {
      message.value = '';
      error.value = '';
    }, 5000);
  }
};

const resetForm = () => {
  newTeacher.value = {
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    teacher_type: '',
  };
};
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter, .modal-fade-leave-to {
  opacity: 0;
}
</style>
