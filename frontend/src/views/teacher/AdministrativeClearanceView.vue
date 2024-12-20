<template>
  <div class="flex min-h-screen w-full bg-gray-900 text-white">
    <main class="flex-1 bg-gray-900 w-full p-10">
      <h2 class="text-4xl font-bold mb-6">Administrative Clearance</h2>

      <!-- Course Buttons -->
      <div class="flex flex-wrap gap-4 mb-6">
        <button
          v-for="course in Object.keys(groupedStudents)"
          :key="course"
          @click="selectCourse(course)"
          :class="[selectedCourse === course ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']"
          class="px-4 py-2 font-semibold rounded"
        >
          {{ course }}
        </button>

        <!-- View Cleared Students Button -->
        <div v-if="userRole.includes('Registrar')" class="flex justify-end">
          <button
            class="btn btn-primary px-6 py-2"
            @click="openClearedStudentsModal"
          >
            View Cleared Students
          </button>
        </div>
      </div>

      <!-- Cleared Students Modal -->
      <ClearedStudentsModal
        :isOpen="isClearedStudentsModalOpen"
        :clearedStudents="clearedStudents"
        @close="closeClearedStudentsModal"
      />

      <!-- Selected Course -->
      <div v-if="selectedCourse" class="mb-6">

        <div
          v-for="(students, sectionId) in groupedStudents[selectedCourse]"
          :key="sectionId"
          class="mb-6"
        >
          <h4 class="text-lg font-medium mb-4">
            Section: {{ students[0]?.section_name || 'Unknown Section' }}
          </h4>

          <!-- Search Bar -->
          <div class="mb-4">
            <input
              v-model="searchQueries[sectionId]"
              type="text"
              placeholder="Search in section..."
              class="w-full p-3 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Bulk Actions -->
          <div class="mb-4 flex justify-between">
            <div class="flex space-x-4">
              <button
                class="btn btn-success"
                @click="bulkApprove(sectionId)"
                :disabled="!selectedStudents[sectionId]?.length || allApproved(sectionId)"
              >
                Bulk Approve
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="table w-full bg-gray-700 rounded-lg">
              <thead>
                <tr class="bg-gray-800">
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                    <input
                      type="checkbox"
                      @change="toggleSelectAll(sectionId, $event)"
                      class="checkbox checkbox-primary"
                      :checked="selectedStudents[sectionId]?.length === students.length && !allApproved(sectionId)"
                      :disabled="allApproved(sectionId)"
                    />
                  </th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">#</th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                    First Name
                  </th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                    Last Name
                  </th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                    ID Number
                  </th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                    Status
                  </th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(student, index) in paginatedStudents(sectionId)"
                  :key="student.student_id"
                  class="hover:bg-gray-600"
                >
                  <td>
                    <input
                      type="checkbox"
                      v-model="selectedStudents[sectionId]"
                      :value="student.student_id"
                      class="checkbox checkbox-primary"
                      :disabled="student.clearance_status === 'Approved'"
                    />
                  </td>
                  <td>{{ index + 1 }}</td>
                  <td>{{ student.student_first_name }}</td>
                  <td>{{ student.student_last_name }}</td>
                  <td>{{ student.student_id_number }}</td>
                  <td
                    class="py-3 px-4"
                    :class="{
                      'text-blue-500': student.clearance_status === 'Pending',
                      'text-green-500': student.clearance_status === 'Approved',
                    }"
                  >
                    {{ student.clearance_status || 'Pending' }}
                  </td>
                  <td>
                    <!-- Approve Button -->
                    <button
                      class="btn btn-success btn-sm"
                      @click="approveClearance(student.student_id, student.department_id, student.section_id)"
                      :disabled="student.clearance_status === 'Approved'"
                    >
                      {{ student.clearance_status === 'Approved' ? 'Approved' : 'Approve' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination Controls -->
            <div class="flex justify-center items-center mt-4 space-x-2">
              <button
                class="btn btn-sm btn-secondary"
                :disabled="currentPage[sectionId] === 1"
                @click="prevPage(sectionId)"
              >
                Previous
              </button>
              <span class="text-gray-400">
                Page {{ currentPage[sectionId] }} of {{ totalPages(sectionId) }}
              </span>
              <button
                class="btn btn-sm btn-secondary"
                :disabled="currentPage[sectionId] === totalPages(sectionId)"
                @click="nextPage(sectionId)"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAdministrativeClearanceStore } from "@/stores/administrativeClearanceStore";
import { useAuthStore } from "@/stores/authStore";
import ClearedStudentsModal from "@/components/ClearedStudentsModal.vue";
import { useStudentStore } from "@/stores/studentStore";

const administrativeClearanceStore = useAdministrativeClearanceStore();
const authStore = useAuthStore();
const studentStore = useStudentStore();

const isClearedStudentsModalOpen = ref(false);
const clearedStudents = computed(() => studentStore.clearedStudents);

const openClearedStudentsModal = async () => {
  studentStore.getClearedStudents();
  isClearedStudentsModalOpen.value = true;
};

const closeClearedStudentsModal = () => {
  isClearedStudentsModalOpen.value = false;
};

const selectedCourse = ref(null);
const selectedStudents = ref({});
const searchQueries = ref({}); // Search query for each section
const currentPage = ref({});
const pageSize = 10; // Number of students per page

const students = computed(() => {
  const data = administrativeClearanceStore.clearanceData;
  return Array.isArray(data) ? data : [];
});

// Group students by course and section
const groupedStudents = computed(() => {
  if (!students.value.length) return {};

  const grouped = {};
  students.value.forEach((student) => {
    const course = student.department_name;
    const sectionId = student.section_id;

    if (!grouped[course]) grouped[course] = {};
    if (!grouped[course][sectionId]) grouped[course][sectionId] = [];
    grouped[course][sectionId].push(student);
  });
  return grouped;
});

// Select course
const selectCourse = (course) => {
  selectedCourse.value = course;
};

// Filter students for search and pagination
const filteredStudents = (sectionId) => {
  const query = searchQueries.value[sectionId]?.toLowerCase() || "";
  const studentsInSection = groupedStudents.value[selectedCourse.value][sectionId];

  return studentsInSection.filter(
    (student) =>
    String(student.student_id_number ?? '').toLowerCase().includes(query) ||
      student.student_first_name.toLowerCase().includes(query) ||
      student.student_last_name.toLowerCase().includes(query) ||
      student.student_email.toLowerCase().includes(query)
  );
};

// Paginated students for a section
const paginatedStudents = (sectionId) => {
  const start = (currentPage.value[sectionId] - 1 || 0) * pageSize;
  const end = start + pageSize;

  return filteredStudents(sectionId).slice(start, end);
};

// Total pages for a section
const totalPages = (sectionId) => {
  return Math.ceil(filteredStudents(sectionId).length / pageSize);
};

// Previous page
const prevPage = (sectionId) => {
  if (currentPage.value[sectionId] > 1) {
    currentPage.value[sectionId] -= 1;
  }
};

// Next page
const nextPage = (sectionId) => {
  if (currentPage.value[sectionId] < totalPages(sectionId)) {
    currentPage.value[sectionId] += 1;
  }
};

// Check if all students in a section are approved
const allApproved = (sectionId) => {
  const studentsInSection = groupedStudents.value[selectedCourse.value][sectionId];
  return studentsInSection.every((student) => student.clearance_status === "Approved");
};

// Toggle select all students in a section
const toggleSelectAll = (sectionId, event) => {
  if (event.target.checked) {
    selectedStudents.value[sectionId] = groupedStudents.value[selectedCourse.value][sectionId]
      .filter((student) => student.clearance_status !== "Approved")
      .map((student) => student.student_id);
  } else {
    selectedStudents.value[sectionId] = [];
  }
};

// Approve clearance for a single student
const approveClearance = async (studentId, departmentId, sectionId) => {
  const roleId = authStore.roleId;
  if (!roleId) return console.error("Role ID is missing");

  try {
    await administrativeClearanceStore.updateClearanceStatus(
      studentId,
      departmentId,
      sectionId,
      "Approved",
      roleId
    );

    // Update the clearance status locally
    const sectionStudents = groupedStudents.value[selectedCourse.value][sectionId];
    const student = sectionStudents.find((s) => s.student_id === studentId);
    if (student) {
      student.clearance_status = "Approved";
    }

    alert("Clearance approved");
  } catch (error) {
    console.error("Error approving clearance:", error);
    alert("An error occurred while approving clearance.");
  }
};

// Bulk approve selected students
const bulkApprove = async (sectionId) => {
  const roleId = authStore.roleId;
  if (!roleId) return console.error("Role ID is missing");

  const studentIds = selectedStudents.value[sectionId];
  if (!studentIds || !studentIds.length) {
    alert("No students selected for approval.");
    return;
  }

  try {
    await Promise.all(
      studentIds.map((studentId) =>
        administrativeClearanceStore.updateClearanceStatus(
          studentId,
          groupedStudents.value[selectedCourse.value][sectionId][0].department_id,
          sectionId,
          "Approved",
          roleId
        )
      )
    );

    // Update local data
    const sectionStudents = groupedStudents.value[selectedCourse.value][sectionId];
    sectionStudents.forEach((student) => {
      if (studentIds.includes(student.student_id)) {
        student.clearance_status = "Approved";
      }
    });

    alert("Bulk approval successful.");
    selectedStudents.value[sectionId] = [];
  } catch (error) {
    console.error("Error during bulk approval:", error);
    alert("An error occurred during bulk approval.");
  }
};

// Fetch clearance data on mount
onMounted(async () => {
  const roleId = authStore.roleId;
  if (roleId) {
    await administrativeClearanceStore.getAdministrativeClearance(roleId);
  }

  if (!selectedCourse.value && Object.keys(groupedStudents.value).length > 0) {
    selectedCourse.value = Object.keys(groupedStudents.value)[0];
  }

  // Initialize search queries and pagination for all sections
  Object.keys(groupedStudents.value[selectedCourse.value] || {}).forEach((sectionId) => {
    searchQueries.value[sectionId] = "";
    currentPage.value[sectionId] = 1;
  });
});

const userRole = computed(() => authStore.userRole);
</script>
