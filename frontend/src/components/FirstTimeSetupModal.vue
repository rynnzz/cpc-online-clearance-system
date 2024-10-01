<template>
  <transition name="modal-fade" appear>
    <div v-if="isOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center overflow-y-auto">
      <div class="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-6xl h-auto transform transition-transform duration-300 scale-95 overflow-y-auto">
        <h2 class="text-2xl font-semibold mb-4 text-primary">First-Time Setup</h2>

        <form @submit.prevent="submitSetup">
          <!-- Loop over each section -->
          <div v-for="(section, index) in setupData.sections" :key="index" class="mb-6 border p-4 rounded-md">
            <!-- Course Selection -->
            <div class="mb-4">
              <label class="block text-sm font-bold mb-2">Select Course:</label>
              <select v-model="section.course" class="input input-bordered w-full" required>
                <option value="" disabled>Select Course</option>
                <option value="BSIT">BSIT</option>
                <option value="BSHM">BSHM</option>
                <option value="BSED">BSED</option>
                <option value="BEED">BEED</option>
              </select>
            </div>

            <!-- Year and Section Input -->
            <div class="mb-4">
              <label class="block text-sm font-bold mb-2">Year and Section:</label>
              <input
                v-model="section.year_and_section"
                type="text"
                placeholder="Year and Section"
                class="input input-bordered w-full"
                required
              />
            </div>

            <!-- Subject Selection -->
            <div class="mb-4">
              <label class="block text-sm font-bold mb-2">Select Subjects:</label>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="subject in availableSubjects" :key="subject.id" class="flex items-center">
                  <input type="checkbox" :value="subject.name" v-model="section.subjects" />
                  <label class="ml-2">{{ subject.name }}</label>
                </div>
              </div>
            </div>

            <!-- Remove Section Button -->
            <div class="flex justify-end">
              <button type="button" class="btn btn-error" @click="removeSection(index)">Remove Section</button>
            </div>
          </div>

          <!-- Add New Section Button -->
          <div class="flex justify-start mb-6">
            <button type="button" class="btn btn-secondary" @click="addSection">Add Another Section</button>
          </div>

          <!-- Signature Pad -->
          <div class="mb-6">
            <label class="block text-sm font-bold mb-2">Draw Your Signature:</label>
            <div ref="signaturePadContainer" class="signature-pad-container mb-4">
              <canvas ref="canvasRef" width="400" height="200"></canvas>
            </div>
            <button type="button" @click="clearSignature" class="btn btn-secondary mb-4">Clear Signature</button>
          </div>

          <div class="flex justify-end">
            <button type="submit" class="btn btn-primary">Complete Setup</button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import SignaturePad from 'signature_pad';
import { useTeacherStore } from '@/stores/teacherStore';

const props = defineProps({
  isOpen: Boolean,
  closeModal: Function,
});

// Available subjects (can be fetched from the backend as well)
const availableSubjects = ref([
  { id: 1, name: 'System Administration' },
  { id: 2, name: 'Advanced Mathematics' },
  { id: 3, name: 'Programming Basics' }
]);

const teacherStore = useTeacherStore();
const setupData = ref({
  sections: [
    {
      course: '',
      year_and_section: '',
      subjects: []
    }
  ],
  signature: null
});

// Canvas and SignaturePad references
const canvasRef = ref(null);
const signaturePad = ref(null);

// Initialize SignaturePad when the modal opens, ensuring canvas is rendered
watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      await nextTick(); // Wait for DOM update, ensuring canvas is available
      if (canvasRef.value) {
        signaturePad.value = new SignaturePad(canvasRef.value.getContext('2d'), {
          backgroundColor: 'rgb(255, 255, 255)', // Set canvas background to white
          penColor: 'rgb(0, 0, 0)' // Set pen color to black
        });
      }
    }
  }
);

// Clear the signature pad
const clearSignature = () => {
  if (signaturePad.value) {
    signaturePad.value.clear();
  }
};

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

// Submit the setup form
const submitSetup = async () => {
  if (signaturePad.value.isEmpty()) {
    alert('Please provide a signature.');
    return;
  }

  // Capture signature image as Base64
  setupData.value.signature = signaturePad.value.toDataURL();

  try {
    // Send setup data to the store (you might send it to the backend)
    await teacherStore.completeFirstLoginSetup(setupData.value);
    alert('Setup completed successfully!');
    props.closeModal(); // Close modal
  } catch (error) {
    console.error('Error completing setup:', error);
    alert('An error occurred. Please try again.');
  }
};
</script>


<style scoped>
.signature-pad-container {
  border: 1px solid #000;
  width: 400px;
  height: 200px;
  background-color: white;
}
</style>
