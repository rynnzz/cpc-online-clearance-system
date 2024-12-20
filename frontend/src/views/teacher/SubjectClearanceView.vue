<template>
  <div class="flex min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
    <main class="flex-1 w-full p-10">
      <h1 class="text-5xl font-extrabold mb-8 tracking-wide text-center">Approve Clearance</h1>

      <div
        v-for="subject in teacherInfo.subjects"
        :key="subject.course + subject.year + subject.subjectName"
        class="card shadow-2xl bg-gray-800 bg-opacity-90 mb-8 p-8 rounded-lg transition-all hover:shadow-lg hover:scale-105"
      >
        <!-- Section & Subject Details -->
        <div class="mb-6 flex flex-col sm:flex-row sm:justify-between items-center">
          <div>
            <h2 class="text-3xl font-bold text-blue-400">Section: {{ subject.course }} - {{ subject.section }}</h2>
            <p class="text-xl text-gray-300 mt-2">Subject: {{ subject.subjectName }}</p>
          </div>
        </div>

        <!-- Search Bar & Bulk Action -->
        <div class="mb-6 flex flex-col sm:flex-row sm:justify-between items-center">
          <input
            v-model="searchQueries[`${subject.subjectId}-${subject.sectionId}`]"
            @input="filterStudents(subject.subjectId, subject.sectionId)"
            type="text"
            placeholder="Search by name"
            class="input input-bordered w-full sm:w-1/3 bg-gray-700 text-white border-2 border-gray-600 p-3 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
          <div class="mt-4 sm:mt-0">
            <button
              @click="bulkApprove(subject.subjectId, subject.sectionId)"
              :disabled="!selectedStudents[`${subject.subjectId}-${subject.sectionId}`]?.length || allApproved(subject.subjectId, subject.sectionId)"
              class="btn btn-success btn-wide"
            >
              Bulk Approve
            </button>
          </div>
        </div>

        <!-- Student Table -->
        <div class="overflow-x-auto rounded-lg shadow-md">
          <table class="table w-full bg-gray-700">
            <thead class="bg-gray-800 text-gray-300">
              <tr>
                <th class="py-4 px-4">
                  <input
                    type="checkbox"
                    @change="selectAll($event, subject.subjectId, subject.sectionId)"
                    :disabled="allApproved(subject.subjectId, subject.sectionId)"
                  />
                </th>
                <th class="py-4 px-4">First Name</th>
                <th class="py-4 px-4">Last Name</th>
                <th class="py-4 px-4">Status</th>
                <th class="py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="student in paginatedStudents(subject.subjectId, subject.sectionId)"
                :key="student.studentId"
                class="hover:bg-gray-600 transition-all"
              >
                <td class="py-4 px-4">
                  <input
                    type="checkbox"
                    :value="student.studentId"
                    v-model="selectedStudents[`${subject.subjectId}-${subject.sectionId}`]"
                    :disabled="student.status === 'Approved'"
                  />
                </td>
                <td class="py-4 px-4">{{ student.firstName }}</td>
                <td class="py-4 px-4">{{ student.lastName }}</td>
                <td
                  class="py-4 px-4 font-semibold"
                  :class="{
                    'text-blue-400': !student.status || student.status === 'Pending',
                    'text-green-500': student.status === 'Approved',
                  }"
                >
                  {{ student.status || 'Pending' }}
                </td>
                <td class="py-4 px-4">
                  <button
                    @click="approveClearance(student.studentId, subject.subjectId, subject.sectionId)"
                    class="btn btn-success"
                    :disabled="student.status === 'Approved'"
                  >
                    {{ student.status === 'Approved' ? 'Approved' : 'Approve' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex justify-between items-center mt-6">
          <button
            @click="previousPage(subject.subjectId, subject.sectionId)"
            class="btn btn-primary"
            :disabled="currentPages[`${subject.subjectId}-${subject.sectionId}`] === 1"
          >
            Previous
          </button>
          <span class="text-gray-400 font-semibold">
            Page {{ currentPages[`${subject.subjectId}-${subject.sectionId}`] }} of {{ totalPages(subject.subjectId, subject.sectionId) }}
          </span>
          <button
            @click="nextPage(subject.subjectId, subject.sectionId)"
            class="btn btn-primary"
            :disabled="currentPages[`${subject.subjectId}-${subject.sectionId}`] >= totalPages(subject.subjectId, subject.sectionId)"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useTeacherStore } from "@/stores/teacherStore";
import { useClearanceStore } from "@/stores/clearanceStore";
import { onMounted, computed, ref } from "vue";

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

const allApproved = (subjectId, sectionId) => {
  const subject = teacherInfo.value.subjects.find(
    (subj) => subj.subjectId === subjectId && subj.sectionId === sectionId
  );
  if (!subject) return false;
  return subject.students.every((student) => student.status === "Approved");
};

const paginatedStudents = (subjectId, sectionId) => {
  const query = searchQueries.value[`${subjectId}-${sectionId}`]?.toLowerCase() || "";
  const section = teacherInfo.value.subjects.find(
    (subj) => subj.subjectId === subjectId && subj.sectionId === sectionId
  );
  if (!section) return [];

  const filtered = section.students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query)
  );

  const page = currentPages.value[`${subjectId}-${sectionId}`] || 1;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return filtered.slice(start, end);
};

const totalPages = (subjectId, sectionId) => {
  const query = searchQueries.value[`${subjectId}-${sectionId}`]?.toLowerCase() || "";
  const section = teacherInfo.value.subjects.find(
    (subj) => subj.subjectId === subjectId && subj.sectionId === sectionId
  );
  if (!section) return 1;

  const filtered = section.students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query)
  );

  return Math.ceil(filtered.length / pageSize);
};

const nextPage = (subjectId, sectionId) => {
  const key = `${subjectId}-${sectionId}`;
  if (!currentPages.value[key]) currentPages.value[key] = 1;

  if (currentPages.value[key] < totalPages(subjectId, sectionId)) {
    currentPages.value[key]++;
  }
};

const previousPage = (subjectId, sectionId) => {
  const key = `${subjectId}-${sectionId}`;
  if (!currentPages.value[key]) currentPages.value[key] = 1;

  if (currentPages.value[key] > 1) {
    currentPages.value[key]--;
  }
};

const approveClearance = async (studentId, subjectId, sectionId) => {
  try {
    await clearanceStore.updateClearanceStatus(studentId, subjectId, sectionId, "Approved");
    updateLocalStatus(studentId, subjectId, sectionId, "Approved");
    alert("Clearance approved");
  } catch (error) {
    console.error("Error approving clearance:", error);
  }
};

const updateLocalStatus = (studentId, subjectId, sectionId, status) => {
  const subject = teacherInfo.value.subjects.find(
    (subj) => subj.subjectId === subjectId && subj.sectionId === sectionId
  );
  if (subject) {
    const student = subject.students.find((stu) => stu.studentId === studentId);
    if (student) {
      student.status = status;
    }
  }
};

const selectAll = (event, subjectId, sectionId) => {
  const key = `${subjectId}-${sectionId}`;
  const subject = teacherInfo.value.subjects.find(
    (subj) => subj.subjectId === subjectId && subj.sectionId === sectionId
  );
  if (!subject) return;

  selectedStudents.value[key] = event.target.checked
    ? subject.students.filter((student) => student.status !== "Approved").map((student) => student.studentId)
    : [];
};

const bulkApprove = async (subjectId, sectionId) => {
  const key = `${subjectId}-${sectionId}`;
  const selectedIds = selectedStudents.value[key] || [];

  try {
    await Promise.all(
      selectedIds.map((studentId) =>
        clearanceStore.updateClearanceStatus(studentId, subjectId, sectionId, "Approved").then(() =>
          updateLocalStatus(studentId, subjectId, sectionId, "Approved")
        )
      )
    );
    alert("Bulk approval completed");
    selectedStudents.value[key] = [];
  } catch (error) {
    console.error("Error with bulk approval:", error);
  }
};

const filterStudents = (subjectId, sectionId) => {
  const key = `${subjectId}-${sectionId}`;
  if (!searchQueries.value[key]) {
    searchQueries.value[key] = "";
  }
};
</script>
