<template>
    <transition name="modal-fade" appear>
      <div v-if="isOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl h-4/5 transform transition-transform duration-300 scale-95 overflow-y-auto">
          <h2 class="text-2xl font-semibold mb-4 text-blue-600">Add Teacher Account</h2>
  
          <form @submit.prevent="handleAddTeacher">
            <div class="grid grid-cols-3 gap-6">
              <!-- Left Side: Personal Information -->
              <div class="col-span-2 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <input v-model="newTeacher.first_name" type="text" placeholder="First Name" class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm" required />
                  <input v-model="newTeacher.middle_name" type="text" placeholder="Middle Name" class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm" required />
                  <input v-model="newTeacher.last_name" type="text" placeholder="Last Name" class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm" required />
                  <input v-model="newTeacher.email" type="email" placeholder="Email" class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm" required />
                  <input v-model="newTeacher.password" type="password" placeholder="Password" class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm" required />
                  <input v-model="newTeacher.yr_and_section" type="text" placeholder="Year and Sections Handled" class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm" required />
                  <input v-model="newTeacher.teacher_type" type="text" placeholder="Teacher Type" class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm" required />
                </div>
              </div>
  
              <!-- Right Side: Subjects Handled -->
              <div class="col-span-1 space-y-4">
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Search Subjects..." 
                  class="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm" />
  
                <div class="overflow-y-auto max-h-96 border p-4 rounded">
                  <h3 class="font-semibold mb-2 text-blue-600">Subjects Handled</h3>
                  <div class="grid grid-cols-1 gap-2">
                    <div v-if="filteredSubjects.length === 0" class="text-red-500">Subject not found</div>
                    <div v-for="subject in filteredSubjects" :key="subject.id" class="flex items-center">
                      <input 
                        type="checkbox" 
                        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all duration-300" 
                        :value="subject.name" 
                        v-model="newTeacher.subjects" />
                      <label class="ml-2 text-gray-700 text-sm">{{ subject.name }}</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="mt-6 flex justify-end space-x-4">
              <button 
                @click="closeModal" 
                type="button" 
                class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-all duration-300 text-sm">
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all duration-300 text-sm">
                Add Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { onMounted, ref, computed } from 'vue';
  import { useTeacherStore } from '@/stores/teacherStore';
  import { useSubjectStore } from '@/stores/subjectStore';
  
  const props = defineProps({
    isOpen: Boolean,
    closeModal: Function
  });
  
  const searchQuery = ref('');
  const newTeacher = ref({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    yr_and_section: '',
    teacher_type: '',
    subjects: []
  });
  
  const teacherStore = useTeacherStore();
  const subjectStore = useSubjectStore();
  
  onMounted(async () => {
    try {
      await subjectStore.getAllSubjects();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  });
  
  const handleAddTeacher = async () => {
    try {
        // Collecting the subject IDs from the selected subjects
        const subjectIds = newTeacher.value.subjects.map(subject => {
            // Adjust this based on how you're storing subjects
            return subjects.value.find(s => s.name === subject).id; // Assuming subjects is an array of objects with id and name
        }).filter(id => id); // Filter out any undefined values

        // Prepare data to send
        const teacherData = {
            ...newTeacher.value,
            subjects: subjectIds // Pass the subject IDs
        };

        await teacherStore.addTeacher(teacherData);
        props.closeModal();
    } catch (error) {
        console.error('Error adding teacher:', error);
    }
};


  
  const subjects = computed(() => subjectStore.subjects);
  const filteredSubjects = computed(() => {
    return subjects.value.filter(subject => 
      subject.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
  </script>
  
  <style scoped>
  .modal-fade-enter-active, .modal-fade-leave-active {
    transition: opacity 0.3s;
  }
  .modal-fade-enter, .modal-fade-leave-to {
    opacity: 0;
  }
  </style>
  