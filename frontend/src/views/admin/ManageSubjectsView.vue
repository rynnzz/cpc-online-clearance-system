<template>
  <div class="p-8 bg-gray-900 text-gray-100 min-h-screen w-full relative">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-semibold">Manage Subjects</h1>

      <!-- School Year Filter -->
      <div class="flex items-center space-x-2">
        <label for="schoolYear" class="text-lg font-semibold">School Year:</label>
        <select id="schoolYear" v-model="selectedSchoolYear" class="input input-bordered w-40 bg-gray-800 text-white">
          <option v-for="year in schoolYears" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
    </div>

    <!-- Department Tabs -->
    <div class="flex space-x-4 mb-6">
      <button
        v-for="dept in departments"
        :key="dept"
        @click="selectedDepartment = dept"
        :class="['btn', selectedDepartment === dept ? 'btn-accent' : 'btn-secondary']"
      >
        {{ dept }}
      </button>
    </div>

    <!-- Button to Open Add Subject Modal -->
    <button @click="openAddModal" class="btn btn-primary mb-6 mr-4">Add New Subject</button>
    <button @click="openBulkAddModal" class="btn btn-secondary">
          <i class="fas fa-file-upload mr-2"></i> Bulk Add
        </button>

    <!-- Add Subject Modal -->
    <div v-if="showAddModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg mx-4">
        <h2 class="text-2xl font-semibold mb-4 text-center">Add New Subject</h2>
        
        <!-- Add Form Content -->
        <form @submit.prevent="addSubject" class="space-y-4">
          <SubjectForm :subjectData.sync="subjectData" :departments="departments" :yearNames="yearNames" :schoolYears="schoolYears" />
          <div class="flex justify-end space-x-4 mt-4">
            <button type="button" @click="closeAddModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Subject</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Subject Modal -->
    <div v-if="showEditModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg mx-4">
        <h2 class="text-2xl font-semibold mb-4 text-center">Edit Subject</h2>

        <!-- Edit Form Content -->
        <form @submit.prevent="saveEdit" class="space-y-4">
          <SubjectForm :subjectData.sync="subjectData" :departments="departments" :yearNames="yearNames" :schoolYears="schoolYears" />
          <div class="flex justify-end space-x-4 mt-4">
            <button type="button" @click="closeEditModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>



    <!-- Subject Tables by Year Level -->
    <div v-for="year in yearNames" :key="year" class="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ yearNames[year] }} Subjects - {{ selectedDepartment }} - {{ selectedSchoolYear }}</h2>
      <table class="table w-full">
        <thead>
          <tr class="bg-gray-700">
            <th class="p-4 text-sm text-left">
              <input type="checkbox" @change="selectAll($event, year)" :checked="areAllSelected(year)" />
            </th>
            <th class="p-4 text-left">#</th>
            <th class="p-4 text-left">Subject Code</th>
            <th class="p-4 text-left">Subject Name</th>
            <th class="p-4 text-left">Semester</th>
            <th class="p-4 text-left">Units</th>
            <th class="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(subject, index) in filteredSubjectsByYear(yearNames[year])" :key="subject.id" class="hover:bg-gray-600">
            <td class="p-4 text-sm">
              <input type="checkbox" :value="subject.id" v-model="selectedSubjects" />
            </td>
            <td class="p-4">{{ index + 1 }}</td>
            <td class="p-4">{{ subject.code }}</td>
            <td class="p-4">{{ subject.name }}</td>
            <td class="p-4">{{ subject.semester === 1 ? '1st Semester' : '2nd Semester' }}</td>
            <td class="p-4">{{ subject.units }}</td>
            <td class="p-4 flex space-x-2">
              <button @click="openEditModal(subject)" class="btn btn-sm btn-warning">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteSubject(subject.id)" class="btn btn-sm btn-error">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="filteredSubjectsByYear(yearNames[year]).length === 0">
            <td colspan="7" class="p-4 text-center text-gray-500">No subjects found for {{ yearNames[year] }} in {{ selectedDepartment }} for {{ selectedSchoolYear }}</td>
          </tr>
        </tbody>
      </table>
      
    </div>
        <!-- Bulk Action Button -->
        <div v-if="selectedSubjects.length > 0" class="mb-4">
      <button @click="bulkDeleteSubjects" class="btn btn-error">Delete Selected ({{ selectedSubjects.length }})</button>
    </div>
         <!-- Bulk Add Modal -->
         <div v-if="isBulkAddModalOpen" class="modal modal-open">
      <div class="modal-box bg-gray-800 text-white">
        <h2 class="text-2xl font-semibold mb-4">Bulk Add Subjects</h2>
        <form @submit.prevent="handleBulkAdd">
          <div class="mb-4">
            <input type="file" @change="handleFileUpload" class="file-input file-input-bordered w-full bg-gray-700" accept=".xlsx, .xls" />
          </div>
          <div class="modal-action mt-4">
            <button type="button" class="btn btn-secondary" @click="closeBulkAddModal">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Subjects</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useSubjectStore } from '@/stores/subjectStore';
import SubjectForm from '@/components/SubjectForm.vue';

const subjectStore = useSubjectStore();

const departments = ['BEED', 'BSIT', 'BSED - MAJOR IN SCIENCE', 'BSED - MAJOR IN ENGLISH', 'BSHM'];
const yearNames = {
  '1st Year': '1st Year',
  '2nd Year': '2nd Year',
  '3rd Year': '3rd Year',
  '4th Year': '4th Year'
};

const selectedDepartment = ref(departments[0]);
const selectedSchoolYear = ref('');
const subjectData = ref({ name: '', code: '', department: '', year: '1st Year', schoolYear: '', semester: 1, units: 0 });
const showAddModal = ref(false);
const showEditModal = ref(false);
const editSubjectId = ref(null);
const selectedSubjects = ref([]);
const file = ref(null)
const isBulkAddModalOpen = ref(false)

const openBulkAddModal = () => { isBulkAddModalOpen.value = true }
const closeBulkAddModal = () => { isBulkAddModalOpen.value = false }

const handleFileUpload = (event) => {
  file.value = event.target.files[0]
}

const handleBulkAdd = async () => {
  if (!file.value) {
    alert("Please upload an Excel file.")
    return
  }
  try {
    const formData = new FormData()
    formData.append('file', file.value)
    await subjectStore.bulkAddSubjects(formData)
    alert("Subjects added successfully.")
    closeBulkAddModal()
  } catch (error) {
    console.error("Error adding Subjects:", error)
  }
}

// Dynamically populate schoolYears based on subjects data
const schoolYears = computed(() => {
  const years = new Set(subjectStore.subjects.map(subject => subject.school_year));
  return Array.from(years).sort();
});

onMounted(() => {
  subjectStore.getAllSubjects();
});

const filteredSubjectsByYear = (yearName) => {
  return subjectStore.subjects.filter(
    subject => 
      subject.department === selectedDepartment.value &&
      subject.year === yearName &&
      subject.school_year === selectedSchoolYear.value
  );
};

const openAddModal = () => {
  subjectData.value = { name: '', code: '', department: '', year: '1st Year', schoolYear: '', semester: 1, units: 0 };
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const openEditModal = (subject) => {
  subjectData.value = { 
    ...subject, 
    year: subject.year,
    schoolYear: subject.school_year
  };
  editSubjectId.value = subject.id;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const addSubject = async () => {
  await subjectStore.addSubject(subjectData.value);
  subjectStore.getAllSubjects();
  closeAddModal();
};

const saveEdit = async () => {
  await subjectStore.updateSubject(editSubjectId.value, subjectData.value);
  subjectStore.getAllSubjects();
  closeEditModal();
};

watch(schoolYears, (newSchoolYears) => {
  if (newSchoolYears.length > 0 && !selectedSchoolYear.value) {
    selectedSchoolYear.value = newSchoolYears[0];
  }
});

// Delete a single subject
const deleteSubject = async (id) => {
  try {
    await subjectStore.deleteSubject(id);
    await subjectStore.getAllSubjects();
  } catch (error) {
    console.error('Error deleting subject:', error);
  }
};

// Bulk Delete Function
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
const selectAll = (event, yearName) => {
  const subjectsInYear = filteredSubjectsByYear(yearName).map(subject => subject.id);

  if (event.target.checked) {
    selectedSubjects.value = [...new Set([...selectedSubjects.value, ...subjectsInYear])];
  } else {
    selectedSubjects.value = selectedSubjects.value.filter(id => !subjectsInYear.includes(id));
  }
};

// Computed Property for Checking if All are Selected in the Current Year Level
const areAllSelected = (yearName) => {
  const subjectsInYear = filteredSubjectsByYear(yearName).map(subject => subject.id);
  return subjectsInYear.every(id => selectedSubjects.value.includes(id));
};
</script>
