<template>
  <div class="space-y-4">
    <!-- Department -->
    <div>
      <label class="block text-lg">Department</label>
      <select
        v-model="formData.department"
        class="input input-bordered w-full bg-gray-700"
        required
      >
        <option disabled value="">Select Department</option>
        <option v-for="dept in departments" :key="dept.id" :value="dept.name">
          {{ dept.name }}
        </option>
      </select>
    </div>

    <!-- Year Level and School Year -->
    <div class="flex space-x-4">
      <div class="flex-1">
        <label class="block text-lg">Year Level</label>
        <select v-model="formData.year" class="input input-bordered w-full bg-gray-700" required>
          <option disabled value="">Select Year Level</option>
          <option v-for="(yearLabel, year) in yearNames" :key="year" :value="year">
            {{ yearLabel }}
          </option>
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

    <!-- Semester and Units -->
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
        <input
          v-model="formData.units"
          type="number"
          min="0"
          class="input input-bordered w-full bg-gray-700"
          required
        />
      </div>
    </div>

    <!-- Subject Name -->
    <div>
      <label class="block text-lg">Subject Name</label>
      <input
        v-model="formData.name"
        type="text"
        class="input input-bordered w-full bg-gray-700"
        placeholder="Enter subject name"
        required
      />
    </div>

    <!-- Subject Code -->
    <div>
      <label class="block text-lg">Subject Code</label>
      <input
        v-model="formData.code"
        type="text"
        class="input input-bordered w-full bg-gray-700"
        placeholder="Enter subject code"
        required
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import Swal from 'sweetalert2';

// Props and Emits
const props = defineProps({
  subjectData: Object,
  yearNames: Object,
});

const emit = defineEmits(['update:subjectData', 'deleteSubject']);

// Departments List
const departments = [
  { id: 1, name: 'BSIT' },
  { id: 2, name: 'BEED' },
  { id: 3, name: 'BSHM' },
  { id: 4, name: 'BSED - MAJOR IN ENGLISH' },
  { id: 5, name: 'BSED - MAJOR IN SCIENCE' },
];

// Computed Property for Form Data
const formData = computed({
  get() {
    const department = departments.find(
      (dept) => dept.id === props.subjectData.department_id
    )?.name;

    return {
      ...props.subjectData,
      department, // Map department_id to department name
    };
  },
  set(value) {
    const departmentId = departments.find(
      (dept) => dept.name === value.department
    )?.id;

    emit('update:subjectData', {
      ...value,
      department_id: departmentId, // Replace department with department_id
    });
  },
});

// School Years
const schoolYears = [
  '2024-2025',
  '2025-2026',
  '2026-2027',
  '2027-2028',
  '2028-2029',
  '2029-2030',
];

// Validations Before Adding Subject
const validateSubject = () => {
  if (!formData.value.name.trim()) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Subject name is required.',
    });
    return false;
  }
  if (!formData.value.code.trim()) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Subject code is required.',
    });
    return false;
  }
  if (!formData.value.department) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Please select a department.',
    });
    return false;
  }
  if (!formData.value.year) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Please select a year level.',
    });
    return false;
  }
  if (!formData.value.school_year) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Please select a school year.',
    });
    return false;
  }
  if (!formData.value.semester) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Please select a semester.',
    });
    return false;
  }
  if (formData.value.units <= 0) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Units must be greater than zero.',
    });
    return false;
  }
  return true;
};

// Function to Confirm Deletion
const confirmDeleteSubject = (subjectId) => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action will permanently delete the subject.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      emit('deleteSubject', subjectId);
      Swal.fire('Deleted!', 'The subject has been deleted.', 'success');
    }
  });
};
</script>

<style scoped></style>
