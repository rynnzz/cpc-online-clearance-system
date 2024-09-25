<template>
    <div class="teacher-update">
      <h2>Update Teacher</h2>
      <form @submit.prevent="updateTeacher">
        <div>
          <label>First Name:</label>
          <input v-model="teacher.first_name" required />
        </div>
        <div>
          <label>Middle Name:</label>
          <input v-model="teacher.middle_name" />
        </div>
        <div>
          <label>Last Name:</label>
          <input v-model="teacher.last_name" required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" v-model="teacher.email" required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" v-model="teacher.password" />
        </div>
        <div>
          <label>Teacher Type:</label>
          <input v-model="teacher.teacher_type" required />
        </div>
        <div>
          <label>Year Sections:</label>
          <div v-for="(section, index) in teacher.yearSections" :key="index">
            <input v-model="section.course" placeholder="Course" required />
            <input v-model="section.year_and_section" placeholder="Year and Section" required />
            <select v-model="section.subject_id" required>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
            <button type="button" @click="removeSection(index)">Remove</button>
          </div>
          <button type="button" @click="addSection">Add Section</button>
        </div>
        <button type="submit">Update Teacher</button>
      </form>
      <p v-if="message">{{ message }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useTeacherStore } from '@/stores/teacherStore';
  import { useSubjectStore } from '@/stores/subjectStore';
  
  // Reactive state for teacher details and subjects
  const teacher = ref({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    teacher_type: '',
    yearSections: [{ course: '', year_and_section: '', subject_id: '' }]
  });
  const message = ref('');
  const subjects = ref([]); // To store the subjects fetched from the API
  
  // Get store instance
  const teacherStore = useTeacherStore();
  const subjectStore = useSubjectStore();
  
  // Fetch subjects on component mount
  onMounted(async () => {
    try {
      const response = await subjectStore.getAllSubjects(); // Assuming this method exists in your store
      subjects.value = response; // Update subjects list
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      message.value = 'Failed to load subjects';
    }
  });
  
  const updateTeacher = async () => {
    try {
      const response = await teacherStore.updateTeacher(/* pass necessary id and teacher data */);
      message.value = response.message;
    } catch (error) {
      message.value = error.message;
    }
  };
  
  const addSection = () => {
    teacher.value.yearSections.push({ course: '', year_and_section: '', subject_id: '' });
  };
  
  const removeSection = (index) => {
    teacher.value.yearSections.splice(index, 1);
  };
  </script>
  
  <style scoped>
  </style>
  