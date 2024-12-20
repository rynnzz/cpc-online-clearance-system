<template>
  <div class="p-8 bg-gray-900 text-gray-100 min-h-screen">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-4">Clearance View</h1>
      <p class="text-lg text-gray-300">
        <strong>Name:</strong> {{ studentInfo.firstName || 'N/A' }} {{ studentInfo.middleName || '' }} {{ studentInfo.lastName || '' }}
      </p>
    </div>

    <!-- Subjects Section -->
    <div v-if="studentInfo && studentInfo.sections" class="mb-12">
      <div v-for="(section, index) in studentInfo.sections" :key="index" class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-blue-500">
            {{ section.course }} - {{ section.section }}
          </h2>
          <p class="text-lg font-medium text-gray-400">
            Current Semester: {{ currentSemester }}
          </p>
        </div>
        <!-- Table Container -->
        <div class="overflow-x-auto w-full">
          <table class="w-full table-fixed bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <thead>
              <tr class="bg-blue-600 text-white">
                <th class="py-4 px-4 text-left w-1/5">Code</th>
                <th class="py-4 px-4 text-left w-2/5">Subject</th>
                <th class="py-4 px-4 text-center w-1/5">Units</th>
                <th class="py-4 px-4 text-center w-1/5">Teacher</th>
                <th class="py-4 px-4 text-center w-1/5">Status</th>
                <th class="py-4 px-4 text-center w-1/5">Signature</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(subject, sIndex) in section.subjects || []"
                :key="sIndex"
                class="hover:bg-gray-700"
              >
                <td class="py-4 px-4">{{ subject.subjectCode }}</td>
                <td class="py-4 px-4">{{ subject.subjectName }}</td>
                <td class="py-4 px-4 text-center">{{ subject.units }}</td>
                <td class="py-4 px-4 text-center">{{ subject.teacherName }}</td>
                <td
                  class="py-4 px-4 text-center font-semibold"
                  :class="{
                    'text-blue-400': subject.status === 'Pending',
                    'text-green-400': subject.status === 'Approved',
                  }"
                >
                  {{ subject.status || 'Pending' }}
                </td>
                <td class="py-4 px-4 text-center">
                  <img
                    v-if="subject.status === 'Approved' && subject.signature"
                    :src="subject.signature"
                    alt="Signature"
                    class="w-32 h-16 object-contain mx-auto"
                  />
                </td>
              </tr>
              <tr v-if="!section.subjects || section.subjects.length === 0">
                <td colspan="5" class="py-4 px-4 text-center text-gray-400">
                  No subjects found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Administrative Clearance Section -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold text-green-500 mb-6">
        Administrative Clearance
      </h2>
      <div class="overflow-x-auto w-full">
        <table class="w-full table-fixed bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <thead>
            <tr class="bg-green-600 text-white">
              <th class="py-4 px-4 text-left w-1/3">Offices</th>
              <th class="py-4 px-4 text-left w-1/3">Teacher</th>
              <th class="py-4 px-4 text-center w-1/3">Status</th>
              <th class="py-4 px-4 text-center w-1/3">Signature</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(clearance, index) in administrativeClearance.clearanceData || []"
              :key="index"
              class="hover:bg-gray-700"
            >
              <td class="py-4 px-4">{{ clearance.role_name }}</td>
              <td class="py-4 px-4">{{ clearance.teacher_first_name }} {{ clearance.teacher_last_name }} </td>
              <td
                class="py-4 px-4 text-center font-semibold"
                :class="{
                  'text-blue-400': clearance.clearance_status === 'Pending',
                  'text-green-400': clearance.clearance_status === 'Approved',
                }"
              >
                {{ clearance.clearance_status || 'Pending' }}
              </td>
              <td class="py-4 px-4 text-center">
                <img
                  v-if="clearance.clearance_status === 'Approved' && clearance.teacher_signature"
                  :src="clearance.teacher_signature"
                  alt="Signature"
                  class="w-32 h-16 object-contain mx-auto"
                />
              </td>
            </tr>
            <tr
              v-if="!administrativeClearance.clearanceData || administrativeClearance.clearanceData.length === 0"
            >
              <td colspan="3" class="py-4 px-4 text-center text-gray-400">
                No administrative clearance found.
              </td>
            </tr>
          </tbody>
        </table>
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
  await studentStore.getStudentInfo(); // Fetch student information
  await studentStore.getAdministrativeClearance()
  currentSemester.value = await semesterStore.getSemester(); // Fetch current semester
  console.log(studentStore.currentStudent)
});

const studentInfo = computed(() => studentStore.currentStudent); // Computed property for student info
const administrativeClearance = computed(() => studentStore.administrativeClearance)
</script>
