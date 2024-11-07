<template>
  <div class="flex min-h-screen w-full bg-gray-900 text-white">
    <!-- Main Content -->
    <main class="flex-1 bg-gray-900 w-full p-10">
      <div class="bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 class="text-3xl font-bold mb-6">Sections Handled</h2>
        <div class="border border-white">
          <ul class="space-y-6 divide-y divide-gray-700 p-2">
            <li 
              v-for="subject in teacherInfo.subjects" 
              :key="subject.course + subject.yearAndSection + subject.subjectName" 
              class="pt-6"
            >
              <p class="font-medium text-gray-300">
                Course: {{ subject.course }}
              </p>
              <p class="font-medium text-gray-300">
                Year and Section: {{ subject.yearAndSection }}
              </p>
              <p class="mt-2 text-gray-400">
                Subject: {{ subject.subjectName }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useTeacherStore } from '@/stores/teacherStore';
import { onMounted, computed } from 'vue';

const teacherStore = useTeacherStore();

onMounted(() => {
  teacherStore.getTeacherInfo();
});

// Access the teacher's info using a computed property
const teacherInfo = computed(() => teacherStore.currentTeacher);
</script>

<style scoped>
/* Additional styles if needed */
</style>
