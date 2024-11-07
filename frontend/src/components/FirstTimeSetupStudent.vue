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
          <!-- Step 1: Course and Year Selection -->
          <div class="mb-6">
            <!-- Course Selection -->
            <div class="mb-4">
              <label class="block text-sm font-bold text-gray-300 mb-2">Select Course:</label>
              <select v-model="setupData.course" class="input input-bordered w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-md" required>
                <option value="" disabled>Select Course</option>
                <option value="BSIT">BSIT</option>
                <option value="BSHM">BSHM</option>
                <option value="BSED">BSED</option>
                <option value="BEED">BEED</option>
              </select>
            </div>

            <!-- Year and Section Selection -->
            <div class="mb-4">
              <label class="block text-sm font-bold text-gray-300 mb-2">Year and Section:</label>
              <input
                v-model="setupData.year_and_section"
                type="text"
                placeholder="Year and Section (Sample Format: 1A)"
                class="input input-bordered w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-md"
                required
              />
            </div>
          </div>

          <!-- Step 2: Select Subjects -->
          <h3 class="text-xl mb-4 font-semibold text-white">Select Your Subjects</h3>
          <div class="mb-4">
            <div class="grid grid-cols-2 gap-4">
              <div v-for="subject in availableSubjects" :key="subject.id" class="flex items-center">
                <input type="checkbox" :value="subject.name" v-model="setupData.subjects" />
                <label class="ml-2 text-gray-300">{{ subject.name }}</label>
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

// Unified state for section and selected subjects
const setupData = ref({
  course: '',
  year_and_section: '',
  subjects: []
});

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

// Submit form data with course, year_and_section, and selected subjects
const submitSetup = async () => {
  try {
    // Send the setupData payload to the store
    await studentStore.addSubject(setupData.value);

    console.log('Payload sent:', setupData.value);

    // Mark first login as complete
    localStorage.setItem('isFirstLogin', '0');

    alert('Setup completed successfully');
    props.closeModal(); // Close modal after successful submission
  } catch (error) {
    console.error('Error submitting setup data:', error);
  }
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
