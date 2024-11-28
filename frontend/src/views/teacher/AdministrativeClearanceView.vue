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
      </div>

      <!-- Selected Course -->
      <div v-if="selectedCourse" class="mb-6">
        <h3 class="text-xl font-semibold mb-4">Course: {{ selectedCourse }}</h3>

        <div v-for="(students, sectionId) in groupedStudents[selectedCourse]" :key="sectionId" class="mb-6">
          <h4 class="text-lg font-medium mb-4">
            Section: {{ students[0]?.section || 'Unknown Section' }}
          </h4>

          <!-- Bulk Actions -->
          <div class="mb-4 flex justify-between">
            <div>
              <input
                type="checkbox"
                @change="toggleSelectAll(sectionId, $event)"
                class="checkbox checkbox-primary"
                :checked="selectedStudents[sectionId]?.length === students.length"
              />
              Select All
            </div>
            <div class="flex space-x-4">
              <button
                class="btn btn-success"
                @click="bulkApprove(sectionId)"
                :disabled="!selectedStudents[sectionId]?.length"
              >
                Bulk Approve
              </button>
              <button
                class="btn btn-error"
                @click="bulkReject(sectionId)"
                :disabled="!selectedStudents[sectionId]?.length"
              >
                Bulk Reject
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="table w-full bg-gray-700 rounded-lg">
              <thead>
                <tr class="bg-gray-800">
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">Select</th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">#</th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">First Name</th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">Last Name</th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">Email</th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">Status</th>
                  <th class="py-3 px-4 text-left text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(student, index) in students"
                  :key="student.student_id"
                  class="hover:bg-gray-600"
                >
                  <td>
                    <input
                      type="checkbox"
                      v-model="selectedStudents[sectionId]"
                      :value="student.student_id"
                      class="checkbox checkbox-primary"
                    />
                  </td>
                  <td>{{ index + 1 }}</td>
                  <td>{{ student.first_name }}</td>
                  <td>{{ student.last_name }}</td>
                  <td>{{ student.email }}</td>
                  <td
                    class="py-3 px-4"
                    :class="{
                      'text-blue-500': !student.clearance_status || student.clearance_status === 'Pending',
                      'text-green-500': student.clearance_status === 'Approved',
                      'text-red-500': student.clearance_status === 'Rejected'
                    }"
                  >
                    {{ student.clearance_status || 'Pending' }}
                  </td>
                  <td class="flex space-x-2">
                    <button
                      class="btn btn-success btn-sm"
                      @click="approveClearance(student.student_id, student.department_id, student.section_id)"
                    >
                      Approve
                    </button>
                    <button
                      class="btn btn-error btn-sm"
                      @click="rejectClearance(student.student_id, student.department_id, student.section_id)"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStudentStore } from '@/stores/studentStore';
import { useAdministrativeClearanceStore } from '@/stores/administrativeClearanceStore';

const administrativeClearanceStore = useAdministrativeClearanceStore();
const studentStore = useStudentStore();
const students = computed(() => studentStore.students);

// State for selected course and selected students
const selectedCourse = ref(null);
const selectedStudents = ref({}); // Stores selected students by section ID

// Group students by course and section
const groupedStudents = computed(() => {
  const grouped = {};

  students.value.forEach((student) => {
    const course = student.course;
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

// Toggle select all students in a section
const toggleSelectAll = (sectionId, event) => {
  if (event.target.checked) {
    selectedStudents.value[sectionId] = groupedStudents.value[selectedCourse.value][sectionId].map(
      (student) => student.student_id
    );
  } else {
    selectedStudents.value[sectionId] = [];
  }
};

// Approve clearance for a single student
const approveClearance = async (studentId, departmentId, sectionId) => {
  try {
    await administrativeClearanceStore.updateClearanceStatus(studentId, departmentId, sectionId, 'Approved');
    updateLocalStatus(studentId, sectionId, 'Approved');
    alert('Clearance approved');
  } catch (error) {
    console.error('Error approving clearance:', error);
  }
};

// Reject clearance for a single student
const rejectClearance = async (studentId, departmentId, sectionId) => {
  try {
    await administrativeClearanceStore.updateClearanceStatus(studentId, departmentId, sectionId, 'Rejected');
    updateLocalStatus(studentId, sectionId, 'Rejected');
    alert('Clearance rejected');
  } catch (error) {
    console.error('Error rejecting clearance:', error);
  }
};

// Bulk approve selected students
const bulkApprove = async (sectionId) => {
  const studentIds = selectedStudents.value[sectionId];
  const studentsInSection = groupedStudents.value[selectedCourse.value][sectionId];
  const departmentId = studentsInSection[0]?.department_id;

  try {
    await Promise.all(
      studentIds.map((studentId) =>
        administrativeClearanceStore.updateClearanceStatus(studentId, departmentId, sectionId, 'Approved')
      )
    );
    studentIds.forEach((studentId) => updateLocalStatus(studentId, sectionId, 'Approved'));
    alert('Bulk approval successful');
    selectedStudents.value[sectionId] = [];
  } catch (error) {
    console.error('Error during bulk approval:', error);
  }
};

// Bulk reject selected students
const bulkReject = async (sectionId) => {
  const studentIds = selectedStudents.value[sectionId];
  const studentsInSection = groupedStudents.value[selectedCourse.value][sectionId];
  const departmentId = studentsInSection[0]?.department_id;

  try {
    await Promise.all(
      studentIds.map((studentId) =>
        administrativeClearanceStore.updateClearanceStatus(studentId, departmentId, sectionId, 'Rejected')
      )
    );
    studentIds.forEach((studentId) => updateLocalStatus(studentId, sectionId, 'Rejected'));
    alert('Bulk rejection successful');
    selectedStudents.value[sectionId] = [];
  } catch (error) {
    console.error('Error during bulk rejection:', error);
  }
};

// Update local status of a student
const updateLocalStatus = (studentId, sectionId, status) => {
  const section = groupedStudents.value[selectedCourse.value]?.[sectionId];
  if (section) {
    const student = section.find((stu) => stu.student_id === studentId);
    if (student) {
      student.clearance_status = status;
    }
  }
};

// Fetch students on component mount
onMounted(async () => {
  await studentStore.fetchStudents();
});
</script>
