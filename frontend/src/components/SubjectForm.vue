<template>
    <div class="space-y-4">
      <div>
        <label class="block text-lg">Department</label>
        <select v-model="formData.department" class="input input-bordered w-full bg-gray-700" required>
            <option disabled value="">Select Department</option>
          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
        </select>
      </div>
  
      <div class="flex space-x-4">
        <div class="flex-1">
          <label class="block text-lg">Year Level</label>
          <select v-model="formData.year" class="input input-bordered w-full bg-gray-700" required>
            <option disabled value="">Select Year Level</option>
            <option v-for="(yearLabel, year) in yearNames" :key="year" :value="year">{{ yearLabel }}</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-lg">School Year</label>
          <select v-model="formData.school_year" class="input input-bordered w-full bg-gray-700" required>
            <option disabled value="">Select Year</option>
            <option v-for="year in schoolYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
      </div>
  
      <div class="flex space-x-4">
        <div class="flex-1">
          <label class="block text-lg">Semester</label>
          <select v-model="formData.semester" class="input input-bordered w-full bg-gray-700" required>
            <option disabled value="">Select Semester</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-lg">Units</label>
          <input v-model="formData.units" type="number" min="0" class="input input-bordered w-full bg-gray-700" required />
        </div>
      </div>
  
      <div>
        <label class="block text-lg">Subject Name</label>
        <input v-model="formData.name" type="text" class="input input-bordered w-full bg-gray-700" placeholder="Enter subject name" required />
      </div>
  
      <div>
        <label class="block text-lg">Subject Code</label>
        <input v-model="formData.code" type="text" class="input input-bordered w-full bg-gray-700" placeholder="Enter subject code" required />
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, computed } from 'vue';
  
  // Define props and emits using the Composition API
  const props = defineProps({
    subjectData: Object,
    yearNames: Object,
  });
  
  const emit = defineEmits(['update:subjectData']);
  
  // Create a computed property to manage two-way binding for form data
  const formData = computed({
    get() {
      return props.subjectData;
    },
    set(value) {
      emit('update:subjectData', value);
    }
  });

  console.log(formData.value);

  const departments = ['BSHM', 'BSIT', 'BSED - MAJOR IN SCIENCE', 'BSED - MAJOR IN ENGLISH', 'BEED']

  const schoolYears = ['2024-2025', '2026-2027', '2027-2028']
  </script>
  
  <style scoped>
  </style>
  