<template>
  <transition name="modal-fade" appear>
    <!-- Modal only shows if isOpen is true -->
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex justify-center items-start overflow-y-auto">
      <div class="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-4xl transform transition-transform duration-300 scale-95">
        <!-- Modal Header -->
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold text-white">Welcome to the First-Time Setup!</h2>
          <p class="text-lg text-gray-400 mt-2">Please complete this setup to get started.</p>
        </div>

        <form @submit.prevent="submitSetup">
          <!-- Step 1: Select Subjects -->
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-white">Select Your Subjects</h3>
            <div class="mb-4">
              <label class="block text-sm font-bold text-gray-300 mb-2">Select Subjects:</label>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="subject in availableSubjects" :key="subject.id" class="flex items-center">
                  <input type="checkbox" :value="subject.name" v-model="selectedSubjects" />
                  <label class="ml-2 text-gray-300">{{ subject.name }}</label>
                </div>
              </div>
            </div>
          </div>

          <!-- Complete Setup Button -->
          <div class="flex justify-end">
            <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold text-lg">Complete Setup</button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSubjectStore } from '@/stores/subjectStore';
import { useStudentStore } from '@/stores/studentStore';

// Props from parent component
const props = defineProps({
  isOpen: Boolean,
  closeModal: Function,
});

const subjectStore = useSubjectStore();
const studentStore = useStudentStore();

// State to hold selected subjects
const selectedSubjects = ref([]);

// Fetch all available subjects when the component is mounted
onMounted(() => {
  try {
    subjectStore.getAllSubjects(); // Fetch subjects on modal mount
  } catch (err) {
    console.error('Error fetching subjects:', err);
  }
});

// Get available subjects from the store
const availableSubjects = computed(() => subjectStore.subjects);

// Submit form data to add selected subjects for the student
const submitSetup = async () => {
  try {
    console.log('Selected Subjects:', selectedSubjects.value); // Log selected subjects

    // Prepare data payload for the store
    const payload = {
      subjects: selectedSubjects.value,
    };

    // Send the payload to the store
    await studentStore.addSubject(payload);

    console.log('Payload sent:', payload)

    // Mark first login as complete
    localStorage.setItem('isFirstLogin', '0');

    alert('Subjects added successfully');
    props.closeModal(); // Close modal after successful submission
  } catch (error) {
    console.error('Error submitting setup data:', error);
  }
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
