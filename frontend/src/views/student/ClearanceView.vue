<template>
  <div class="p-8 bg-gray-900 text-gray-100 w-full">
    <div class="flex justify-between items-center mb-6">
      <!-- Main Dashboard Content -->
      <div class="w-full">
        <h1 class="text-4xl font-bold mb-6">Clearance View</h1>

        <!-- Display content only if studentInfo is defined -->
        <div v-if="studentInfo" class="w-full">
          <!-- Student Info -->
          <div class="mb-6">
            <p class="text-lg"><strong>Name:</strong> {{ studentInfo.firstName }} {{ studentInfo.middleName }} {{ studentInfo.lastName }}</p>
            <p class="text-lg"><strong>Course:</strong> {{ studentInfo.sections[0]?.course || '' }}</p>
            <p class="text-lg"><strong>Year and Section:</strong> {{ studentInfo.sections[0]?.yearAndSection || '' }}</p>
          </div>

          <!-- Subjects Table for Each Section -->
          <div v-for="(section, index) in studentInfo.sections" :key="index" class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">Subjects</h2>
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
                  <tr v-for="(subject, sIndex) in section.subjects" :key="sIndex" class="hover:bg-gray-700">
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
                      <!-- Display the signature as an image only if it's approved and signature exists -->
                      <img v-if="subject.status === 'Approved' && subject.signature" 
                           :src="subject.signature" 
                           alt="Teacher Signature" 
                           class="w-32 h-16 object-contain bg-transparent border-none" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-400">Loading student information...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStudentStore } from '@/stores/studentStore';
import { onMounted, computed } from 'vue';

const studentStore = useStudentStore();

onMounted(() => {
  studentStore.getStudentInfo();
});

const studentInfo = computed(() => studentStore.currentStudent);
</script>
