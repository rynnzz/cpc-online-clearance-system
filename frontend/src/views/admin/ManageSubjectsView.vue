<template>
  <div class="p-8 bg-gray-900 text-gray-100 min-h-screen w-full relative space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Manage Subjects</h1>
      <div class="flex items-center space-x-4">
        <div>
          <label for="schoolYear" class="block text-sm font-semibold">School Year:</label>
          <select
            id="schoolYear"
            v-model="selectedSchoolYear"
            class="input input-bordered bg-gray-800 text-white px-4 py-2 rounded"
          >
            <option v-for="year in schoolYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Semester Selection -->
    <div class="bg-gray-800 p-6 rounded-lg shadow space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold">Current Semester: {{ currentSemester }}</h2>
        <div class="flex items-center space-x-4">
          <p>Update Semester:</p>
          <select
            v-model="selectedSemester"
            class="input input-bordered bg-gray-700 text-white px-4 py-2 rounded"
          >
            <option value="1st semester">1st Semester</option>
            <option value="2nd semester">2nd Semester</option>
          </select>
          <button
            class="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
            @click="confirmSemester"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>

    <!-- Department Tabs -->
    <div class="bg-gray-800 p-4 rounded-lg shadow space-x-4 flex">
      <button
        v-for="dept in departments"
        :key="dept.id"
        @click="selectedDepartment = dept"
        :class="[
          'px-4 py-2 font-semibold rounded',
          selectedDepartment === dept
            ? 'bg-pink-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]"
      >
        {{ dept.name }}
      </button>
    </div>

    <!-- Action Buttons -->
    <div class="flex space-x-4">
      <button
        @click="openAddModal"
        class="btn btn-primary px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600"
      >
        Add New Subject
      </button>

      <!-- Add Subject Modal -->
      <div v-if="showAddModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div class="bg-gray-800 text-white rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4">
    <h2 class="text-2xl font-semibold text-center">Add New Subject</h2>
    <form @submit.prevent="addSubject" class="space-y-4">
      <SubjectForm
        :subjectData.sync="subjectData"
        :departments="departments"
        :yearNames="yearNames"
        :schoolYears="schoolYears"
      />
      <div class="flex justify-end space-x-4">
        <button @click="closeAddModal" type="button" class="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
          Cancel
        </button>
        <button type="submit" class="px-4 py-2 bg-green-500 rounded hover:bg-green-600">
          Add Subject
        </button>
      </div>
    </form>
  </div>
</div>

      <button
        @click="openBulkAddModal"
        class="btn btn-secondary px-4 py-2 bg-purple-500 text-white font-semibold rounded hover:bg-purple-600"
      >
        Bulk Add
      </button>

      <!-- Bulk Add Modal -->
      <div v-if="isBulkAddModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div class="bg-gray-800 text-white rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4">
    <h2 class="text-2xl font-semibold text-center">Bulk Add Subjects</h2>
    <form @submit.prevent="handleBulkAdd" class="space-y-4">
      <div>
        <input
          type="file"
          @change="handleFileUpload"
          accept=".xlsx, .xls"
          class="block w-full px-4 py-2 border border-gray-700 rounded bg-gray-900 text-gray-300 focus:ring-2 focus:ring-blue-500"
        />
        <p class="text-sm text-gray-400 mt-2">Acceptable formats: .xlsx, .xls</p>
      </div>
      <div class="flex justify-end space-x-4">
        <button @click="closeBulkAddModal" type="button" class="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
          Cancel
        </button>
        <button type="submit" class="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600">
          Add Subjects
        </button>
      </div>
    </form>
  </div>
</div>

<div class="ml-auto">
    <button
      @click="bulkDeleteSubjects"
      class="btn btn-error px-4 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600"
      :disabled="!selectedSubjects.length"
    >
      Delete Selected ({{ selectedSubjects.length }})
    </button>
  </div>
    </div>

    <!-- Subject Tables -->
    <div v-for="year in yearNames" :key="year" class="space-y-8">
      <div class="bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-4">{{ year }} Subjects</h2>

        <!-- 1st Semester -->
        <h3 class="text-lg font-semibold mb-2">1st Semester</h3>
        <table class="table-auto w-full text-sm">
          <thead>
            <tr class="bg-gray-700">
              <th class="p-4">
                <input
                  type="checkbox"
                  @change="selectAll($event, year, 1)"
                  :checked="areAllSelected(year, 1)"
                />
              </th>
              <th class="p-4 text-left">#</th>
              <th class="p-4 text-left">Subject Code</th>
              <th class="p-4 text-left">Subject Name</th>
              <th class="p-4 text-left">Units</th>
              <th class="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(subject, index) in filteredSubjects(year, 1)"
              :key="subject.id"
              class="hover:bg-gray-600"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  :value="subject.id"
                  v-model="selectedSubjects"
                />
              </td>
              <td class="p-4">{{ index + 1 }}</td>
              <td class="p-4">{{ subject.code }}</td>
              <td class="p-4">{{ subject.name }}</td>
              <td class="p-4">{{ subject.units }}</td>
              <td class="p-4 flex space-x-2">
                <button
                  @click="openEditModal(subject)"
                  class="btn btn-sm btn-warning bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  @click="deleteSubject(subject.id)"
                  class="btn btn-sm btn-error bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredSubjects(year, 1).length === 0">
              <td colspan="6" class="p-4 text-center text-gray-500">
                No subjects found for 1st Semester
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 2nd Semester -->
        <h3 class="text-lg font-semibold mt-4 mb-2">2nd Semester</h3>
        <table class="table-auto w-full text-sm">
          <thead>
            <tr class="bg-gray-700">
              <th class="p-4">
                <input
                  type="checkbox"
                  @change="selectAll($event, year, 2)"
                  :checked="areAllSelected(year, 2)"
                />
              </th>
              <th class="p-4 text-left">#</th>
              <th class="p-4 text-left">Subject Code</th>
              <th class="p-4 text-left">Subject Name</th>
              <th class="p-4 text-left">Units</th>
              <th class="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(subject, index) in filteredSubjects(year, 2)"
              :key="subject.id"
              class="hover:bg-gray-600"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  :value="subject.id"
                  v-model="selectedSubjects"
                />
              </td>
              <td class="p-4">{{ index + 1 }}</td>
              <td class="p-4">{{ subject.code }}</td>
              <td class="p-4">{{ subject.name }}</td>
              <td class="p-4">{{ subject.units }}</td>
              <td class="p-4 flex space-x-2">
                <button
                  @click="openEditModal(subject)"
                  class="btn btn-sm btn-warning bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>

                <!-- Edit Subject Modal -->
                <div v-if="showEditModal" class="fixed inset-0 flex items-center justify-center bg-gray bg-opacity-50 z-50 backdrop-blur-sm">
  <div class="bg-gray-800 text-white rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4">
    <h2 class="text-2xl font-semibold text-center">Edit Subject</h2>
    <form @submit.prevent="saveEdit" class="space-y-4">
      <SubjectForm
        :subjectData.sync="subjectData"
        :departments="departments"
        :yearNames="yearNames"
        :schoolYears="schoolYears"
      />
      <div class="flex justify-end space-x-4">
        <button @click="closeEditModal" type="button" class="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
          Cancel
        </button>
        <button type="submit" class="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">
          Save Changes
        </button>
      </div>
    </form>
  </div>
</div>

                <button
                  @click="deleteSubject(subject.id)"
                  class="btn btn-sm btn-error bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredSubjects(year, 2).length === 0">
              <td colspan="6" class="p-4 text-center text-gray-500">
                No subjects found for 2nd Semester
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useSubjectStore } from '@/stores/subjectStore';
import { useSemesterStore } from '@/stores/semesterStore';
import SubjectForm from '@/components/SubjectForm.vue';

const subjectStore = useSubjectStore();
const semesterStore = useSemesterStore();

// Initialize departments and selectedDepartment correctly
const departments = computed(() => subjectStore.departments.sort((a, b) => a.name.localeCompare(b.name)));
const selectedDepartment = ref(null);
const selectedSchoolYear = ref('');
const currentSemester = ref('');
const selectedSemester = ref('');

onMounted(async () => {
  // Fetch subjects and current semester
  await subjectStore.getAllSubjects();
  currentSemester.value = await semesterStore.getSemester();
  selectedSemester.value = currentSemester.value;

  // Set default department to BEED
  const defaultDepartment = subjectStore.departments.find(dept => dept.name === "BEED");
  if (defaultDepartment) {
    selectedDepartment.value = defaultDepartment;
  }
});


const confirmSemester = async () => {
  if (!selectedSemester.value.trim()) {
    alert("Please select a valid semester.");
    return;
  }

  try {
    await semesterStore.updateSemester({ semester: selectedSemester.value });
    currentSemester.value = selectedSemester.value; // Update the displayed semester
    alert("Semester updated successfully!");
  } catch (error) {
    console.error("Error updating semester:", error);
  }
};
// Set `selectedDepartment` once departments are loaded
watch(departments, (newDepartments) => {
  if (newDepartments.length > 0 && !selectedDepartment.value) {
    selectedDepartment.value = newDepartments[0]; // Default to the first department
  }
}, { immediate: true });

// Year levels for selection
const yearNames = {
  '1st Year': '1st Year',
  '2nd Year': '2nd Year',
  '3rd Year': '3rd Year',
  '4th Year': '4th Year'
};

// Subject data for forms
const subjectData = ref({
  name: '',
  code: '',
  department_id: null,
  year: '',
  schoolYear: '',
  semester: 1,
  units: 0
});

const showAddModal = ref(false);
const showEditModal = ref(false);
const editSubjectId = ref(null);
const selectedSubjects = ref([]);
const file = ref(null);
const isBulkAddModalOpen = ref(false);

const openBulkAddModal = () => { isBulkAddModalOpen.value = true; };
const closeBulkAddModal = () => { isBulkAddModalOpen.value = false; };

// Filtered subjects by year and semester
const filteredSubjects = (yearName, semester) => {
  if (!selectedDepartment.value) return []; // Check if department is selected
  return subjectStore.subjects.filter(
    subject =>
      subject.department_id === selectedDepartment.value.id &&
      subject.year === yearName &&
      subject.school_year === selectedSchoolYear.value &&
      subject.semester === semester
  );
};

// Handle file upload for bulk add
const handleFileUpload = (event) => {
  file.value = event.target.files[0];
};

const handleBulkAdd = async () => {
  if (!file.value) {
    alert("Please upload an Excel file.");
    return;
  }
  try {
    const formData = new FormData();
    formData.append('file', file.value);
    await subjectStore.bulkAddSubjects(formData);
    alert("Subjects added successfully.");
    closeBulkAddModal();
  } catch (error) {
    console.error("Error adding Subjects:", error);
  }
};

// Dynamically populate schoolYears based on subjects data
const schoolYears = computed(() => {
  const years = new Set(subjectStore.subjects.map(subject => subject.school_year));
  return Array.from(years).sort();
});

// Modal functions
const openAddModal = () => {
  subjectData.value = { name: '', code: '', department_id: null, year: '', schoolYear: '', semester: 1, units: 0 };
  showAddModal.value = true;
};

const closeAddModal = () => { showAddModal.value = false; };

const openEditModal = (subject) => {
  subjectData.value = {
    ...subject,
    department_id: subject.department_id, // Use department_id for editing
    year: subject.year,
  };
  editSubjectId.value = subject.id;
  showEditModal.value = true;
};

const closeEditModal = () => { showEditModal.value = false; };

// Add and edit subjects
const addSubject = async () => {
  await subjectStore.addSubject(subjectData.value);
  await subjectStore.getAllSubjects();
  alert ('Subject added successfully')
  closeAddModal();
};

const saveEdit = async () => {
  await subjectStore.updateSubject(editSubjectId.value, subjectData.value);
  await subjectStore.getAllSubjects();
  closeEditModal();
};

// Set initial school year when available
watch(schoolYears, (newSchoolYears) => {
  if (newSchoolYears.length > 0 && !selectedSchoolYear.value) {
    selectedSchoolYear.value = newSchoolYears[0];
  }
});

// Delete functions
const deleteSubject = async (id) => {
  try {
    await subjectStore.deleteSubject(id);
    await subjectStore.getAllSubjects();
    alert('Subject deleted successfully');
  } catch (error) {
    console.error('Error deleting subject:', error);
  }
};

const bulkDeleteSubjects = async () => {
  try {
    for (const subjectId of selectedSubjects.value) {
      await subjectStore.deleteSubject(subjectId);
    }
    selectedSubjects.value = []; // Clear selection after delete
    await subjectStore.getAllSubjects(); // Refresh data
    alert('Selected subjects deleted successfully');
  } catch (error) {
    console.error('Error deleting subjects:', error);
  }
};

// Select All Functionality
const selectAll = (event, yearName, semester) => {
  const subjectsInYearAndSemester = filteredSubjects(yearName, semester).map(subject => subject.id);

  if (event.target.checked) {
    selectedSubjects.value = [...new Set([...selectedSubjects.value, ...subjectsInYearAndSemester])];
  } else {
    selectedSubjects.value = selectedSubjects.value.filter(id => !subjectsInYearAndSemester.includes(id));
  }
};

// Check if all are selected in the current year and semester
const areAllSelected = (yearName, semester) => {
  const subjectsInYearAndSemester = filteredSubjects(yearName, semester).map(subject => subject.id);
  return subjectsInYearAndSemester.every(id => selectedSubjects.value.includes(id));
};
</script>
