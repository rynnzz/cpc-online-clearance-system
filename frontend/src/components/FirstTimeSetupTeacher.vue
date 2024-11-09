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
          <!-- Step 1: Select Course, Year and Section -->
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-white">Step 1: Course Information</h3>
            <!-- Loop over each section -->
            <div v-for="(section, index) in setupData.sections" :key="index" class="mt-4 p-4 border border-gray-600 rounded-lg">
              <!-- Course Selection -->
              <div class="mb-4">
                <label class="block text-sm font-bold text-gray-300 mb-2">Select Course:</label>
                <select v-model="section.course" class="input input-bordered w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-md" required>
                  <option value="" disabled>Select Course</option>
                  <option value="BSIT">BSIT</option>
                  <option value="BSHM">BSHM</option>
                  <option value="BSED">BSED</option>
                  <option value="BEED">BEED</option>
                </select>
              </div>

              <!-- Year and Section Input -->
              <div class="mb-4">
                <label class="block text-sm font-bold text-gray-300 mb-2">Year and Section:</label>
                <input
                  v-model="section.year_and_section"
                  type="text"
                  placeholder="Year and Section (Sample Format: 1A)"
                  class="input input-bordered w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-md"
                  required
                />
              </div>

              <!-- Subject Selection -->
              <div class="mb-4">
                <label class="block text-sm font-bold text-gray-300 mb-2">Select Subjects:</label>
                <div class="grid grid-cols-2 gap-4">
                  <div v-for="subject in availableSubjects" :key="subject.id" class="flex items-center">
                    <input type="checkbox" :value="subject.name" v-model="section.subjects" />
                    <label class="ml-2 text-gray-300">{{ subject.name }}</label>
                  </div>
                </div>
              </div>

              <!-- Remove Section Button -->
              <div class="flex justify-end">
                <button type="button" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md" @click="removeSection(index)">Remove Section</button>
              </div>
            </div>
          </div>

          <!-- Add New Section Button -->
          <div class="flex justify-start mb-6">
            <button type="button" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md" @click="addSection">Add Another Section</button>
          </div>

          <!-- Step 2: Signature -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-white">Step 2: Draw Your Signature</h3>
            <div class="border-2 border-gray-300 rounded-lg p-4 bg-gray-800">
              <!-- Vue Signature Component -->
              <vue-signature ref="signaturePad" :options="signatureOptions" class="w-full h-80 border border-gray-600 rounded-md"></vue-signature>
              <button type="button" class="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md" @click="clearSignature">Clear Signature</button>
            </div>
          </div>

          <!-- Step 3: Complete Setup -->
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
import { useTeacherStore } from '@/stores/teacherStore';
import { useSubjectStore } from '@/stores/subjectStore';
import { useAuthStore } from '@/stores/authStore';
import VueSignature from 'vue-signature'; // Import vue-signature component

const props = defineProps({
  isOpen: Boolean,
  closeModal: Function,
});

const authStore = useAuthStore(); // Access authStore to check firstLogin
const subjectStore = useSubjectStore();
const teacherStore = useTeacherStore();

const setupData = ref({
  sections: [
    {
      course: '',
      year_and_section: '',
      subjects: []
    }
  ],
});

const signatureOptions = ref({
  penColor: 'black', // Customize pen color
  backgroundColor: 'rgba(0, 0, 0, 0)', // Set background to transparent
});

const signaturePad = ref(null); // Define ref for signature pad

onMounted(() => {
  try {
    subjectStore.getAllSubjects(); // Fetch subjects on modal mount
  } catch (err) {
    console.error('Error fetching subjects:', err);
  }
});

const availableSubjects = computed(() => subjectStore.subjects);

// Add a new section to the form
const addSection = () => {
  setupData.value.sections.push({
    course: '',
    year_and_section: '',
    subjects: []
  });
};

// Remove a section from the form
const removeSection = (index) => {
  if (setupData.value.sections.length > 1) {
    setupData.value.sections.splice(index, 1);
  } else {
    alert('At least one section is required.');
  }
};

// Clear signature pad
const clearSignature = () => {
  if (signaturePad.value) {
    signaturePad.value.clear(); // Access the signature pad directly via the ref
  }
};

// Submit form data including the signature
const submitSetup = async () => {
  try {
    // Transform setupData for backend into an array of sections
    const sections = setupData.value.sections.map(section => ({
      course: section.course,
      year_and_section: section.year_and_section,
      subjects: section.subjects,
    }));

    // Get signature data
    const signature = signaturePad.value.save(); // Save signature as a data URL

    // Prepare the payload with sections as an array and the signature
    const payload = {
      sections,  // Array of sections
      signature  // Single signature for the form
    };

    // Send payload to teacherStore
    await teacherStore.addYearSection(payload); // Pass payload to the backend

    console.log('Payload Sent:', payload); // Log the payload being sent
    localStorage.setItem('isFirstLogin', '0');
   

    alert('Year and Section added successfully');
    props.closeModal(); // Close modal after successful submission
  } catch (error) {
    console.error('Error submitting setup data:', error);
  }
};


</script>

<style scoped>
</style>
