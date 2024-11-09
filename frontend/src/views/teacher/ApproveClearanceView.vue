<template>
  <div class="flex min-h-screen w-full bg-gray-900 text-white">
    <main class="flex-1 bg-gray-900 w-full p-10">
      <h1 class="text-4xl font-bold mb-6">Clearance View</h1>
      
      <div v-for="subject in teacherInfo.subjects" :key="subject.course + subject.yearAndSection + subject.subjectName" class="card shadow-lg bg-gray-800 mb-8 p-6 rounded-lg">
        <div class="mb-4">
          <h2 class="text-2xl font-bold">Section: {{ subject.course }} - {{ subject.yearAndSection }}</h2>
          <p class="text-xl text-gray-400">Subject: {{ subject.subjectName }}</p>
        </div>

        <div class="overflow-x-auto">
          <table class="table w-full bg-gray-700 rounded-lg">
            <thead>
              <tr class="bg-gray-800">
                <th class="py-3 px-4 text-left text-gray-300 font-semibold">First Name</th>
                <th class="py-3 px-4 text-left text-gray-300 font-semibold">Last Name</th>
                <th class="py-3 px-4 text-left text-gray-300 font-semibold">Status</th>
                <th class="py-3 px-4 text-left text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in subject.students" :key="student.studentId" class="hover:bg-gray-600">
                <td class="py-3 px-4 text-gray-300">{{ student.firstName }}</td>
                <td class="py-3 px-4 text-gray-300">{{ student.lastName }}</td>
                <td class="py-3 px-4" :class="{
                    'text-blue-500': !student.status || student.status === 'Pending',
                    'text-green-500': student.status === 'Approved',
                    'text-red-500': student.status === 'Rejected'
                  }">
                  {{ student.status || 'Pending' }}
                </td>
                <td class="py-3 px-4">
                  <button @click="approveClearance(student.studentId, subject.subjectId, subject.sectionId)" class="btn btn-sm btn-success mr-2">Approve</button>
                  <button @click="rejectClearance(student.studentId, subject.subjectId, subject.sectionId)" class="btn btn-sm btn-error">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useTeacherStore } from '@/stores/teacherStore';
import { useClearanceStore } from '@/stores/clearanceStore';
import { onMounted, computed } from 'vue';

const teacherStore = useTeacherStore();
const clearanceStore = useClearanceStore();

onMounted(() => {
  teacherStore.getTeacherInfo();
});

const teacherInfo = computed(() => teacherStore.currentTeacher);

const approveClearance = async (studentId, subjectId, sectionId) => {
  try {
    await clearanceStore.updateClearanceStatus(studentId, subjectId, sectionId, 'Approved');
    updateLocalStatus(studentId, subjectId, sectionId, 'Approved'); // Update the local status
    alert('Clearance approved');
  } catch (error) {
    console.error('Error approving clearance:', error);
  }
};

const rejectClearance = async (studentId, subjectId, sectionId) => {
  try {
    await clearanceStore.updateClearanceStatus(studentId, subjectId, sectionId, 'Rejected');
    updateLocalStatus(studentId, subjectId, sectionId, 'Rejected'); // Update the local status
    alert('Clearance rejected');
  } catch (error) {
    console.error('Error rejecting clearance:', error);
  }
};


const updateLocalStatus = (studentId, subjectId, sectionId, status) => {
  const subject = teacherInfo.value.subjects.find(subj => subj.subjectId === subjectId && subj.sectionId === sectionId);
  if (subject) {
    const student = subject.students.find(stu => stu.studentId === studentId);
    if (student) {
      student.status = status;
    }
  }
};
</script>
