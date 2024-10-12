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

          <div class="flex justify-end">
            <button type="submit" class="btn btn-primary">Complete Setup</button>
          </div>
          
        </form>
        <div class="flex justify-end">
            <button @click="closeModal" class="btn btn-secondary">Close</button>
          </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTeacherStore } from '@/stores/teacherStore';
import { useSubjectStore } from '@/stores/subjectStore';

const props = defineProps({
  isOpen: Boolean,
  closeModal: Function,
});

const subjectStore = useSubjectStore();

onMounted(async () => {
  try {
    await subjectStore.getAllSubjects(); // Fetch subjects on modal mount
  } catch (err) {
    console.error('Error fetching subjects:', err);
  }
});

const availableSubjects = computed(() => subjectStore.subjects);

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

// Submit form data
const submitSetup = async () => {
  try {
    // Transform setupData for backend
    const formattedData = setupData.value.sections.map(section => ({
      course: section.course,
      year_and_section: section.year_and_section,
      subjects: section.subjects,
    }));
    
    await teacherStore.addYearSection(formattedData);
    console.log('Returned Data:', formattedData); // Log the formatted data
    alert('Year and Section added successfully');
    props.closeModal(); // Close modal after successful submission
  } catch (error) {
    console.error('Error submitting setup data:', error);
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
