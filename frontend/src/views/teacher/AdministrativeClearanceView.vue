<template>
    <div class="flex min-h-screen w-full bg-gray-900 text-white">
      <main class="flex-1 bg-gray-900 w-full p-10">
        <h2 class="text-4xl font-bold mb-6">Administrative Clearance</h2>
  
        <!-- Department Buttons -->
        <div class="flex flex-wrap gap-4 mb-6">
          <button
            v-for="department in Object.keys(groupedStudents)"
            :key="department"
            @click="selectDepartment(department)"
            :class="[
          'px-4 py-2 font-semibold rounded',
          selectedDepartment === department
            ? 'bg-pink-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]">
            {{ department }}
          </button>
        </div>
  
        <!-- Selected Department -->
        <div v-if="selectedDepartment" class="mb-6">
          <h3 class="text-xl font-semibold mb-4">Department: {{ selectedDepartment }}</h3>
          
          <div v-for="(students, section) in groupedStudents[selectedDepartment]" :key="section" class="mb-6">
            <h4 class="text-lg font-medium mb-4">Section: {{ section }}</h4>

            <div class="flex justify-between items-center mt-4">
            <div class="flex-1"></div>
            <div class="flex space-x-4 mb-4">
                <button
  class="btn btn-success btn-sm"
  @click="bulkApprove(section)"
  :disabled="selectedStudents[section].length === 0"
>
  Bulk Approve
</button>
<button
  class="btn btn-error btn-sm"
  @click="bulkReject(section)"
  :disabled="selectedStudents[section].length === 0"
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
                    <th class="py-3 px-4 text-left text-gray-300 font-semibold">
                      <input type="checkbox" class="checkbox checkbox-primary" @change="selectAll(section, $event)" />
                    </th>
                    <th class="py-3 px-4 text-left text-gray-300 font-semibold">#</th>
                    <th class="py-3 px-4 text-left text-gray-300 font-semibold">First Name</th>
                    <th class="py-3 px-4 text-left text-gray-300 font-semibold">Last Name</th>
                    <th class="py-3 px-4 text-left text-gray-300 font-semibold">Email</th>
                    <th class="py-3 px-4 text-left text-gray-300 font-semibold">Status</th>
                    <th class="py-3 px-4 text-left text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(student, index) in paginatedStudents(students, section)" :key="student.id" class="hover:bg-gray-600">
                    <input
  type="checkbox"
  class="checkbox checkbox-primary ml-4"
  @change="selectAll(section, $event)"
  :checked="selectedStudents[section]?.length === groupedStudents[selectedDepartment]?.[section]?.length"
/>

                    <td>{{ index + 1 }}</td>
                    <td>{{ student.first_name }}</td>
                    <td>{{ student.last_name }}</td>
                    <td>{{ student.email }}</td>
                    <td class="py-3 px-4" :class="{
                    'text-blue-500': !student.clearance_status || student.clearance_status === 'Pending',
                    'text-green-500': student.clearance_status === 'Approved',
                    'text-red-500': student.clearance_status === 'Rejected'
                  }">
                  {{ student.clearance_status || 'Pending' }}
                </td>
                    <td class="flex space-x-2">
                      <button class="btn btn-success btn-sm" @click="approveClearance(student.student_id, student.department_id, student.section_id)">Approve</button>
                      <button class="btn btn-error btn-sm" @click="rejectClearance(student.student_id, student.department_id, student.section_id)">Reject</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <!-- Pagination Controls -->
            <div class="flex justify-between items-center mt-4">
              <div class="flex items-center">
                <button
                  class="btn btn-sm btn-primary"
                  @click="previousPage(section)"
                  :disabled="currentPages[section] === 1"
                >
                  Previous
                </button>
                <span class="mx-4">Page {{ currentPages[section] }} of {{ totalPages(section) }}</span>
                <button
                  class="btn btn-sm btn-primary"
                  @click="nextPage(section)"
                  :disabled="currentPages[section] >= totalPages(section)"
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
import { ref, computed, onMounted } from 'vue';
import { useStudentStore } from '@/stores/studentStore';
import { useAdministrativeClearanceStore } from '@/stores/administrativeClearanceStore';

const administrativeClearanceStore = useAdministrativeClearanceStore();
const studentStore = useStudentStore();
const isLoading = computed(() => studentStore.isLoading);
const students = computed(() => studentStore.students);
const currentPages = ref({});
const pageSize = 5;

// State for selected department and selected students
const selectedDepartment = ref(null);
const selectedStudents = ref({});

// Group students by department and section
const groupedStudents = computed(() => {
  const grouped = {};

  students.value.forEach((student) => {
    const departmentId = student.department_id; // Use actual department ID
    const sectionId = student.section_id; // Use actual section ID

    if (!grouped[departmentId]) grouped[departmentId] = {};
    if (!grouped[departmentId][sectionId]) grouped[departmentId][sectionId] = [];
    grouped[departmentId][sectionId].push(student);
  });

  return grouped;
});


// Pagination and actions
const paginatedStudents = (students, section) => {
  const page = currentPages.value[section] || 1;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return students.slice(start, end);
};
const nextPage = (section) => { currentPages.value[section]++; };
const previousPage = (section) => { currentPages.value[section]--; };
const totalPages = (section) => {
  const sectionStudents = students.value.filter((student) => student.section === section);
  return Math.ceil(sectionStudents.length / pageSize);
};

// Select department
// Select department
const selectDepartment = (departmentId) => {
  selectedDepartment.value = departmentId; // Use the department_id directly
};

// Select all students in a section
const selectAll = (sectionId, event) => {
  if (event.target.checked) {
    // Select all students in the section
    selectedStudents.value[sectionId] = groupedStudents.value[selectedDepartment.value][sectionId].map(
      (student) => student.student_id // Use student_id for selection
    );
  } else {
    // Deselect all students in the section
    selectedStudents.value[sectionId] = [];
  }

  // Force Vue to re-evaluate the v-model binding for checkboxes
  selectedStudents.value = { ...selectedStudents.value };
};



const approveClearance = async (studentId, departmentId, sectionId) => {
  try {
    await administrativeClearanceStore.updateClearanceStatus(studentId, departmentId, sectionId, 'Approved');
    updateLocalStatus(studentId, departmentId, sectionId, 'Approved');
    alert('Clearance approved');
    studentStore.fetchStudents();
  } catch (error) {
    console.error('Error approving clearance:', error);
  }
};

const rejectClearance = async (studentId, departmentId, sectionId) => {
  try {
    await administrativeClearanceStore.updateClearanceStatus(studentId, departmentId, sectionId, 'Rejected');
    updateLocalStatus(studentId, departmentId, sectionId, 'Rejected');
    alert('Clearance rejected');
    studentStore.fetchStudents();
  } catch (error) {
    console.error('Error rejecting clearance:', error);
  }
};

const bulkApprove = async (sectionId) => {
  const studentIds = selectedStudents.value[sectionId]; // Get selected student IDs for the section
  if (!studentIds || studentIds.length === 0) {
    console.warn('No students selected for bulk approval.');
    return;
  }

  // Fetch departmentId and sectionId from the first student in the selected section
  const departmentId = groupedStudents.value[selectedDepartment.value][sectionId][0]?.department_id;

  try {
    await administrativeClearanceStore.bulkUpdateStatus(studentIds, departmentId, sectionId, 'Approved');
    console.log(administrativeClearanceStore.successMessage);

    // Update the local status of the students to 'Approved'
    groupedStudents.value[selectedDepartment.value][sectionId].forEach((student) => {
      if (studentIds.includes(student.student_id)) {
        student.clearance_status = 'Approved';
      }
    });

    // Clear the selection for the section
    selectedStudents.value[sectionId] = [];
  } catch (error) {
    console.error('Error during bulk approval:', error);
  }
};

const bulkReject = async (sectionId) => {
  const studentIds = selectedStudents.value[sectionId]; // Get selected student IDs for the section
  if (!studentIds || studentIds.length === 0) {
    console.warn('No students selected for bulk rejection.');
    return;
  }

  // Fetch departmentId and sectionId from the first student in the selected section
  const departmentId = groupedStudents.value[selectedDepartment.value][sectionId][0]?.department_id;

  try {
    await administrativeClearanceStore.bulkUpdateStatus(studentIds, departmentId, sectionId, 'Rejected');
    console.log(administrativeClearanceStore.successMessage);

    // Update the local status of the students to 'Rejected'
    groupedStudents.value[selectedDepartment.value][sectionId].forEach((student) => {
      if (studentIds.includes(student.student_id)) {
        student.clearance_status = 'Rejected';
      }
    });

    // Clear the selection for the section
    selectedStudents.value[sectionId] = [];
  } catch (error) {
    console.error('Error during bulk rejection:', error);
  }
};


// Update local status of a student
const updateLocalStatus = (studentId, departmentId, sectionId, status) => {
  const section = groupedStudents.value[departmentId]?.[sectionId];
  if (section) {
    const student = section.find(stu => stu.student_id === studentId);
    if (student) {
      student.student_status = status;
    }
  }
};
// Fetch students on component mount
onMounted(async () => {
  await studentStore.fetchStudents();
});
</script>
