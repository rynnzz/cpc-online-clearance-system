<template>
  <transition name="modal-fade" appear>
    <div v-if="isOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-6xl h-4/5 transform transition-transform duration-300 scale-95 overflow-y-auto">
        <h2 class="text-2xl font-semibold mb-4 text-primary">Edit Teacher Account</h2>

        <form @submit.prevent="handleEditTeacher">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="col-span-2 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input v-model="currentTeacher.first_name" type="text" placeholder="First Name" class="input input-bordered w-full" required />
                <input v-model="currentTeacher.middle_name" type="text" placeholder="Middle Name" class="input input-bordered w-full" required />
                <input v-model="currentTeacher.last_name" type="text" placeholder="Last Name" class="input input-bordered w-full" required />
                <input v-model="currentTeacher.email" type="email" placeholder="Email Address" class="input input-bordered w-full" required />
                <input v-model="currentTeacher.password" type="password" placeholder="Password" class="input input-bordered w-full" /> <!-- Optional -->
                <select v-model="currentTeacher.teacher_type" class="input input-bordered w-full" required>
                  <option value="" disabled>Select Teacher Type</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>
            </div>
          </div>

          <div class="space-y-6 mt-6">
            <h3 class="font-semibold text-primary">Sections and Subjects</h3>
            <div v-for="(yearSection, index) in currentTeacher.yearSectionSubjects" :key="index" class="mb-4 p-4 border border-base-500 rounded-md">
              <select v-model="yearSection.course" class="input input-bordered w-auto mb-2" required>
                <option value="" disabled>Select Course</option>
                <option value="BSIT">BSIT</option>
                <option value="BSHM">BSHM</option>
                <option value="BSED">BSED</option>
                <option value="BEED">BEED</option>
              </select>
              <input
                v-model="yearSection.year_and_section"
                type="text"
                placeholder="Year and Section"
                class="input input-bordered w-auto mb-2"
                required
              />
              <div class="overflow-y-auto max-h-96 border border-base-400 p-4 rounded">
                <input 
                  v-model="searchQueries[index]" 
                  type="text" 
                  placeholder="Search Subjects..." 
                  class="input input-bordered w-full mb-2" 
                />
                <div v-if="filteredSubjects(index).length === 0" class="text-red-500">No subjects found</div>
                <div v-for="subject in filteredSubjects(index)" :key="subject.id" class="flex items-center">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary" 
                    :value="subject.name" 
                    :checked="isSubjectChecked(yearSection, subject.name)" 
                    @change="toggleSubjectSelection(yearSection, subject.name)"
                  />
                  <label class="ml-2 text-gray-300 text-sm">{{ subject.name }}</label>
                </div>
              </div>
              <div class="flex justify-end">
                <button @click="removeYearSection(index)" type="button" class="btn btn-error mt-3">Remove</button>
              </div>
            </div>
            <button @click="addYearSection" type="button" class="btn btn-primary mt-4">Add Year & Section</button>
          </div>

          <div class="mt-6 flex justify-end space-x-4">
            <button @click="props.closeModal" type="button" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? 'Updating...' : 'Update Teacher' }}</button>
          </div>
        </form>

        <div v-if="message" class="mt-4 text-green-500">{{ message }}</div>
        <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios'; // Import axios for API calls
import { useTeacherStore } from '@/stores/teacherStore';
import { useSubjectStore } from '@/stores/subjectStore';

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
  password: '',
  teacher_type: '',
  yearSectionSubjects: []
});

const searchQueries = ref([]);
const message = ref('');
const error = ref('');
const loading = ref(false);

// Store setup
const teacherStore = useTeacherStore();
const subjectStore = useSubjectStore();

// Watch for the teacher prop to populate the currentTeacher
watch(() => props.teacher, (newTeacher) => {
  if (newTeacher) {
    currentTeacher.value = {
      ...newTeacher,
      yearSectionSubjects: Array.isArray(newTeacher.yearSectionSubjects) ? newTeacher.yearSectionSubjects : []
    };
    searchQueries.value = currentTeacher.value.yearSectionSubjects.map(() => ''); // Initialize search queries
  } else {
    resetForm(); // Reset form if no teacher data
  }
}, { immediate: true });

// Function to handle form submission for updating the teacher
const handleEditTeacher = async () => {
  loading.value = true; // Start loading
  try {
    // Update the teacher and the year section subjects
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

// Add a new Year & Section
const addYearSection = () => {
  currentTeacher.value.yearSectionSubjects.push({ course: '', year_and_section: '', subjects: [] });
  searchQueries.value.push('');
};

// Remove a Year & Section
const removeYearSection = async (index) => {
  const yearSection = currentTeacher.value.yearSectionSubjects[index];
  
  if (yearSection && yearSection.id) {
    try {
      await axios.delete(`/api/teacher-sections/${yearSection.id}`);
    } catch (err) {
      console.error('Error deleting year section:', err);
    }
  }

  currentTeacher.value.yearSectionSubjects.splice(index, 1);
  searchQueries.value.splice(index, 1);
};

// Filter subjects based on search query
const filteredSubjects = (index) => {
  return subjects.value.filter(subject => 
    subject.name.toLowerCase().includes(searchQueries.value[index].toLowerCase())
  );
};

// Check if subject is selected in a year section
const isSubjectChecked = (yearSection, subjectName) => {
  return yearSection.subjects.includes(subjectName);
};

// Toggle subject selection for a year section
const toggleSubjectSelection = (yearSection, subjectName) => {
  const subjectIndex = yearSection.subjects.indexOf(subjectName);
  if (subjectIndex === -1) {
    yearSection.subjects.push(subjectName);
  } else {
    yearSection.subjects.splice(subjectIndex, 1);
  }
};

// Reset form to default values
const resetForm = () => {
  currentTeacher.value = {
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    teacher_type: '',
    yearSectionSubjects: [] // Reset to an empty array
  };
  searchQueries.value = [];
};

// Computed property for subjects from store
const subjects = computed(() => subjectStore.subjects);
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter, .modal-fade-leave-to {
  opacity: 0;
}
</style>
