<template>
  <div class="flex min-h-screen w-full bg-gray-900 text-white">
    <main class="flex-1 bg-gray-900 w-full p-10">
      <h1 class="text-4xl font-bold mb-6">Clearance View</h1>

      <div v-for="subject in teacherInfo.subjects" :key="subject.course + subject.yearAndSection + subject.subjectName" class="card shadow-lg bg-gray-800 mb-8 p-6 rounded-lg">
        <div class="mb-4">
          <h2 class="text-2xl font-bold">Section: {{ subject.course }} - {{ subject.yearAndSection }}</h2>
          <p class="text-xl text-gray-400">Subject: {{ subject.subjectName }}</p>
        </div>

        <!-- Search bar and bulk action buttons for each section -->
        <div class="mb-6 flex justify-between items-center">
          <input
            v-model="searchQueries[`${subject.subjectId}-${subject.sectionId}`]"
            @input="filterStudents(subject.subjectId, subject.sectionId)"
            type="text"
            placeholder="Search by name"
            class="input input-bordered w-full sm:w-1/3 bg-gray-800 text-white border border-gray-700 p-2 rounded-md"
          />
          <div>
            <button @click="bulkApprove(subject.subjectId, subject.sectionId)" :disabled="!selectedStudents[`${subject.subjectId}-${subject.sectionId}`]?.length" class="btn btn-sm btn-success mr-2">Bulk Approve</button>
            <button @click="bulkReject(subject.subjectId, subject.sectionId)" :disabled="!selectedStudents[`${subject.subjectId}-${subject.sectionId}`]?.length" class="btn btn-sm btn-error">Bulk Reject</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table w-full bg-gray-700 rounded-lg">
            <thead>
              <tr class="bg-gray-800">
                <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                  <input type="checkbox" @change="selectAll($event, subject.subjectId, subject.sectionId)" />
                </th>
                <th class="py-3 px-4 text-left text-gray-300 font-semibold">First Name</th>
                <th class="py-3 px-4 text-left text-gray-300 font-semibold">Last Name</th>
                <th class="py-3 px-4 text-left text-gray-300 font-semibold">Status</th>
                <th class="py-3 px-4 text-left text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in paginatedStudents(subject.subjectId, subject.sectionId)" :key="student.studentId" class="hover:bg-gray-600">
                <td class="py-3 px-4 text-gray-300">
                  <input type="checkbox" :value="student.studentId" v-model="selectedStudents[`${subject.subjectId}-${subject.sectionId}`]" />
                </td>
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

        <!-- Pagination controls for each section -->
        <div class="flex justify-end items-center mt-4">
          <button @click="previousPage(subject.subjectId, subject.sectionId)" class="btn btn-sm btn-primary mr-2" :disabled="currentPages[`${subject.subjectId}-${subject.sectionId}`] === 1">Previous</button>
          <span class="text-gray-400">Page {{ currentPages[`${subject.subjectId}-${subject.sectionId}`] }} of {{ totalPages(subject.subjectId, subject.sectionId) }}</span>
          <button @click="nextPage(subject.subjectId, subject.sectionId)" class="btn btn-sm btn-primary ml-2" :disabled="currentPages[`${subject.subjectId}-${subject.sectionId}`] >= totalPages(subject.subjectId, subject.sectionId)">Next</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useTeacherStore } from '@/stores/teacherStore';
import { useClearanceStore } from '@/stores/clearanceStore';
import { onMounted, computed, ref } from 'vue';

const teacherStore = useTeacherStore();
const clearanceStore = useClearanceStore();

const selectedStudents = ref({}); // Track selected students by subject and section IDs
const searchQueries = ref({}); // Track search queries by subject and section IDs
const currentPages = ref({}); // Track the current page for each subject and section
const pageSize = 5;

onMounted(() => {
  teacherStore.getTeacherInfo();
});

const teacherInfo = computed(() => teacherStore.currentTeacher);

const paginatedStudents = (subjectId, sectionId) => {
  const query = searchQueries.value[`${subjectId}-${sectionId}`]?.toLowerCase() || '';
  const subject = teacherInfo.value.subjects.find(subj => subj.subjectId === subjectId && subj.sectionId === sectionId);
  if (!subject) return [];

  const filtered = subject.students.filter(student =>
    student.firstName.toLowerCase().includes(query) || student.lastName.toLowerCase().includes(query)
  );

  const page = currentPages.value[`${subjectId}-${sectionId}`] || 1;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return filtered.slice(start, end);
};

const totalPages = (subjectId, sectionId) => {
  const query = searchQueries.value[`${subjectId}-${sectionId}`]?.toLowerCase() || '';
  const subject = teacherInfo.value.subjects.find(subj => subj.subjectId === subjectId && subj.sectionId === sectionId);
  if (!subject) return 1;

  const filtered = subject.students.filter(student =>
    student.firstName.toLowerCase().includes(query) || student.lastName.toLowerCase().includes(query)
  );

  return Math.ceil(filtered.length / pageSize);
};

// Go to the next page for a section
const nextPage = (subjectId, sectionId) => {
  const key = `${subjectId}-${sectionId}`;
  if (!currentPages.value[key]) currentPages.value[key] = 1;

  if (currentPages.value[key] < totalPages(subjectId, sectionId)) {
    currentPages.value[key]++;
  }
};

// Go to the previous page for a section
const previousPage = (subjectId, sectionId) => {
  const key = `${subjectId}-${sectionId}`;
  if (!currentPages.value[key]) currentPages.value[key] = 1;

  if (currentPages.value[key] > 1) {
    currentPages.value[key]--;
  }
};


// Filtered students for each section
const filteredStudents = (subjectId, sectionId) => {
  const query = searchQueries.value[`${subjectId}-${sectionId}`]?.toLowerCase() || '';
  const subject = teacherInfo.value.subjects.find(subj => subj.subjectId === subjectId && subj.sectionId === sectionId);
  if (!subject) return [];
  return subject.students.filter(student =>
    student.firstName.toLowerCase().includes(query) || student.lastName.toLowerCase().includes(query)
  );
};

// Approve clearance for a single student
const approveClearance = async (studentId, subjectId, sectionId) => {
  try {
    await clearanceStore.updateClearanceStatus(studentId, subjectId, sectionId, 'Approved');
    updateLocalStatus(studentId, subjectId, sectionId, 'Approved');
    alert('Clearance approved');
  } catch (error) {
    console.error('Error approving clearance:', error);
  }
};

// Reject clearance for a single student
const rejectClearance = async (studentId, subjectId, sectionId) => {
  try {
    await clearanceStore.updateClearanceStatus(studentId, subjectId, sectionId, 'Rejected');
    updateLocalStatus(studentId, subjectId, sectionId, 'Rejected');
    alert('Clearance rejected');
  } catch (error) {
    console.error('Error rejecting clearance:', error);
  }
};

// Update local status of a student
const updateLocalStatus = (studentId, subjectId, sectionId, status) => {
  const subject = teacherInfo.value.subjects.find(subj => subj.subjectId === subjectId && subj.sectionId === sectionId);
  if (subject) {
    const student = subject.students.find(stu => stu.studentId === studentId);
    if (student) {
      student.status = status;
    }
  }
};

// Select all students in a section
const selectAll = (event, subjectId, sectionId) => {
  const key = `${subjectId}-${sectionId}`;
  const subject = teacherInfo.value.subjects.find(subj => subj.subjectId === subjectId && subj.sectionId === sectionId);
  if (!subject) return;

  selectedStudents.value[key] = event.target.checked
    ? subject.students.map(student => student.studentId)
    : [];
};

// Bulk approve selected students in a section
const bulkApprove = async (subjectId, sectionId) => {
  const key = `${subjectId}-${sectionId}`;
  const selectedIds = selectedStudents.value[key] || [];

  try {
    await Promise.all(selectedIds.map(studentId => {
      return clearanceStore.updateClearanceStatus(studentId, subjectId, sectionId, 'Approved')
        .then(() => updateLocalStatus(studentId, subjectId, sectionId, 'Approved'));
    }));
    alert('Bulk approval completed');
    selectedStudents.value[key] = []; // Clear selected students after action
  } catch (error) {
    console.error('Error with bulk approval:', error);
  }
};

// Bulk reject selected students in a section
const bulkReject = async (subjectId, sectionId) => {
  const key = `${subjectId}-${sectionId}`;
  const selectedIds = selectedStudents.value[key] || [];

  try {
    await Promise.all(selectedIds.map(studentId => {
      return clearanceStore.updateClearanceStatus(studentId, subjectId, sectionId, 'Rejected')
        .then(() => updateLocalStatus(studentId, subjectId, sectionId, 'Rejected'));
    }));
    alert('Bulk rejection completed');
    selectedStudents.value[key] = []; // Clear selected students after action
  } catch (error) {
    console.error('Error with bulk rejection:', error);
  }
};

// Filter students by search query for each section
const filterStudents = (subjectId, sectionId) => {
  const key = `${subjectId}-${sectionId}`;
  if (!searchQueries.value[key]) {
    searchQueries.value[key] = '';
  }
};

</script>
