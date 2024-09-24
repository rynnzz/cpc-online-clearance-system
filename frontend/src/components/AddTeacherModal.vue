<template>
  <transition name="modal-fade" appear>
    <div v-if="isOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-6xl h-4/5 transform transition-transform duration-300 scale-95 overflow-y-auto">
        <h2 class="text-2xl font-semibold mb-4 text-primary">Add Teacher Account</h2>

        <form @submit.prevent="handleAddTeacher">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="col-span-2 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input v-model="newTeacher.first_name" type="text" placeholder="First Name" class="input input-bordered w-full" required />
                <input v-model="newTeacher.middle_name" type="text" placeholder="Middle Name" class="input input-bordered w-full" required />
                <input v-model="newTeacher.last_name" type="text" placeholder="Last Name" class="input input-bordered w-full" required />
                <input v-model="newTeacher.email" type="email" placeholder="Email Address" class="input input-bordered w-full" required />
                <input v-model="newTeacher.password" type="password" placeholder="Password" class="input input-bordered w-full" required />
                <select v-model="newTeacher.teacher_type" class="input input-bordered w-full" required>
                  <option value="" disabled>Select Teacher Type</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>
            </div>
          </div>

          <div class="space-y-6 mt-6">
            <h3 class="font-semibold text-primary">Section and Subjects</h3>
            <div v-for="(yearSection, index) in yearSections" :key="index" class="mb-4 p-4 border border-base-500 rounded-md">
              <select v-model="yearSection.course" class="input input-bordered w-auto mb-2" required>
                  <option value="" disabled>Select Course</option>
                  <option value="BSIT">BSIT</option>
                  <option value="BSHM">BSHM</option>
                  <option value="BSED">BSED</option>
                  <option value="BEED">BEED</option>
                </select>
              <div class="flex items-center space-x-4">
                <input
                  v-model="yearSection.year_and_section"
                  type="text"
                  placeholder="Year and Section"
                  class="input input-bordered w-auto mb-2"
                  required
                />
              </div>
                <div class="overflow-y-auto max-h-96 border border-base-400 p-4 rounded">
                  <div class="grid grid-cols-1 gap-2">
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
                      :value="subject.id" 
                      v-model="yearSection.subjects" 
                    />
                    <label class="ml-2 text-gray-300 text-sm">{{ subject.name }}</label>
                  </div>
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
import { onMounted, ref, computed } from 'vue';
import { useTeacherStore } from '@/stores/teacherStore';
import { useSubjectStore } from '@/stores/subjectStore';

// Props from parent component
const props = defineProps({
  isOpen: Boolean,
  closeModal: Function
});

// Form Data
const newTeacher = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  password: '',
  teacher_type: '',
});

// Store for handling multiple "Year & Section" with subjects
const yearSections = ref([{ course: '', year_and_section: '', subjects: [] }]);
const searchQueries = ref(['']);
const message = ref('');
const error = ref('');
const loading = ref(false);

// Store setup
const teacherStore = useTeacherStore();
const subjectStore = useSubjectStore();

onMounted(async () => {
  try {
    await subjectStore.getAllSubjects(); // Fetch subjects on modal mount
  } catch (err) {
    console.error('Error fetching subjects:', err);
  }
});

// Add new "Year & Section"
const addYearSection = () => {
  yearSections.value.push({ course: '', year_and_section: '', subjects: [] });
  searchQueries.value.push('');
};

// Remove a "Year & Section"
const removeYearSection = (index) => {
  yearSections.value.splice(index, 1);
  searchQueries.value.splice(index, 1);
};

// Filter subjects based on search query
const filteredSubjects = (index) => {
  return subjects.value.filter(subject => 
    subject.name.toLowerCase().includes(searchQueries.value[index].toLowerCase())
  );
};

// Handle form submission
const handleAddTeacher = async () => {
  loading.value = true; // Start loading
  try {
    const formattedData = {
      ...newTeacher.value,
      yearSectionSubjects: yearSections.value
    };
    console.log(formattedData)

    await teacherStore.addTeacher(formattedData); // Send data to store
    message.value = 'Teacher added successfully!';
    resetForm(); // Reset form after submission
    props.closeModal(); // Close modal on success
  } catch (err) {
    console.error('Error adding teacher:', err);
    error.value = 'Failed to add teacher. Please try again.';
  } finally {
    loading.value = false; // End loading
    setTimeout(() => {
      message.value = '';
      error.value = '';
    }, 5000); // Clear messages after 5 seconds
  }
};

// Reset form
const resetForm = () => {
  newTeacher.value = {
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    teacher_type: '',
  };
  yearSections.value = [{ course: '', year_and_section: '', subjects: [] }];
  searchQueries.value = [''];
};

// Computed subjects from store
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
