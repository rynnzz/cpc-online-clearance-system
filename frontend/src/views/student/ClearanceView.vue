<template>
  <div class="p-8 bg-gray-900 text-gray-100 w-full">
    <div class="flex justify-between items-center mb-6">
      <div class="w-full">
        <h1 class="text-4xl font-bold mb-6">Clearance View</h1>

        <!-- Check if studentInfo is defined -->
        <div v-if="studentInfo && studentInfo.sections" class="w-full">
          <!-- Student Basic Info -->
          <div class="mb-6">
            <p class="text-lg">
              <strong>Name:</strong>
              {{ studentInfo.firstName || 'N/A' }} {{ studentInfo.middleName || '' }} {{ studentInfo.lastName || '' }}
            </p>
          </div>

          <!-- Subjects Section -->
          <div v-for="(section, index) in studentInfo.sections" :key="index" class="mb-8 ">
            <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold mb-4">{{ section.course }} - {{ section.section }}</h2>
          <h2 class=" text-2xl font-semibold mb-4">Current Semester: {{ currentSemester }}</h2>
          </div>
            <div class="overflow-x-auto">
              <table class="table w-full bg-gray-800 text-white rounded-lg shadow-lg">
                <thead>
                  <tr class="bg-gray-700 text-white">
                    <th class="py-3 px-4 text-left">Code</th>
                    <th class="py-3 px-4 text-left">Subject</th>
                    <th class="py-3 px-4 text-left">Units</th>
                    <th class="py-3 px-4 text-left">Status</th>
                    <th class="py-3 px-4 text-left">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(subject, sIndex) in section.subjects || []" :key="sIndex" class="hover:bg-gray-700">
                    <td class="py-3 px-4">{{ subject.subjectCode }}</td>
                    <td class="py-3 px-4">{{ subject.subjectName }}</td>
                    <td class="py-3 px-4">{{ subject.units }}</td>
                    <td class="py-3 px-4" :class="{
                      'text-blue-500': subject.status === 'Pending', 
                      'text-green-500': subject.status === 'Approved', 
                      'text-red-500': subject.status === 'Rejected'
                    }">
                      {{ subject.status || 'Pending' }}
                    </td>
                    <td class="py-3 px-4">
                      <img v-if="subject.status === 'Approved' && subject.signature" 
                           :src="subject.signature" 
                           alt="Teacher Signature" 
                           class="w-32 h-16 object-contain bg-transparent border-none" />
                    </td>
                  </tr>
                  <!-- Fallback if no subjects are found -->
                  <tr v-if="!section.subjects || section.subjects.length === 0">
                    <td colspan="5" class="text-center py-3 px-4 text-gray-500">No subjects found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Non-Teaching Staff Clearance Section -->
          <div class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">Administrative Clearance</h2>
            <div class="overflow-x-auto">
              <table class="table w-full bg-gray-800 text-white rounded-lg shadow-lg">
                <thead>
                  <tr class="bg-gray-700 text-white">
                    <th class="py-3 px-4 text-left">Department</th>
                    <th class="py-3 px-4 text-left">Staff Name</th>
                    <th class="py-3 px-4 text-left">Status</th>
                    <th class="py-3 px-4 text-left">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(staff, sIndex) in studentInfo.nonTeachingStaff || []" :key="sIndex" class="hover:bg-gray-700">
                    <td class="py-3 px-4">{{ staff.department }}</td>
                    <td class="py-3 px-4">{{ staff.staffName }}</td>
                    <td class="py-3 px-4" :class="{
                      'text-blue-500': staff.status === 'Pending', 
                      'text-green-500': staff.status === 'Approved', 
                      'text-red-500': staff.status === 'Rejected'
                    }">
                      {{ staff.status || 'Pending' }}
                    </td>
                    <td class="py-3 px-4">
                      <img v-if="staff.status === 'Approved' && staff.signature" 
                           :src="staff.signature" 
                           alt="Staff Signature" 
                           class="w-32 h-16 object-contain bg-transparent border-none" />
                    </td>
                  </tr>
                  <!-- Fallback if no clearance info is found -->
                  <tr v-if="!studentInfo.nonTeachingStaff || studentInfo.nonTeachingStaff.length === 0">
                    <td colspan="4" class="text-center py-3 px-4 text-gray-500">No non-teaching staff clearance found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Show Loading Message -->
        <div v-else class="text-gray-400">Loading student information...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStudentStore } from '@/stores/studentStore';
import { useSemesterStore } from '@/stores/semesterStore';
import { onMounted, computed, ref } from 'vue';

const studentStore = useStudentStore();
const semesterStore = useSemesterStore();

const currentSemester = ref('');

onMounted(async () => {
  studentStore.getStudentInfo();
  currentSemester.value = await semesterStore.getSemester();
});

const studentInfo = computed(() => studentStore.currentStudent);
</script>
